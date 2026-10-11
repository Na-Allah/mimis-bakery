from io import BytesIO
from tempfile import TemporaryDirectory

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image
from rest_framework.test import APIClient
from orders.models import Order, OrderItem

from accounts.models import User
from .models import Category, Product, Section


class ProductUploadApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        section = Section.objects.create(name="Bakery", slug="bakery")
        self.category = Category.objects.create(
            section=section,
            name="Cakes",
            slug="cakes",
        )
        self.admin = User.objects.create_user(
            email="admin@example.com",
            phone_number="+2348012345678",
            password="test-password",
            full_name="Admin",
            role=User.Role.ADMIN,
        )
        self.client.force_authenticate(self.admin)

    def _image_file(self):
        image_buffer = BytesIO()
        Image.new("RGB", (2, 2), color="red").save(image_buffer, format="PNG")
        return SimpleUploadedFile(
            "cake.png",
            image_buffer.getvalue(),
            content_type="image/png",
        )

    def test_admin_can_create_product_with_uploaded_image(self):
        with TemporaryDirectory() as media_root, override_settings(MEDIA_ROOT=media_root):
            response = self.client.post(
                "/api/products/manage/",
                {
                    "name": "Chocolate Cake",
                    "slug": "chocolate-cake",
                    "category_id": str(self.category.id),
                    "description": "Rich chocolate cake",
                    "price": "2500.00",
                    "is_available": "true",
                    "is_featured": "false",
                    "display_order": "0",
                    "image": self._image_file(),
                },
                format="multipart",
            )

            self.assertEqual(response.status_code, 201, response.data)
            product = Product.objects.get(slug="chocolate-cake")
            self.assertTrue(product.image.name.startswith("products/"))
            self.assertTrue(product.image.storage.exists(product.image.name))
            self.assertEqual(response.data["name"], product.name)

    def test_customer_cannot_upload_product_image(self):
        customer = User.objects.create_user(
            email="customer@example.com",
            phone_number="+2348012345679",
            password="test-password",
            full_name="Customer",
        )
        self.client.force_authenticate(customer)

        response = self.client.post("/api/products/manage/", {}, format="multipart")

        self.assertEqual(response.status_code, 403)


class AdminCatalogManagementApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email="catalog-admin@example.com",
            phone_number="+2348012345600",
            password="test-password",
            full_name="Catalog Admin",
            role=User.Role.ADMIN,
        )
        self.customer = User.objects.create_user(
            email="catalog-customer@example.com",
            phone_number="+2348012345601",
            password="test-password",
            full_name="Catalog Customer",
        )
        self.active_section = Section.objects.create(name="Bakery", slug="bakery")
        self.inactive_section = Section.objects.create(
            name="Seasonal", slug="seasonal", is_active=False
        )
        self.inactive_category = Category.objects.create(
            section=self.active_section,
            name="Seasonal Cakes",
            slug="seasonal-cakes",
            is_active=False,
        )

    def test_admin_menu_includes_inactive_catalog_records(self):
        self.client.force_authenticate(self.admin)

        response = self.client.get("/api/menu/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["sections"]), 2)
        self.assertEqual(len(response.data["categories"]), 1)
        self.assertFalse(response.data["sections"][1]["is_active"])

    def test_customer_menu_hides_inactive_catalog_records(self):
        self.client.force_authenticate(self.customer)

        response = self.client.get("/api/menu/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual([section["id"] for section in response.data["sections"]], [str(self.active_section.id)])
        self.assertEqual(response.data["categories"], [])

    def test_admin_can_create_section_and_category(self):
        self.client.force_authenticate(self.admin)

        section_response = self.client.post(
            "/api/sections/manage/",
            {"name": "Drinks", "slug": "drinks", "display_order": 2},
            format="multipart",
        )
        self.assertEqual(section_response.status_code, 201, section_response.data)
        section = Section.objects.get(slug="drinks")
        category_response = self.client.post(
            "/api/categories/manage/",
            {
                "section_id": str(section.id),
                "name": "Juice",
                "slug": "juice",
                "display_order": 3,
            },
            format="multipart",
        )

        self.assertEqual(category_response.status_code, 201, category_response.data)
        self.assertTrue(Category.objects.filter(section=section, slug="juice").exists())

    def test_non_admin_cannot_manage_catalog(self):
        self.client.force_authenticate(self.customer)

        response = self.client.post(
            "/api/sections/manage/",
            {"name": "Drinks", "slug": "drinks"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_admin_can_delete_product_without_losing_order_snapshot(self):
        product = Product.objects.create(
            category=self.inactive_category,
            name="Old Cake",
            slug="old-cake",
            price="1200.00",
        )
        order = Order.objects.create(
            user=self.admin,
            customer_name="Catalog Admin",
            customer_phone="+2348012345600",
            order_type="PICKUP",
            subtotal="1200.00",
            delivery_fee="0.00",
            total="1200.00",
        )
        item = OrderItem.objects.create(
            order=order,
            product=product,
            product_name=product.name,
            unit_price=product.price,
            quantity=1,
        )
        self.client.force_authenticate(self.admin)

        response = self.client.delete(f"/api/products/manage/{product.id}/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Product.objects.filter(pk=product.pk).exists())
        item.refresh_from_db()
        self.assertIsNone(item.product_id)
        self.assertEqual(item.product_name, "Old Cake")

    def test_admin_can_delete_category_and_its_products(self):
        product = Product.objects.create(
            category=self.inactive_category,
            name="Category Cake",
            slug="category-cake",
            price="1200.00",
        )
        self.client.force_authenticate(self.admin)

        response = self.client.delete(f"/api/categories/manage/{self.inactive_category.id}/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Category.objects.filter(pk=self.inactive_category.pk).exists())
        self.assertFalse(Product.objects.filter(pk=product.pk).exists())

    def test_admin_can_delete_section_and_its_catalog_tree(self):
        category = Category.objects.create(
            section=self.inactive_section,
            name="Seasonal Bread",
            slug="seasonal-bread",
        )
        product = Product.objects.create(
            category=category,
            name="Seasonal Loaf",
            slug="seasonal-loaf",
            price="1200.00",
        )
        self.client.force_authenticate(self.admin)

        response = self.client.delete(f"/api/sections/manage/{self.inactive_section.id}/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Section.objects.filter(pk=self.inactive_section.pk).exists())
        self.assertFalse(Category.objects.filter(pk=category.pk).exists())
        self.assertFalse(Product.objects.filter(pk=product.pk).exists())

    def test_non_admin_cannot_delete_catalog(self):
        self.client.force_authenticate(self.customer)

        response = self.client.delete(f"/api/categories/manage/{self.inactive_category.id}/")

        self.assertEqual(response.status_code, 403)

# Create your tests here.
