from django.urls import path

from rest_framework.routers import SimpleRouter

from .views import (
    TicketDetailView,
    TicketListView,
    TicketTypeViewSet,
    TicketCategoryDetailView,
    TicketCategoryListView,
    TicketStatusUpdateView,
)

router = SimpleRouter()
router.register(r"ticket-types", TicketTypeViewSet)

app_name = "tickets"

urlpatterns = [
    path("", TicketListView.as_view(), name="list"),
    path("<int:pk>/", TicketDetailView.as_view(), name="detail"),
    path("<int:pk>/status/", TicketStatusUpdateView.as_view(), name="update-status"),
]

ticket_category_urlpatterns = [
    path("", TicketCategoryListView.as_view(), name="list"),
    path("<int:pk>/", TicketCategoryDetailView.as_view(), name="detail"),
]
