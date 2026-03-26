from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration. Handles validation and creation.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        validators=[validate_password],  # Use Django's password validators
    )

    class Meta:
        model = User
        fields = ("email", "full_name", "password")
        extra_kwargs = {"full_name": {"required": True}, "email": {"required": True}}

    def validate_email(self, value):
        """
        Check if the email is already taken.
        """
        # Normalize email before checking uniqueness (optional but good practice)
        normalized_email = User.objects.normalize_email(value)
        if User.objects.filter(email=normalized_email).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return normalized_email  # Return normalized email

    def create(self, validated_data):
        """
        Create and return a new user instance, given the validated data.
        Uses the custom user manager's create_user method.
        """
        # Extract the password to pass separately to create_user
        password = validated_data.pop("password")

        # Use the UserManager.create_user method which handles password hashing
        user = User.objects.create_user(
            **validated_data,  # Includes email, full_name, etc.
            password=password,
        )
        # create_user already saves the user and hashes the password.
        return user


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name", "email", "groups"]


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ["name"]
