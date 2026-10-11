from django.contrib import admin
from django.utils import timezone

from .models import NotificationLog, Order, OrderItem, OrderStatus, WhatsAppStatus


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ("product", "product_name", "unit_price", "quantity", "subtotal")
    readonly_fields = ("product", "product_name", "unit_price", "subtotal")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


class NotificationLogInline(admin.TabularInline):
    model = NotificationLog
    extra = 0
    fields = ("status", "attempts", "sent_at", "last_error")
    readonly_fields = fields
    can_delete = False
    show_change_link = True

    def has_add_permission(self, request, obj=None):
        return False


def _status_action(status, label):
    @admin.action(description=f"Mark selected orders as {label}")
    def action(modeladmin, request, queryset):
        from .services import change_order_status

        changed = 0
        rejected = 0
        for order_id in queryset.values_list("pk", flat=True):
            try:
                change_order_status(order_id, status)
                changed += 1
            except ValueError:
                rejected += 1
        modeladmin.message_user(
            request,
            f"{changed} order(s) marked {label}; {rejected} order(s) skipped due to invalid status transitions.",
        )
    action.__name__ = f"mark_{status.lower()}"
    return action


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    date_hierarchy = "created_at"
    list_display = ("order_number", "customer_name", "customer_phone", "order_type",
                "total", "status", "courier", "whatsapp_status", "created_at")
    list_filter = ("status", "order_type", "courier", "whatsapp_status", "created_at")
    autocomplete_fields = ("user", "courier")

    search_fields = ("order_number", "customer_name", "customer_phone", "customer_email", "user__email")
    list_select_related = ("user",)
    autocomplete_fields = ("user",)
    readonly_fields = (
        "id", "order_number", "status", "subtotal", "delivery_fee", "total",
        "whatsapp_message_id", "created_at", "updated_at",
    )
    inlines = [OrderItemInline, NotificationLogInline]
    actions = [
        _status_action(OrderStatus.CONFIRMED, "confirmed"),
        _status_action(OrderStatus.PREPARING, "preparing"),
        _status_action(OrderStatus.READY, "ready"),
        _status_action(OrderStatus.COMPLETED, "completed"),
        _status_action(OrderStatus.CANCELLED, "cancelled"),
        _status_action(OrderStatus.OUT_FOR_DELIVERY, "out for delivery"),
    ]

    fieldsets = (
        ("Order", {"fields": ("id", "order_number", "status", "order_type", "user", "courier")}),
        ("Customer", {"fields": ("customer_name", "customer_phone", "customer_email", "delivery_address", "customer_note")}),
        ("Totals", {"fields": ("subtotal", "delivery_fee", "total")}),
        ("WhatsApp", {"fields": ("whatsapp_status", "whatsapp_message_id")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
      
    )


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    date_hierarchy = "created_at"
    list_display = ("order_number", "channel", "status", "attempts", "created_at", "sent_at")
    list_filter = ("status", "channel")
    search_fields = ("order__order_number", "provider_message_id", "message_text")
    list_select_related = ("order",)
    readonly_fields = (
        "id", "order", "channel", "provider_message_id", "attempts",
        "last_error", "message_text", "created_at", "sent_at",
    )
    actions = ["reset_for_retry"]

    @admin.display(description="Order", ordering="order__order_number")
    def order_number(self, obj):
        return obj.order.order_number

    @admin.action(description="Reset failed notifications to PENDING (for retry)")
    def reset_for_retry(self, request, queryset):
        updated = 0
        for notification in queryset.filter(status=WhatsAppStatus.FAILED).iterator():
            notification.status = WhatsAppStatus.PENDING
            notification.save(update_fields=["status"])
            updated += 1
        self.message_user(request, f"{updated} notification(s) queued for retry.")

    def has_add_permission(self, request):
        return False