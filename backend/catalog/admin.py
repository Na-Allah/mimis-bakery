from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Product, Section


class CategoryInline(admin.TabularInline):
    model = Category
    extra = 0
    fields = ("name", "slug", "is_active", "display_order")
    prepopulated_fields = {"slug": ("name",)}
    show_change_link = True


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "display_order", "updated_at")
    list_editable = ("is_active", "display_order")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("id", "created_at", "updated_at")
    inlines = [CategoryInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "section", "slug", "is_active", "display_order")
    list_editable = ("is_active", "display_order")
    list_filter = ("section", "is_active")
    search_fields = ("name", "slug", "section__name")  # also powers autocomplete on Product
    prepopulated_fields = {"slug": ("name",)}
    autocomplete_fields = ("section",)
    readonly_fields = ("id", "created_at", "updated_at")
    list_select_related = ("section",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "thumbnail", "name", "category", "price",
        "is_available", "is_featured", "display_order",
    )
    list_display_links = ("thumbnail", "name")
    list_editable = ("price", "is_available", "is_featured", "display_order")
    list_filter = ("is_available", "is_featured", "category__section", "category")
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
    autocomplete_fields = ("category",)
    readonly_fields = ("id", "image_preview", "created_at", "updated_at")
    list_select_related = ("category",)
    actions = ["mark_available", "mark_unavailable"]

    fieldsets = (
        (None, {"fields": ("id", "category", "name", "slug", "description")}),
        ("Pricing & image", {"fields": ("price", "image", "image_preview")}),
        ("Visibility", {"fields": ("is_available", "is_featured", "display_order")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    @admin.display(description="Image")
    def thumbnail(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height:40px;width:40px;object-fit:cover;border-radius:4px;" />',
                obj.image.url,
            )
        return "—"

    @admin.display(description="Preview")
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:200px;border-radius:6px;" />', obj.image.url)
        return "No image"

    @admin.action(description="Mark selected products as available")
    def mark_available(self, request, queryset):
        updated = 0
        for product in queryset.iterator():
            product.is_available = True
            product.save(update_fields=["is_available", "updated_at"])
            updated += 1
        self.message_user(request, f"{updated} product(s) marked available.")

    @admin.action(description="Mark selected products as unavailable (sold out)")
    def mark_unavailable(self, request, queryset):
        updated = 0
        for product in queryset.iterator():
            product.is_available = False
            product.save(update_fields=["is_available", "updated_at"])
            updated += 1
        self.message_user(request, f"{updated} product(s) marked unavailable.")