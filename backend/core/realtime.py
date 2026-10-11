import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction


logger = logging.getLogger(__name__)


def user_group(user_id):
    return f"user-{user_id}"


def publish_event(event_type, resource, operation, object_id=None, *, groups=(), user_ids=(), using=None):
    """Queue a resource invalidation event after the current transaction commits."""
    event = {
        "type": event_type,
        "id": str(object_id) if object_id is not None else None,
        "data": {"resource": resource, "operation": operation},
    }
    target_groups = set(groups)
    target_groups.update(user_group(user_id) for user_id in user_ids if user_id)
    if not target_groups:
        return

    def send():
        channel_layer = get_channel_layer()
        if channel_layer is None:
            logger.error("Realtime event dropped because no Channels layer is configured.")
            return
        try:
            send_to_group = async_to_sync(channel_layer.group_send)
            for group in target_groups:
                send_to_group(group, {"type": "realtime.event", "payload": event})
        except Exception:
            logger.exception("Failed to publish realtime event type=%s resource=%s", event_type, resource)

    transaction.on_commit(send, using=using)