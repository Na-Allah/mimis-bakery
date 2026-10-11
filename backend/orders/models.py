import secrets
import string
import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone
from core.models import TimeStampedModel, UUIDModel


class OrderType(models.TextChoices):
    PICKUP = "PICKUP", "Pickup"
    DELIVERY = "DELIVERY", "Delivery"


class OrderStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    CONFIRMED = "CONFIRMED", "Confirmed"
    PREPARING = "PREPARING", "Preparing"
    READY = "READY", "Ready"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY", "Out for delivery"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"


class WhatsAppStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    SENT = "SENT", "Sent"
    FAILED = "FAILED", "Failed"


def generate_order_number():
    """ORD-YYMMDD-XXXXX"""
    alphabet = string.ascii_uppercase + string.digits
    suffix = "".join(secrets.choice(alphabet) for _ in range(5))
    return f"ORD-{timezone.now():%y%m%d}-{suffix}"


class Order(TimeStampedModel):
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    tracking_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    idempotency_key = models.UUIDField(null=True, blank=True, unique=True, editable=False)
    completed_at = models.DateTimeField(null=True, blank=True, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="orders",
    )
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=30)
    customer_email = models.EmailField(blank=True)
    order_type = models.CharField(max_length=10, choices=OrderType.choices)
    delivery_address = models.TextField(blank=True)
    customer_note = models.TextField(blank=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING)
    courier = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.SET_NULL,
    null=True, blank=True,
    related_name="deliveries",
    limit_choices_to={"role": "COURIER"},
)
    whatsapp_status = models.CharField(
        max_length=10, choices=WhatsAppStatus.choices, default=WhatsAppStatus.PENDING
    )
    whatsapp_message_id = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["customer_phone"]),
            models.Index(fields=["user", "-created_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=~models.Q(order_type="DELIVERY") | ~models.Q(delivery_address=""),
                name="delivery_requires_address",
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.order_number:
            for _ in range(10):  # retry on the rare collision
                candidate = generate_order_number()
                if not Order.objects.filter(order_number=candidate).exists():
                    self.order_number = candidate
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return self.order_number


class OrderItem(UUIDModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        "catalog.Product",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="order_items",
    )
    product_name = models.CharField(max_length=255)          # snapshot
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)  # snapshot
    quantity = models.PositiveIntegerField()
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(quantity__gte=1), name="orderitem_qty_gte_1"),
        ]

    def save(self, *args, **kwargs):
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} × {self.product_name}"


class NotificationLog(UUIDModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="notifications")
    channel = models.CharField(max_length=20, default="WHATSAPP")
    status = models.CharField(
        max_length=10, choices=WhatsAppStatus.choices, default=WhatsAppStatus.PENDING
    )
    provider_message_id = models.CharField(max_length=255, blank=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    last_error = models.TextField(blank=True)
    message_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status", "-created_at"])]

    def __str__(self):
        return f"{self.order.order_number} · {self.status}"