from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(read_only=True)

    class Meta :
        model = User
        fields = (
            "id",
            "full_name",
            "delivery_address",
            "email",
            "phone_number",
            "role",
            "is_admin"
        )


from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = User
        fields = [
            "full_name",
            "email",
            "phone_number",
            "password",
            "delivery_address",
        ]

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate_phone_number(self, value):
        value = User.normalize_phone_number(value)

        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError(
                "A user with this phone number already exists."
            )

        return value

    def validate_password(self, value):
        validate_password(value)
        return value


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["full_name", "phone_number"]

    def validate_full_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Enter your name.")
        return value

    def validate_phone_number(self, value):
        value = User.normalize_phone_number(value)
        validator = User._meta.get_field("phone_number").validators
        for validate in validator:
            validate(value)
        if User.objects.exclude(pk=self.instance.pk).filter(phone_number=value).exists():
            raise serializers.ValidationError("This phone number is already in use.")
        return value


class LoginSerialer(serializers.Serializer):

    username = serializers.CharField(max_length=50)
    password = serializers.CharField(write_only=True, trim_whitespace=False)