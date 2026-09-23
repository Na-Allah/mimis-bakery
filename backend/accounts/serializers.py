from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from accounts.model import User


class UserSerializer(serializers.ModelSerializer):

    class Meta :
        model = User
        fields = (
            "id",
            "full_name",
            "delivery_address",
            "email",
            "phone_number",
            "role",
        )


class RegisterSerializer(serializers.Serializer):
    full_name = serilizers.CharField(max_length=50)
    delivery_address = serializers.TextField()
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=32)
    password = serializers.CharField(write_only=True, trim_whitespace=False)


    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(email__iexact=email).exist():
            raise serializers.ValidationError(
                "An accounts with this phone number already exist. ", code= "email taken"
            )

            return email

    def validate_password(self,value):
        validate_password(value)
        return value


class LoginSerialer(serializers.Serializer):

    username = serialzers.CharField(max_length=50)
    password = serializers.CharField(write_only=True, trim_whitespace=False)