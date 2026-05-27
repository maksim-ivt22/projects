from rest_framework.exceptions import ValidationError
from django.contrib.gis.geos import Point
from rest_framework import serializers

from .models import Ticket, TicketCategory, TicketType, TicketStatusHistory
from users.serializers import UserSerializer


class TicketCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketCategory
        fields = ("id", "title", "score")


class TicketTypeWithCategorySerializer(serializers.ModelSerializer):
    category = TicketCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=TicketCategory.objects.all(),
        write_only=True,
        required=True,
        source="category",
    )

    class Meta:
        model = TicketType
        fields = ("id", "title", "category", "score", "category_id")
        read_only_fields = ("category_id",)


class TicketTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketType
        fields = "__all__"


class TicketCategoryDetailsSerializer(serializers.ModelSerializer):
    types = TicketTypeSerializer(many=True, read_only=True)

    class Meta:
        model = TicketCategory
        fields = ("id", "title", "score", "types")


class TicketSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(
        required=True,
        min_value=-90.0,
        max_value=90.0,
    )
    longitude = serializers.FloatField(
        required=True,
        min_value=-180.0,
        max_value=180.0,
    )

    user = UserSerializer(read_only=True)
    type = TicketTypeWithCategorySerializer(read_only=True)
    type_id = serializers.PrimaryKeyRelatedField(
        queryset=TicketType.objects.all(), write_only=True, required=True, source="type"
    )
    status_history = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Ticket
        fields = (
            "id",
            "latitude",
            "address",
            "longitude",
            "user",
            "title",
            "description",
            "created_at",
            "status",
            "image",
            "type",
            "type_id",
            "status_history",
        )
        read_only_fields = ("user", "status", "created_at", "type")

    def validate(self, data):
        """
        Create the location Point from latitude and longitude.
        """
        lat = data.get("latitude")
        lon = data.get("longitude")

        if lat is not None and lon is not None:
            data["location"] = Point(lon, lat, srid=4326)
            data.pop("latitude", None)
            data.pop("longitude", None)
        elif self.instance is None:
            raise ValidationError(
                "Latitude and Longitude must be provided to create a location."
            )

        return data

    def get_status_history(self, obj: Ticket):
        history = obj.status_history.select_related("changed_by").all()
        return TicketStatusHistorySerializer(history, many=True).data


class TicketStatusHistorySerializer(serializers.ModelSerializer):
    changed_by = UserSerializer(read_only=True)

    class Meta:
        model = TicketStatusHistory
        fields = ("id", "from_status", "to_status", "comment", "changed_by", "created_at")


class TicketStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Ticket.STATUS_CHOICES)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=1000)
