from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth.models import Group
from django.core import mail
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from users.models import EmailVerificationCode, User
from users.roles import ROLE_CITIZEN
from users.serializers import UserRegistrationSerializer


class UserRegistrationSerializerTests(TestCase):
    def test_create_assigns_citizen_group(self):
        EmailVerificationCode.objects.create(
            email="student@example.com",
            code="123456",
            expires_at=timezone.now() + timedelta(minutes=10),
            is_used=True,
        )

        serializer = UserRegistrationSerializer(
            data={
                "email": "student@example.com",
                "full_name": "Student Test",
                "password": "StrongPass123!",
            }
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertTrue(user.groups.filter(name=ROLE_CITIZEN).exists())
        self.assertTrue(Group.objects.filter(name=ROLE_CITIZEN).exists())


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class EmailVerificationCodeFlowTests(TestCase):
    def test_send_verification_code_creates_code_and_sends_email(self):
        response = self.client.post(
            reverse("auth:send_verification_code"),
            {"email": "new@example.com"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json()["detail"], "Код подтверждения отправлен на email"
        )

        verification_code = EmailVerificationCode.objects.get(email="new@example.com")
        self.assertEqual(len(verification_code.code), 6)
        self.assertFalse(verification_code.is_used)
        self.assertGreater(verification_code.expires_at, timezone.now())
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(verification_code.code, mail.outbox[0].body)

    @override_settings(EMAIL_VERIFICATION_DEMO_MODE=True)
    @patch("users.views.send_mail", side_effect=OSError("SMTP unavailable"))
    def test_send_verification_code_returns_demo_code_when_smtp_fails(
        self, mocked_send_mail
    ):
        response = self.client.post(
            reverse("auth:send_verification_code"),
            {"email": "demo@example.com"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(
            data["detail"],
            "SMTP временно недоступен. Код подтверждения создан в demo-режиме.",
        )
        self.assertEqual(len(data["verification_code"]), 6)

        verification_code = EmailVerificationCode.objects.get(email="demo@example.com")
        self.assertEqual(data["verification_code"], verification_code.code)
        self.assertFalse(verification_code.is_used)
        mocked_send_mail.assert_called_once()

    @override_settings(EMAIL_VERIFICATION_DEMO_MODE=False)
    @patch("users.views.send_mail", side_effect=OSError("SMTP unavailable"))
    def test_send_verification_code_returns_503_when_smtp_fails_without_demo_mode(
        self, mocked_send_mail
    ):
        response = self.client.post(
            reverse("auth:send_verification_code"),
            {"email": "smtp-down@example.com"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.json(),
            {"detail": "Сервис отправки email временно недоступен"},
        )
        self.assertTrue(
            EmailVerificationCode.objects.filter(
                email="smtp-down@example.com"
            ).exists()
        )
        mocked_send_mail.assert_called_once()

    def test_verify_code_marks_latest_unused_code_as_used(self):
        verification_code = EmailVerificationCode.objects.create(
            email="new@example.com",
            code="123456",
            expires_at=timezone.now() + timedelta(minutes=10),
        )

        response = self.client.post(
            reverse("auth:verify_code"),
            {"email": "new@example.com", "code": "123456"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"verified": True})
        verification_code.refresh_from_db()
        self.assertTrue(verification_code.is_used)

    def test_verify_code_rejects_wrong_code(self):
        EmailVerificationCode.objects.create(
            email="new@example.com",
            code="123456",
            expires_at=timezone.now() + timedelta(minutes=10),
        )

        response = self.client.post(
            reverse("auth:verify_code"),
            {"email": "new@example.com", "code": "000000"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Неверный код подтверждения")

    def test_verify_code_rejects_expired_code(self):
        verification_code = EmailVerificationCode.objects.create(
            email="new@example.com",
            code="123456",
            expires_at=timezone.now() - timedelta(minutes=1),
        )

        response = self.client.post(
            reverse("auth:verify_code"),
            {"email": "new@example.com", "code": "123456"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Код истёк, запросите новый")
        verification_code.refresh_from_db()
        self.assertTrue(verification_code.is_used)

    def test_register_requires_verified_email(self):
        response = self.client.post(
            reverse("auth:register"),
            {
                "email": "new@example.com",
                "full_name": "New User",
                "password": "StrongPass123!",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(email="new@example.com").exists())

    def test_register_accepts_recent_verified_email(self):
        EmailVerificationCode.objects.create(
            email="new@example.com",
            code="123456",
            expires_at=timezone.now() + timedelta(minutes=10),
            is_used=True,
        )

        response = self.client.post(
            reverse("auth:register"),
            {
                "email": "new@example.com",
                "full_name": "New User",
                "password": "StrongPass123!",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email="new@example.com").exists())

    def test_register_rejects_existing_email(self):
        User.objects.create_user(
            email="new@example.com",
            full_name="Existing User",
            password="StrongPass123!",
        )

        response = self.client.post(
            reverse("auth:send_verification_code"),
            {"email": "new@example.com"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
