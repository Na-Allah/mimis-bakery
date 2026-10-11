from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient, APITestCase

from .models import User


class AuthenticationApiTests(APITestCase):
    def setUp(self):
        self.email = "customer@example.com"
        self.password = "Horseshoe-Orange-57!"
        self.user = User.objects.create_user(
            email=self.email,
            phone_number="+2348012345678",
            password=self.password,
            full_name="Test Customer",
        )

    def test_login_restores_authenticated_session(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": self.email, "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.cookies.get("sessionid"))

        current_user = self.client.get("/api/auth/me/")
        self.assertEqual(current_user.status_code, 200)
        self.assertEqual(str(current_user.data["id"]), str(self.user.id))

    def test_login_rejects_non_string_credentials_with_bad_request(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": ["invalid"], "password": "anything"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_registration_applies_django_password_validation(self):
        with self.assertRaises(ValidationError):
            validate_password("password", user=self.user)

        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Another Customer",
                "email": "another@example.com",
                "phone_number": "+2348012345679",
                "password": "password",
                "delivery_address": "",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(email="another@example.com").exists())

    def test_registration_stores_hashed_password_and_does_not_log_in(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Another Customer",
                "email": "another@example.com",
                "phone_number": "+2348012345679",
                "password": "Horseshoe-Orange-57!",
                "delivery_address": "",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="another@example.com")
        self.assertTrue(user.check_password("Horseshoe-Orange-57!"))
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_logout_ends_session(self):
        client = APIClient(enforce_csrf_checks=True)
        client.force_login(self.user)

        csrf_response = client.get("/api/auth/csrf/")
        self.assertEqual(csrf_response.status_code, 200)
        response = client.post(
            "/api/auth/logout/",
            HTTP_ORIGIN="http://localhost:3000",
            HTTP_X_CSRFTOKEN=csrf_response.data["csrfToken"],
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("_auth_user_id", client.session)

    def test_authenticated_user_can_update_name_and_phone(self):
        self.client.force_login(self.user)

        response = self.client.patch(
            "/api/auth/me/",
            {"full_name": "Updated Customer", "phone_number": "+2348012345699"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["full_name"], "Updated Customer")
        self.assertEqual(response.data["phone_number"], "+2348012345699")
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, "Updated Customer")

    def test_profile_update_rejects_duplicate_phone_number(self):
        User.objects.create_user(
            email="other-customer@example.com",
            phone_number="+2348012345699",
            password="testpass123",
            full_name="Other Customer",
        )
        self.client.force_login(self.user)

        response = self.client.patch(
            "/api/auth/me/",
            {"phone_number": "+2348012345699"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_profile_update_does_not_allow_role_or_email_changes(self):
        self.client.force_login(self.user)

        response = self.client.patch(
            "/api/auth/me/",
            {
                "full_name": "Updated Customer",
                "email": "admin@example.com",
                "role": "ADMIN",
                "is_admin": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, self.email)
        self.assertEqual(self.user.role, User.Role.CUSTOMER)
