import uuid
from django.db import models


class UUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class TimeStampedModel(UUIDModel):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SiteConfiguration(UUIDModel):
    """Singleton: only one row ever exists."""
    restaurant_name = models.CharField(max_length=255)
    tagline = models.CharField(max_length=255, blank=True)
    logo = models.ImageField(upload_to="site/", blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True)
    whatsapp_number = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    description = models.TextField(blank=True)
    opening_hours = models.TextField(blank=True)
    currency_symbol = models.CharField(max_length=5, default="₦")
    currency_code = models.CharField(max_length=3, default="NGN")
    delivery_enabled = models.BooleanField(default=True)
    pickup_enabled = models.BooleanField(default=True)
    default_delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        verbose_name = "Site configuration"

    def save(self, *args, **kwargs):
        # enforce singleton
        existing = SiteConfiguration.objects.exclude(pk=self.pk).first()
        if existing:
            self.pk = existing.pk
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(defaults={"restaurant_name": "My Restaurant"})
        return obj

    def __str__(self):
        return self.restaurant_name