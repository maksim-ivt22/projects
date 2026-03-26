from django.urls import path
from rest_framework import routers
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from . import views

router = routers.SimpleRouter()
router.register(r"users", views.UserViewSet)
router.register(r"groups", views.GroupViewSet)

auth_urlpatterns = [
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", views.UserRegisterView.as_view(), name="register"),
    path("me/", views.CurrentUserView.as_view(), name="me"),
]
