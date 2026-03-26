from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.utils.timezone import now

from rest_framework import permissions, generics
from rest_framework import viewsets

from .serializers import (
    TicketSerializer,
    TicketCategorySerializer,
    TicketTypeWithCategorySerializer,
    TicketCategoryDetailsSerializer,
)
from .permissions import OwnTicketPermission
from .models import Ticket, TicketGroup, TicketCategory, TicketType


import logging

logger = logging.getLogger(__name__)


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
        if user and user.is_authenticated:
            return Ticket.objects.filter(user=user).order_by("-created_at")
        return Ticket.objects.none()

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
        OwnTicketPermission,
    ]
    queryset = Ticket.objects.all()


class TicketTypeViewSet(viewsets.ModelViewSet):
    queryset = TicketType.objects.all().order_by("title")
    serializer_class = TicketTypeWithCategorySerializer


class TicketCategoryListView(generics.ListCreateAPIView):
    queryset = TicketCategory.objects.all().order_by("title")
    serializer_class = TicketCategorySerializer


class TicketCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TicketCategory.objects.all()
    serializer_class = TicketCategoryDetailsSerializer
