# Generated manually for secure tracking-token support.

import uuid

from django.db import migrations, models


def populate_tracking_tokens(apps, schema_editor):
    Order = apps.get_model("orders", "Order")
    for order in Order.objects.filter(tracking_token__isnull=True):
        order.tracking_token = uuid.uuid4()
        order.save(update_fields=["tracking_token"])


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0003_order_completed_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="tracking_token",
            field=models.UUIDField(default=None, editable=False, null=True, unique=False),
        ),
        migrations.RunPython(populate_tracking_tokens, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="order",
            name="tracking_token",
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
