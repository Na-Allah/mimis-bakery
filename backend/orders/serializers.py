import uuid

from django.db import transaction
from rest_framework import serializers

from catalog.models import Product
from core.models import SiteConfiguration
from accounts.models import User
from .models import NotificationLog, Order, OrderItem, OrderType

MONEY = dict(max_digits=12, decimal_places=2, coerce_to_string=False)


# ---------- read ----------
class OrderItemSerializer(serializers.ModelSerializer):
    order_id = serializers.UUIDField(read_only=True)
    product_id = serializers.UUIDField(read_only=True)
    unit_price = serializers.DecimalField(**MONEY)
    subtotal = serializers.DecimalField(**MONEY)

    class Meta:
        model = OrderItem
        fields = [
            "id", "order_id", "product_id", "product_name",
            "unit_price", "quantity", "subtotal", "created_at",
        ]


class OrderSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(read_only=True)
    tracking_token = serializers.UUIDField(read_only=True)
    subtotal = serializers.DecimalField(**MONEY)
    delivery_fee = serializers.DecimalField(**MONEY)
    total = serializers.DecimalField(**MONEY)
    items = OrderItemSerializer(many=True, read_only=True)
    courier_id = serializers.UUIDField(read_only=True)
    courier_name = serializers.CharField(source="courier.full_name", read_only=True, default=None)

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "tracking_token", "user_id", "customer_name", "customer_phone",
            "customer_email", "order_type", "delivery_address", "customer_note",
            "subtotal", "delivery_fee", "total", "status", "whatsapp_status",
            "whatsapp_message_id", "created_at", "updated_at", "items",
            "courier_id", "courier_name"
        ]


class CustomerOrderSerializer(OrderSerializer):
    courier_contact = serializers.SerializerMethodField()

    class Meta(OrderSerializer.Meta):
        fields = OrderSerializer.Meta.fields + ["courier_contact"]

    def get_courier_contact(self, order):
        request = self.context.get("request")
        if (
            not request
            or not request.user.is_authenticated
            or (not request.user.is_admin and order.user_id != request.user.id)
            or order.order_type != OrderType.DELIVERY
            or not order.courier_id
        ):
            return None

        return {
            "name": order.courier.full_name,
            "phone_number": order.courier.phone_number,
        }


class NotificationLogSerializer(serializers.ModelSerializer):
    order_id = serializers.UUIDField(read_only=True)
    order_number = serializers.CharField(source="order.order_number", read_only=True)

    class Meta:
        model = NotificationLog
        fields = [
            "id", "order_id", "order_number", "channel", "status",
            "provider_message_id", "attempts", "last_error", "message_text",
            "created_at", "sent_at",
        ]


class CourierOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name", "phone_number"]


class CourierAssignmentSerializer(serializers.Serializer):
    courier_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.COURIER, is_active=True),
        allow_null=True,
    )


# ---------- write ----------
class CartLineSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, max_value=99)


class CreateOrderSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=255)
    customer_phone = serializers.CharField(max_length=30)
    customer_email = serializers.EmailField(required=False, allow_blank=True)
    order_type = serializers.ChoiceField(choices=OrderType.choices)
    delivery_address = serializers.CharField(required=False, allow_blank=True)
    customer_note = serializers.CharField(required=False, allow_blank=True)
    items = CartLineSerializer(many=True, allow_empty=False)

    def validate(self, attrs):
        config = SiteConfiguration.load()
        order_type = attrs["order_type"]

        if order_type == OrderType.DELIVERY:
            if not config.delivery_enabled:
                raise serializers.ValidationError({"order_type": "Delivery is currently unavailable."})
            if not attrs.get("delivery_address", "").strip():
                raise serializers.ValidationError({"delivery_address": "Delivery address is required."})
        elif not config.pickup_enabled:
            raise serializers.ValidationError({"order_type": "Pickup is currently unavailable."})

        # merge duplicate lines
        quantities = {}
        for line in attrs["items"]:
            pid = line["product_id"]
            quantities[pid] = min(99, quantities.get(pid, 0) + line["quantity"])

        products = {
            p.id: p
            for p in Product.objects.filter(
                id__in=quantities.keys(),
                is_available=True,
                category__is_active=True,
                category__section__is_active=True,
            )
        }
        if set(quantities) - set(products):
            raise serializers.ValidationError(
                {"items": "Some items are no longer available. Please refresh your cart."}
            )

        attrs["_lines"] = [(products[pid], qty) for pid, qty in quantities.items()]
        attrs["_config"] = config
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        lines = validated_data.pop("_lines")
        config = validated_data.pop("_config")
        validated_data.pop("items")
        user = validated_data.pop("user", None)
        idempotency_key = validated_data.pop("idempotency_key", None)

        subtotal = sum(p.price * qty for p, qty in lines)
        delivery_fee = config.default_delivery_fee if validated_data["order_type"] == OrderType.DELIVERY else 0

        order = Order.objects.create(
            user=user,
            tracking_token=uuid.uuid4(),
            idempotency_key=idempotency_key,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=subtotal + delivery_fee,
            **validated_data,
        )
        for product, qty in lines:
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                unit_price=product.price,
                quantity=qty,
            )

        summary = ", ".join(f"{qty}× {p.name}" for p, qty in lines)
        NotificationLog.objects.create(
            order=order,
            message_text=f"New order {order.order_number} from {order.customer_name}: {summary}. Total: {order.total}",
        )
        return order