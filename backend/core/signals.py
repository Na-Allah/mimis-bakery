from django.db.models.signals import post_delete, post_save

from catalog.models import Category, Product, Section
from orders.models import NotificationLog, Order, OrderType
from .realtime import publish_event
from .models import SiteConfiguration


def _event_type(operation):
    return f"RESOURCE_{operation.upper()}"


def _public_resource_name(sender):
    if sender is SiteConfiguration:
        return "site_configuration"
    return sender.__name__.lower()


def _publish_public_resource(sender, instance, created=None, using="default", **kwargs):
    operation = "created" if created else "updated"
    publish_event(
        _event_type(operation), _public_resource_name(sender), operation, instance.pk,
        groups=("authenticated-users",), using=using,
    )


def _publish_public_delete(sender, instance, using="default", **kwargs):
    operation = "deleted"
    publish_event(
        _event_type(operation), _public_resource_name(sender), operation, instance.pk,
        groups=("authenticated-users",), using=using,
    )


for public_model in (Section, Category, Product, SiteConfiguration):
    post_save.connect(
        _publish_public_resource,
        sender=public_model,
        dispatch_uid=f"realtime-{public_model._meta.label_lower}-saved",
    )
    post_delete.connect(
        _publish_public_delete,
        sender=public_model,
        dispatch_uid=f"realtime-{public_model._meta.label_lower}-deleted",
    )


def _publish_order(sender, instance, created=None, using="default", **kwargs):
    operation = "created" if created else "updated"
    user_ids = [instance.user_id, instance.courier_id]
    publish_event(
        f"ORDER_{operation.upper()}", "order", operation, instance.pk,
        groups=("admin-users",), user_ids=user_ids, using=using,
    )
    if instance.order_type == OrderType.DELIVERY:
        publish_event(
            "DELIVERIES_INVALIDATED", "delivery", operation,
            groups=("courier-users",), using=using,
        )


def _publish_order_delete(sender, instance, using="default", **kwargs):
    publish_event(
        "ORDER_DELETED", "order", "deleted", instance.pk,
        groups=("admin-users",), user_ids=(instance.user_id, instance.courier_id), using=using,
    )
    if instance.order_type == "DELIVERY":
        publish_event("DELIVERIES_INVALIDATED", "delivery", "deleted", groups=("courier-users",), using=using)


post_save.connect(_publish_order, sender=Order, dispatch_uid="realtime-order-saved")
post_delete.connect(_publish_order_delete, sender=Order, dispatch_uid="realtime-order-deleted")


def _publish_notification(sender, instance, created=None, using="default", **kwargs):
    operation = "created" if created else "updated"
    publish_event(
        f"NOTIFICATION_{operation.upper()}", "notification", operation, instance.pk,
        groups=("admin-users",), using=using,
    )
    order_owner_id = (
        Order.objects.using(using)
        .filter(pk=instance.order_id)
        .values_list("user_id", flat=True)
        .first()
    )
    if order_owner_id:
        publish_event(
            "ORDER_UPDATED", "order", "updated", instance.order_id,
            user_ids=(order_owner_id,), using=using,
        )


def _publish_notification_delete(sender, instance, using="default", **kwargs):
    publish_event(
        "NOTIFICATION_DELETED", "notification", "deleted", instance.pk,
        groups=("admin-users",), using=using,
    )


post_save.connect(_publish_notification, sender=NotificationLog, dispatch_uid="realtime-notification-saved")
post_delete.connect(_publish_notification_delete, sender=NotificationLog, dispatch_uid="realtime-notification-deleted")