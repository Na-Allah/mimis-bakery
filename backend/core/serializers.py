from rest_framework import serializers

from .models import SiteConfiguration


class SiteConfigurationSerializer(serializers.ModelSerializer):
    default_delivery_fee = serializers.DecimalField(
        max_digits=10, decimal_places=2, coerce_to_string=False
    )

    class Meta:
        model = SiteConfiguration
        fields = [
            "restaurant_name", "tagline", "logo", "phone", "whatsapp_number",
            "email", "address", "description", "opening_hours",
            "currency_symbol", "currency_code", "delivery_enabled",
            "pickup_enabled", "default_delivery_fee",
        ]
        extra_kwargs = {"logo": {"required": False}}