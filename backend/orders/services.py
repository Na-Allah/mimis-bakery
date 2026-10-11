import json
import os
import urllib.error
import urllib.request

from django.db import transaction
from django.utils import timezone

from core.models import SiteConfiguration
from .models import NotificationLog, Order, OrderStatus, WhatsAppStatus


ALLOWED_STATUS_TRANSITIONS = {
    OrderStatus.PENDING: {OrderStatus.CONFIRMED, OrderStatus.CANCELLED},
    OrderStatus.CONFIRMED: {OrderStatus.PREPARING, OrderStatus.CANCELLED},
    OrderStatus.PREPARING: {OrderStatus.READY, OrderStatus.CANCELLED},
    OrderStatus.READY: {
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
    },
    OrderStatus.OUT_FOR_DELIVERY: {OrderStatus.COMPLETED, OrderStatus.CANCELLED},
}


def apply_order_status_transition(order, new_status):
    allowed = ALLOWED_STATUS_TRANSITIONS.get(order.status, set())
    if new_status not in allowed:
        raise ValueError(f"Cannot change order status from {order.status} to {new_status}.")

    order.status = new_status
    update_fields = ["status", "updated_at"]
    if new_status == OrderStatus.COMPLETED:
        order.completed_at = timezone.now()
        update_fields.append("completed_at")
    order.save(update_fields=update_fields)
    return order


@transaction.atomic
def change_order_status(order_id, new_status):
    order = Order.objects.select_for_update().get(pk=order_id)
    return apply_order_status_transition(order, new_status)


def retry_notification(notification_id):
    notification = NotificationLog.objects.select_related("order").prefetch_related(
        "order__items"
    ).get(pk=notification_id)
    if notification.status == WhatsAppStatus.SENT:
        raise ValueError("This notification has already been sent.")

    access_token = os.environ.get("WHATSAPP_API_TOKEN")
    phone_number_id = os.environ.get("WHATSAPP_PHONE_NUMBER_ID")
    recipient = os.environ.get("WHATSAPP_ADMIN_NUMBER") or SiteConfiguration.load().whatsapp_number
    recipient = "".join(character for character in recipient if character.isdigit())
    if not access_token or not phone_number_id or not recipient:
        raise ValueError("WhatsApp delivery is not configured on the server.")

    order = notification.order
    config = SiteConfiguration.load()
    currency = config.currency_symbol or "₦"
    item_lines = "\n".join(
        f"{item.quantity} x {item.product_name} - {currency}{item.subtotal:,.2f}"
        for item in order.items.all()
    )
    message = "\n".join([
        f"New order {order.order_number}",
        f"Customer: {order.customer_name} ({order.customer_phone})",
        f"Type: {order.get_order_type_display()}",
        "Items:",
        item_lines,
        f"Subtotal: {currency}{order.subtotal:,.2f}",
        f"Delivery: {currency}{order.delivery_fee:,.2f}",
        f"Total: {currency}{order.total:,.2f}",
        *([f"Address: {order.delivery_address}"] if order.delivery_address else []),
        *([f"Note: {order.customer_note}"] if order.customer_note else []),
    ])
    payload = json.dumps({
        "messaging_product": "whatsapp",
        "to": recipient,
        "type": "text",
        "text": {"preview_url": False, "body": message},
    }).encode("utf-8")
    request = urllib.request.Request(
        f"https://graph.facebook.com/v21.0/{phone_number_id}/messages",
        data=payload,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    notification.attempts += 1
    notification.message_text = message
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            result = json.loads(response.read().decode("utf-8"))
        messages = result.get("messages") or []
        if not messages or not messages[0].get("id"):
            raise ValueError("WhatsApp provider returned no message ID.")
        notification.status = WhatsAppStatus.SENT
        notification.provider_message_id = messages[0]["id"]
        notification.sent_at = timezone.now()
        notification.last_error = ""
    except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError) as error:
        notification.status = WhatsAppStatus.FAILED
        if isinstance(error, urllib.error.HTTPError):
            provider_error = error.read().decode("utf-8", errors="replace")
            notification.last_error = provider_error[:2000] or str(error)
        else:
            notification.last_error = str(error)[:2000]
    notification.save(update_fields=[
        "attempts", "status", "provider_message_id", "sent_at", "last_error", "message_text"
    ])
    order.whatsapp_status = notification.status
    order.whatsapp_message_id = notification.provider_message_id
    order.save(update_fields=["whatsapp_status", "whatsapp_message_id", "updated_at"])
    return notification
