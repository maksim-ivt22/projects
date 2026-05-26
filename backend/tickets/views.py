from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.contrib.gis.geos import Point
from django.utils.timezone import now
from django.utils.dateparse import parse_datetime, parse_date

from rest_framework import permissions, generics, status
from rest_framework import viewsets
from rest_framework.response import Response

from .serializers import (
    TicketSerializer,
    TicketCategorySerializer,
    TicketTypeWithCategorySerializer,
    TicketCategoryDetailsSerializer,
    TicketStatusUpdateSerializer,
)
from .permissions import IsOwnerOrStaffByRole, IsStaffByRole
from .models import Ticket, TicketGroup, TicketCategory, TicketType, TicketStatusHistory


import logging

logger = logging.getLogger(__name__)

ALLOWED_STATUS_TRANSITIONS = {
    Ticket.STATUS_PENDING_REVIEW: {Ticket.STATUS_IN_PROGRESS, Ticket.STATUS_REJECTED},
    Ticket.STATUS_IN_PROGRESS: {Ticket.STATUS_COMPLETED, Ticket.STATUS_REJECTED},
    Ticket.STATUS_COMPLETED: set(),
    Ticket.STATUS_REJECTED: set(),
}


class TicketListView(generics.ListCreateAPIView):
    queryset = Ticket.objects.all().order_by("-created_at")
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the tickets
        for the currently authenticated user.
        """

        user = self.request.user
        base_queryset = Ticket.objects.all().order_by("-created_at")
        if user and user.is_authenticated:
            if user.is_staff or user.is_superuser:
                queryset = base_queryset
            else:
                queryset = base_queryset.filter(user=user)
            return self.apply_filters(queryset)
        return Ticket.objects.none()

    def apply_filters(self, queryset):
        params = self.request.query_params

        status_value = params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)

        type_id = params.get("type_id")
        if type_id:
            queryset = queryset.filter(type_id=type_id)

        category_id = params.get("category_id")
        if category_id:
            queryset = queryset.filter(type__category_id=category_id)

        date_from = params.get("date_from")
        if date_from:
            parsed_from = parse_datetime(date_from)
            if parsed_from is None:
                parsed_date = parse_date(date_from)
                if parsed_date:
                    queryset = queryset.filter(created_at__date__gte=parsed_date)
            else:
                queryset = queryset.filter(created_at__gte=parsed_from)

        date_to = params.get("date_to")
        if date_to:
            parsed_to = parse_datetime(date_to)
            if parsed_to is None:
                parsed_date = parse_date(date_to)
                if parsed_date:
                    queryset = queryset.filter(created_at__date__lte=parsed_date)
            else:
                queryset = queryset.filter(created_at__lte=parsed_to)

        latitude = params.get("latitude")
        longitude = params.get("longitude")
        radius_m = params.get("radius_m")
        if latitude and longitude and radius_m:
            try:
                center = Point(float(longitude), float(latitude), srid=4326)
                queryset = queryset.filter(location__distance_lte=(center, D(m=float(radius_m))))
            except (TypeError, ValueError):
                pass

        ordering = params.get("ordering", "-created_at")
        allowed_ordering = {
            "created_at",
            "-created_at",
            "status",
            "-status",
        }
        if ordering in allowed_ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    def perform_create(self, serializer):
        location = serializer.validated_data.get("location")
        address = serializer.validated_data.get("address")
        type = serializer.validated_data.get("type")
        nearby_ticket = (
            Ticket.objects.filter(
                location__distance_lte=(location, D(m=150)), type=type
            )
            .annotate(distance=Distance("location", location))
            .order_by("distance")
            .first()
        )
        if nearby_ticket:
            current_time = now()
            existing_group = nearby_ticket.group
            existing_group.last_created_on = current_time
            existing_group.save(update_fields=["last_created_on"])
            serializer.save(user=self.request.user, group=nearby_ticket.group)
        else:
            group = TicketGroup.objects.create(title=f"{address} - {type}")
            serializer.save(user=self.request.user, group=group)


class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TicketSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsOwnerOrStaffByRole,
    ]
    queryset = Ticket.objects.all()


class TicketStatusUpdateView(generics.GenericAPIView):
    serializer_class = TicketStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffByRole]
    queryset = Ticket.objects.all()

    def post(self, request, *args, **kwargs):
        ticket = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target_status = serializer.validated_data["status"]
        comment = serializer.validated_data.get("comment", "")
        current_status = ticket.status

        if target_status == current_status:
            return Response(
                {"detail": "Заявка уже находится в указанном статусе."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        allowed_next = ALLOWED_STATUS_TRANSITIONS.get(current_status, set())
        if target_status not in allowed_next:
            return Response(
                {
                    "detail": (
                        f"Недопустимый переход: {current_status} -> {target_status}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            from_status=current_status,
            to_status=target_status,
            changed_by=request.user,
            comment=comment,
        )
        ticket.status = target_status
        ticket.save(update_fields=["status"])
        return Response(TicketSerializer(ticket).data, status=status.HTTP_200_OK)


class TicketTypeViewSet(viewsets.ModelViewSet):
    queryset = TicketType.objects.all().order_by("title")
    serializer_class = TicketTypeWithCategorySerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsStaffByRole()]


class TicketCategoryListView(generics.ListCreateAPIView):
    queryset = TicketCategory.objects.all().order_by("title")
    serializer_class = TicketCategorySerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsStaffByRole()]


class TicketCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TicketCategory.objects.all()
    serializer_class = TicketCategoryDetailsSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsStaffByRole()]
