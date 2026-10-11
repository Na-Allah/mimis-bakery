from rest_framework import serializers
from .models import Category, Product, Section


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = [
            "id", "name", "slug", "description", "image",
            "is_active", "display_order", "created_at", "updated_at",
        ]


class CategorySerializer(serializers.ModelSerializer):
    section_id = serializers.PrimaryKeyRelatedField(
        source="section",
        queryset=Section.objects.all(),
    )

    class Meta:
        model = Category
        fields = [
            "id", "section_id", "name", "slug", "description",
            "is_active", "display_order", "created_at", "updated_at",
        ]


class ProductSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        source="category",
        queryset=Category.objects.all(),
    )
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = Product
        fields = [
            "id", "category_id", "name", "slug", "description", "price", "image",
            "is_available", "is_featured", "display_order", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]