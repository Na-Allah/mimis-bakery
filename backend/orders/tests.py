import uuid
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from catalog.models import Category, Product, Section
from core.models import SiteConfiguration
from .models import NotificationLog, Order


User = get_user_model()


class AuthenticatedOrderingTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            email="customer@example.com",
            phone_number="+2348012345678",
            password="Horseshoe-Orange-57!",
            full_name="Customer One",
        )
        self.other_customer = User.objects.create_user(
            email="other@example.com",
            phone_number="+2348012345679",
            password="Horseshoe-Orange-57!",
            full_name="Customer Two",
        )
        SiteConfiguration.load()
        section = Section.objects.create(name="Bakery", slug="bakery")
        category = Category.objects.create(
            section=section,
            name="Bread",
            slug="bread",
        )
        self.product = Product.objects.create(
            category=category,
            name="Sourdough",
            slug="sourdough",
            price="1500.00",
        )

    def _create_order(self, user, idempotency_key=None):
        order = Order.objects.create(
            user=user,
            customer_name=user.full_name,
            customer_phone=user.phone_number,
            order_type="PICKUP",
            subtotal="1500.00",
            delivery_fee="0.00",
            total="1500.00",
            idempotency_key=idempotency_key,
        )
        return order

    def test_anonymous_user_cannot_read_menu(self):
        response = self.client.get("/api/menu/")
        self.assertEqual(response.status_code, 403)

    def test_authenticated_user_can_read_menu(self):
        self.client.force_authenticate(self.customer)
        response = self.client.get("/api/menu/")
        self.assertEqual(response.status_code, 200)

    def test_anonymous_user_cannot_create_order(self):
        response = self.client.post(
            "/api/orders/",
            {
                "customer_name": "Guest Customer",
                "customer_phone": "+2348012345678",
                "order_type": "PICKUP",
                "items": [{"product_id": str(self.product.id), "quantity": 1}],
            },
            format="json",
            HTTP_IDEMPOTENCY_KEY=str(uuid.uuid4()),
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Order.objects.count(), 0)

    def test_authenticated_user_can_create_order_for_their_account(self):
        self.client.force_authenticate(self.customer)
        response = self.client.post(
            "/api/orders/",
            {
                "customer_name": self.customer.full_name,
                "customer_phone": self.customer.phone_number,
                "order_type": "PICKUP",
                "items": [{"product_id": str(self.product.id), "quantity": 1}],
            },
            format="json",
            HTTP_IDEMPOTENCY_KEY=str(uuid.uuid4()),
        )

        self.assertEqual(response.status_code, 201)
        order = Order.objects.get(order_number=response.data["order_number"])
        self.assertEqual(order.user_id, self.customer.id)

    def test_anonymous_user_cannot_track_order_even_with_tracking_token(self):
        order = self._create_order(self.customer)
        response = self.client.get(
            f"/api/orders/track/{order.order_number}/?token={order.tracking_token}"
        )
        self.assertEqual(response.status_code, 403)

    def test_authenticated_user_can_track_only_their_own_order(self):
        own_order = self._create_order(self.customer)
        other_order = self._create_order(self.other_customer)
        self.client.force_authenticate(self.customer)

        own_response = self.client.get(f"/api/orders/track/{own_order.order_number}/")
        other_response = self.client.get(
            f"/api/orders/track/{other_order.order_number}/?token={other_order.tracking_token}"
        )

        self.assertEqual(own_response.status_code, 200)
        self.assertEqual(other_response.status_code, 404)


class AdminNotificationApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="notification-admin@example.com",
            phone_number="+2348012345610",
            password="test-password",
            full_name="Notification Admin",
            role=User.Role.ADMIN,
        )
        self.customer = User.objects.create_user(
            email="notification-customer@example.com",
            phone_number="+2348012345611",
            password="test-password",
            full_name="Notification Customer",
        )
        config = SiteConfiguration.load()
        config.whatsapp_number = "2348012345678"
        config.save(update_fields=["whatsapp_number"])
        self.order = Order.objects.create(
            user=self.customer,
            customer_name="Notification Customer",
            customer_phone="+2348012345611",
            order_type="PICKUP",
            subtotal="2500.00",
            delivery_fee="0.00",
            total="2500.00",
        )
        self.notification = NotificationLog.objects.create(
            order=self.order,
            message_text="Pending order notification",
        )

    def test_only_admin_can_list_notification_logs(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get("/api/admin/notifications/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["order_number"], self.order.order_number)

        self.client.force_authenticate(self.customer)
        denied_response = self.client.get("/api/admin/notifications/")
        self.assertEqual(denied_response.status_code, 403)

    def test_admin_retry_records_provider_success(self):
        self.client.force_authenticate(self.admin)
        provider_response = MagicMock()
        provider_response.__enter__.return_value = provider_response
        provider_response.read.return_value = b'{"messages":[{"id":"wamid.test"}]}'

        with patch.dict("os.environ", {
            "WHATSAPP_API_TOKEN": "test-token",
            "WHATSAPP_PHONE_NUMBER_ID": "test-phone-id",
            "WHATSAPP_ADMIN_NUMBER": "2348012345678",
        }), patch("orders.services.urllib.request.urlopen", return_value=provider_response):
            response = self.client.post(
                f"/api/admin/notifications/{self.notification.id}/retry/",
                format="json",
            )

        self.assertEqual(response.status_code, 200, response.data)
        self.notification.refresh_from_db()
        self.order.refresh_from_db()
        self.assertEqual(self.notification.status, "SENT")
        self.assertEqual(self.notification.attempts, 1)
        self.assertEqual(self.notification.provider_message_id, "wamid.test")
        self.assertIn(self.order.order_number, self.notification.message_text)
        self.assertEqual(self.order.whatsapp_status, "SENT")

    def test_retry_without_provider_configuration_keeps_order_pending(self):
        self.client.force_authenticate(self.admin)

        with patch.dict("os.environ", {}, clear=True):
            response = self.client.post(
                f"/api/admin/notifications/{self.notification.id}/retry/",
                format="json",
            )

        self.assertEqual(response.status_code, 503)
        self.notification.refresh_from_db()
        self.order.refresh_from_db()
        self.assertEqual(self.notification.status, "PENDING")
        self.assertEqual(self.order.status, "PENDING")


class CompletedOrderDeleteApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="delete-admin@example.com",
            phone_number="+2348012345620",
            password="test-password",
            full_name="Delete Admin",
            role=User.Role.ADMIN,
        )
        self.customer = User.objects.create_user(
            email="delete-customer@example.com",
            phone_number="+2348012345621",
            password="test-password",
            full_name="Delete Customer",
        )
        self.completed_order = self._make_order("COMPLETED")
        self.pending_order = self._make_order("PENDING")

    def _make_order(self, status):
        return Order.objects.create(
            user=self.customer,
            customer_name="Delete Customer",
            customer_phone="+2348012345621",
            order_type="PICKUP",
            subtotal="500.00",
            delivery_fee="0.00",
            total="500.00",
            status=status,
        )

    def test_admin_can_delete_completed_order_and_related_records(self):
        item = self.completed_order.items.create(
            product_name="Snapshot Item",
            unit_price="500.00",
            quantity=1,
            subtotal="500.00",
        )
        notification = NotificationLog.objects.create(
            order=self.completed_order,
            message_text="Order notification",
        )
        self.client.force_authenticate(self.admin)

        response = self.client.delete(f"/api/admin/orders/{self.completed_order.id}/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Order.objects.filter(pk=self.completed_order.pk).exists())
        self.assertFalse(self.completed_order.items.model.objects.filter(pk=item.pk).exists())
        self.assertFalse(NotificationLog.objects.filter(pk=notification.pk).exists())

    def test_admin_cannot_delete_uncompleted_order(self):
        self.client.force_authenticate(self.admin)

        response = self.client.delete(f"/api/admin/orders/{self.pending_order.id}/")

        self.assertEqual(response.status_code, 409)
        self.assertTrue(Order.objects.filter(pk=self.pending_order.pk).exists())

    def test_customer_cannot_delete_completed_order(self):
        self.client.force_authenticate(self.customer)

        response = self.client.delete(f"/api/admin/orders/{self.completed_order.id}/")

        self.assertEqual(response.status_code, 403)
        self.assertTrue(Order.objects.filter(pk=self.completed_order.pk).exists())


class AdminCourierAssignmentApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="courier-assignment-admin@example.com",
            phone_number="+2348012345630",
            password="test-password",
            full_name="Assignment Admin",
            role=User.Role.ADMIN,
        )
        self.customer = User.objects.create_user(
            email="courier-assignment-customer@example.com",
            phone_number="+2348012345631",
            password="test-password",
            full_name="Assignment Customer",
        )
        self.courier = User.objects.create_user(
            email="courier@example.com",
            phone_number="+2348012345632",
            password="test-password",
            full_name="Active Courier",
            role=User.Role.COURIER,
        )
        self.inactive_courier = User.objects.create_user(
            email="inactive-courier@example.com",
            phone_number="+2348012345633",
            password="test-password",
            full_name="Inactive Courier",
            role=User.Role.COURIER,
            is_active=False,
        )
        self.delivery_order = self._make_order("DELIVERY", "READY")
        self.pickup_order = self._make_order("PICKUP", "READY")
        self.completed_order = self._make_order("DELIVERY", "COMPLETED")

    def _make_order(self, order_type, status):
        return Order.objects.create(
            user=self.customer,
            customer_name="Assignment Customer",
            customer_phone=self.customer.phone_number,
            order_type=order_type,
            delivery_address="123 Test Street" if order_type == "DELIVERY" else "",
            subtotal="1000.00",
            delivery_fee="200.00" if order_type == "DELIVERY" else "0.00",
            total="1200.00" if order_type == "DELIVERY" else "1000.00",
            status=status,
        )

    def test_admin_can_list_active_couriers(self):
        self.client.force_authenticate(self.admin)

        response = self.client.get("/api/admin/couriers/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual([courier["id"] for courier in response.data], [str(self.courier.id)])

    def test_admin_can_assign_and_unassign_delivery_courier(self):
        self.client.force_authenticate(self.admin)

        assignment = self.client.patch(
            f"/api/admin/orders/{self.delivery_order.id}/courier/",
            {"courier_id": str(self.courier.id)},
            format="json",
        )

        self.assertEqual(assignment.status_code, 200, assignment.data)
        self.assertEqual(assignment.data["courier_id"], str(self.courier.id))
        self.assertEqual(assignment.data["courier_name"], self.courier.full_name)

        unassignment = self.client.patch(
            f"/api/admin/orders/{self.delivery_order.id}/courier/",
            {"courier_id": None},
            format="json",
        )
        self.assertEqual(unassignment.status_code, 200, unassignment.data)
        self.assertIsNone(unassignment.data["courier_id"])

    def test_admin_cannot_assign_customer_or_inactive_courier(self):
        self.client.force_authenticate(self.admin)

        customer_response = self.client.patch(
            f"/api/admin/orders/{self.delivery_order.id}/courier/",
            {"courier_id": str(self.customer.id)},
            format="json",
        )
        inactive_response = self.client.patch(
            f"/api/admin/orders/{self.delivery_order.id}/courier/",
            {"courier_id": str(self.inactive_courier.id)},
            format="json",
        )

        self.assertEqual(customer_response.status_code, 400)
        self.assertEqual(inactive_response.status_code, 400)

    def test_admin_cannot_assign_courier_to_pickup_or_terminal_order(self):
        self.client.force_authenticate(self.admin)

        pickup_response = self.client.patch(
            f"/api/admin/orders/{self.pickup_order.id}/courier/",
            {"courier_id": str(self.courier.id)},
            format="json",
        )
        completed_response = self.client.patch(
            f"/api/admin/orders/{self.completed_order.id}/courier/",
            {"courier_id": str(self.courier.id)},
            format="json",
        )

        self.assertEqual(pickup_response.status_code, 400)
        self.assertEqual(completed_response.status_code, 409)

    def test_customer_cannot_list_or_assign_couriers(self):
        self.client.force_authenticate(self.customer)

        list_response = self.client.get("/api/admin/couriers/")
        assignment_response = self.client.patch(
            f"/api/admin/orders/{self.delivery_order.id}/courier/",
            {"courier_id": str(self.courier.id)},
            format="json",
        )

        self.assertEqual(list_response.status_code, 403)
        self.assertEqual(assignment_response.status_code, 403)

    def test_courier_sees_only_their_assigned_active_delivery_orders(self):
        preparing_order = self._make_order("DELIVERY", "PREPARING")
        out_for_delivery_order = self._make_order("DELIVERY", "OUT_FOR_DELIVERY")
        completed_order = self._make_order("DELIVERY", "COMPLETED")
        preparing_order.courier = self.courier
        preparing_order.save(update_fields=["courier", "updated_at"])
        out_for_delivery_order.courier = self.courier
        out_for_delivery_order.save(update_fields=["courier", "updated_at"])
        completed_order.courier = self.courier
        completed_order.save(update_fields=["courier", "updated_at"])
        self.delivery_order.courier = self.courier
        self.delivery_order.save(update_fields=["courier", "updated_at"])

        other_courier = User.objects.create_user(
            email="another-courier@example.com",
            phone_number="+2348012345634",
            password="test-pass",
            full_name="Another Courier",
            role=User.Role.COURIER,
        )
        another_order = self._make_order("DELIVERY", "READY")
        another_order.courier = other_courier
        another_order.save(update_fields=["courier", "updated_at"])

        self.client.force_authenticate(self.courier)
        response = self.client.get("/api/orders/deliveries/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            {order["id"] for order in response.data},
            {str(self.delivery_order.id), str(preparing_order.id), str(out_for_delivery_order.id)},
        )

    def test_courier_does_not_see_unassigned_ready_orders(self):
        self.client.force_authenticate(self.courier)

        response = self.client.get("/api/orders/deliveries/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_customer_sees_assigned_courier_contact_for_delivery_order(self):
        self.delivery_order.courier = self.courier
        self.delivery_order.save(update_fields=["courier", "updated_at"])
        self.client.force_authenticate(self.customer)

        ready_response = self.client.get(
            f"/api/orders/track/{self.delivery_order.order_number}/"
        )
        self.assertEqual(ready_response.status_code, 200)
        expected_contact = {
            "name": self.courier.full_name,
            "phone_number": self.courier.phone_number,
        }
        self.assertEqual(ready_response.data["courier_contact"], expected_contact)
        orders_response = self.client.get("/api/orders/")
        own_order = next(
            order for order in orders_response.data
            if order["id"] == str(self.delivery_order.id)
        )
        self.assertEqual(own_order["courier_contact"], expected_contact)

    def test_customer_does_not_see_courier_contact_for_pickup(self):
        self.pickup_order.courier = self.courier
        self.pickup_order.save(update_fields=["courier", "updated_at"])
        self.client.force_authenticate(self.customer)

        response = self.client.get(
            f"/api/orders/track/{self.pickup_order.order_number}/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data["courier_contact"])

    def test_customer_does_not_see_contact_when_delivery_is_unassigned(self):
        self.client.force_authenticate(self.customer)

        response = self.client.get(
            f"/api/orders/track/{self.delivery_order.order_number}/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data["courier_contact"])
