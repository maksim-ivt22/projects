import secrets
import smtplib
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import Group
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EmailVerificationCode, User
from .serializers import (
    GroupSerializer,
    SendVerificationCodeSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    VerifyEmailCodeSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """

    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser]


class SendVerificationCodeView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SendVerificationCodeSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        code = f"{secrets.randbelow(1_000_000):06d}"
        expires_at = timezone.now() + timedelta(minutes=10)

        EmailVerificationCode.objects.create(
            email=email,
            code=code,
            expires_at=expires_at,
        )

        try:
            send_mail(
                subject="Код подтверждения email",
                message=f"Ваш код подтверждения: {code}. Код действует 10 минут.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except (
            OSError,
            TimeoutError,
            ConnectionRefusedError,
            smtplib.SMTPException,
        ):
            if settings.EMAIL_VERIFICATION_DEMO_MODE:
                return Response(
                    {
                        "detail": (
                            "SMTP временно недоступен. Код подтверждения создан "
                            "в demo-режиме."
                        ),
                        "verification_code": code,
                    }
                )

            return Response(
                {"detail": "Сервис отправки email временно недоступен"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({"detail": "Код подтверждения отправлен на email"})


class VerifyEmailCodeView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = VerifyEmailCodeSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]
        verification_code = (
            EmailVerificationCode.objects.filter(email__iexact=email, is_used=False)
            .order_by("-created_at")
            .first()
        )

        if not verification_code or verification_code.code != code:
            return Response(
                {"detail": "Неверный код подтверждения"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if verification_code.expires_at <= timezone.now():
            verification_code.is_used = True
            verification_code.save(update_fields=["is_used"])
            return Response(
                {"detail": "Код истёк, запросите новый"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        verification_code.is_used = True
        verification_code.save(update_fields=["is_used"])

        return Response({"verified": True})


class UserRegisterView(generics.CreateAPIView):
    """
    API view for user registration. Accepts POST requests with user data.
    """

    queryset = User.objects.all()  # Required for CreateAPIView, can be empty queryset
    permission_classes = (permissions.AllowAny,)  # Anyone can register
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        """
        Override the default create method to return user data using
        UserSerializer upon successful registration.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()  # Calls serializer.create()

        # Optionally, serialize the created user with a different serializer for the response
        response_serializer = UserSerializer(
            user, context=self.get_serializer_context()
        )

        headers = self.get_success_headers(response_serializer.data)
        return Response(
            response_serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class CurrentUserView(generics.GenericAPIView):  # Or inherit from APIView
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request, *args, **kwargs):
        """
        Determine the current user by their token, and return their data
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
