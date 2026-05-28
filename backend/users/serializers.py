from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers

from .models import EmailVerificationCode, User
from .roles import ROLE_CITIZEN


class SendVerificationCodeSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        normalized_email = User.objects.normalize_email(value)
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError(
                "Пользователь с таким email уже зарегистрирован."
            )
        return normalized_email


class VerifyEmailCodeSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    code = serializers.CharField(required=True, min_length=6, max_length=6)

    def validate_email(self, value):
        return User.objects.normalize_email(value)

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Код должен состоять из 6 цифр.")
        return value


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
        Check if the email is already taken and confirmed.
        """
        normalized_email = User.objects.normalize_email(value)
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError(
                "Пользователь с таким email уже зарегистрирован."
            )

        verified_code = (
            EmailVerificationCode.objects.filter(
                email__iexact=normalized_email,
                is_used=True,
                expires_at__gt=timezone.now(),
            )
            .order_by("-created_at")
            .first()
        )
        if not verified_code:
            raise serializers.ValidationError("Email не подтверждён.")

        return normalized_email

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
        citizen_group, _ = Group.objects.get_or_create(name=ROLE_CITIZEN)
        user.groups.add(citizen_group)
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
