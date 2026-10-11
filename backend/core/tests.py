from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from django.db import transaction
from django.test import Client, TransactionTestCase, override_settings

from backend.asgi import application
from catalog.models import Section
from orders.models import NotificationLog, Order


User = get_user_model()


@override_settings(ALLOWED_HOSTS=["testserver"])
class RealtimeWebsocketTests(TransactionTestCase):
	def _create_user(self, email, phone, role=User.Role.CUSTOMER):
		return User.objects.create_user(
			email=email,
			phone_number=phone,
			password="test-password",
			full_name=email.split("@")[0],
			role=role,
		)

	def _session_cookie(self, user):
		client = Client()
		client.force_login(user)
		return client.cookies["sessionid"].value

	def _communicator(self, session_cookie=None, origin="http://testserver"):
		headers = [(b"origin", origin.encode())]
		if session_cookie:
			headers.append((b"cookie", f"sessionid={session_cookie}".encode()))
		return WebsocketCommunicator(application, "/ws/events/", headers=headers)

	def test_anonymous_websocket_connection_is_rejected(self):
		async def connect_anonymous():
			communicator = self._communicator()
			connected, close_code = await communicator.connect()
			self.assertFalse(connected)
			self.assertEqual(close_code, 4401)

		async_to_sync(connect_anonymous)()

	def test_untrusted_origin_is_rejected(self):
		async def connect_untrusted_origin():
			communicator = self._communicator(origin="https://untrusted.example")
			connected, _ = await communicator.connect()
			self.assertFalse(connected)

		async_to_sync(connect_untrusted_origin)()

	def test_catalog_event_reaches_multiple_authenticated_clients_after_commit(self):
		first_customer = self._create_user("first@example.com", "+2348012345701")
		second_customer = self._create_user("second@example.com", "+2348012345702")
		first_cookie = self._session_cookie(first_customer)
		second_cookie = self._session_cookie(second_customer)

		async def receive_broadcast():
			first = self._communicator(first_cookie)
			second = self._communicator(second_cookie)
			first_connected, _ = await first.connect()
			second_connected, _ = await second.connect()
			self.assertTrue(first_connected)
			self.assertTrue(second_connected)

			section = await database_sync_to_async(self._create_committed_section)()
			for operation in ("created",):
				first_event = await first.receive_json_from()
				second_event = await second.receive_json_from()
				self.assertEqual(first_event["type"], f"RESOURCE_{operation.upper()}")
				self.assertEqual(first_event["id"], str(section.pk))
				self.assertEqual(first_event["data"], {"resource": "section", "operation": operation})
				self.assertEqual(first_event, second_event)

			await database_sync_to_async(self._update_section)(section.pk)
			updated = await first.receive_json_from()
			self.assertEqual(updated["type"], "RESOURCE_UPDATED")
			self.assertEqual(updated["data"]["operation"], "updated")
			self.assertEqual(await second.receive_json_from(), updated)

			await database_sync_to_async(section.delete)()
			deleted = await first.receive_json_from()
			self.assertEqual(deleted["type"], "RESOURCE_DELETED")
			self.assertEqual(deleted["data"]["operation"], "deleted")
			self.assertEqual(await second.receive_json_from(), deleted)
			await first.disconnect()
			await second.disconnect()

		async_to_sync(receive_broadcast)()

	def _create_committed_section(self):
		with transaction.atomic():
			return Section.objects.create(name="Realtime Bread", slug="realtime-bread")

	def _update_section(self, section_id):
		section = Section.objects.get(pk=section_id)
		section.name = "Updated Realtime Bread"
		section.save()

	def test_order_event_only_reaches_order_owner_and_admin(self):
		owner = self._create_user("owner@example.com", "+2348012345711")
		unrelated_customer = self._create_user("unrelated@example.com", "+2348012345712")
		admin = self._create_user("staff@example.com", "+2348012345713", User.Role.ADMIN)
		owner_cookie = self._session_cookie(owner)
		unrelated_cookie = self._session_cookie(unrelated_customer)
		admin_cookie = self._session_cookie(admin)

		async def receive_private_order_event():
			owner_socket = self._communicator(owner_cookie)
			unrelated_socket = self._communicator(unrelated_cookie)
			admin_socket = self._communicator(admin_cookie)
			for communicator in (owner_socket, unrelated_socket, admin_socket):
				connected, _ = await communicator.connect()
				self.assertTrue(connected)

			order = await database_sync_to_async(Order.objects.create)(
				user=owner,
				customer_name="Private Order Owner",
				customer_phone=owner.phone_number,
				order_type="PICKUP",
				subtotal="1000.00",
				delivery_fee="0.00",
				total="1000.00",
			)

			owner_event = await owner_socket.receive_json_from()
			admin_event = await admin_socket.receive_json_from()
			self.assertEqual(owner_event["type"], "ORDER_CREATED")
			self.assertEqual(owner_event["id"], str(order.id))
			self.assertEqual(owner_event["data"], {"resource": "order", "operation": "created"})
			self.assertEqual(owner_event, admin_event)
			self.assertTrue(await unrelated_socket.receive_nothing(timeout=0.05))

			for communicator in (owner_socket, unrelated_socket, admin_socket):
				await communicator.disconnect()

		async_to_sync(receive_private_order_event)()

	def test_notification_events_are_admin_only(self):
		owner = self._create_user("notification-owner@example.com", "+2348012345721")
		admin = self._create_user("notification-staff@example.com", "+2348012345722", User.Role.ADMIN)
		owner_cookie = self._session_cookie(owner)
		admin_cookie = self._session_cookie(admin)

		async def receive_admin_notification():
			owner_socket = self._communicator(owner_cookie)
			admin_socket = self._communicator(admin_cookie)
			for communicator in (owner_socket, admin_socket):
				connected, _ = await communicator.connect()
				self.assertTrue(connected)

			order = await database_sync_to_async(Order.objects.create)(
				user=owner,
				customer_name="Notification Owner",
				customer_phone=owner.phone_number,
				order_type="PICKUP",
				subtotal="1000.00",
				delivery_fee="0.00",
				total="1000.00",
			)
			await owner_socket.receive_json_from()
			await admin_socket.receive_json_from()

			notification = await database_sync_to_async(NotificationLog.objects.create)(
				order=order,
				message_text="Private dispatch log",
			)
			admin_notification_event = await admin_socket.receive_json_from()
			owner_order_event = await owner_socket.receive_json_from()
			self.assertEqual(admin_notification_event["type"], "NOTIFICATION_CREATED")
			self.assertEqual(admin_notification_event["id"], str(notification.pk))
			self.assertEqual(
				admin_notification_event["data"],
				{"resource": "notification", "operation": "created"},
			)
			self.assertEqual(owner_order_event["type"], "ORDER_UPDATED")
			self.assertEqual(owner_order_event["id"], str(order.pk))
			self.assertEqual(owner_order_event["data"], {"resource": "order", "operation": "updated"})
			self.assertTrue(await owner_socket.receive_nothing(timeout=0.05))

			await database_sync_to_async(self._mark_notification_sent)(notification.pk)
			updated_admin_notification = await admin_socket.receive_json_from()
			updated_owner_order = await owner_socket.receive_json_from()
			self.assertEqual(updated_admin_notification["type"], "NOTIFICATION_UPDATED")
			self.assertEqual(updated_admin_notification["id"], str(notification.pk))
			self.assertEqual(updated_owner_order["type"], "ORDER_UPDATED")
			self.assertEqual(updated_owner_order["id"], str(order.pk))
			self.assertTrue(await owner_socket.receive_nothing(timeout=0.05))

			await owner_socket.disconnect()
			await admin_socket.disconnect()

		async_to_sync(receive_admin_notification)()

	def _mark_notification_sent(self, notification_id):
		notification = NotificationLog.objects.get(pk=notification_id)
		notification.status = "SENT"
		notification.save(update_fields=["status"])

# Create your tests here.
