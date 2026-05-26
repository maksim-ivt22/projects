from django.contrib.auth.models import Group
from django.test import TestCase

from users.roles import ROLE_CITIZEN
from users.serializers import UserRegistrationSerializer


class UserRegistrationSerializerTests(TestCase):
    def test_create_assigns_citizen_group(self):
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
