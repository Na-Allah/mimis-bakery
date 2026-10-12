from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.html import format_html

from .models import SiteConfiguration


@admin.register(SiteConfiguration)
class SiteConfigurationAdmin(admin.ModelAdmin):
    list_display = (
        "restaurant_name", "phone", "whatsapp_number", "email",
        "delivery_enabled", "pickup_enabled", "default_delivery_fee",
    )
    readonly_fields = ("id", "logo_preview")

    fieldsets = (
        ("Branding", {"fields": ("restaurant_name", "tagline", "logo", "logo_preview", "description")}),
        ("Contact", {"fields": ("phone", "whatsapp_number", "email", "address", "opening_hours")}),
        ("Ordering", {"fields": ("delivery_enabled", "pickup_enabled", "default_delivery_fee")}),
        ("Currency", {"fields": ("currency_symbol", "currency_code")}),
    )

    @admin.display(description="Logo preview")
    def logo_preview(self, obj):
        if obj and obj.logo:
            return format_html('<img src="{}" style="max-height:100px;border-radius:6px;" />', obj.logo.url)
        return "No logo"

    def changelist_view(self, request, extra_context=None):
        # there is only ever one row, so skip the list and open it directly
        config = SiteConfiguration.load()
        return redirect(reverse("admin:core_siteconfiguration_change", args=[config.pk]))

    def has_add_permission(self, request):
        return not SiteConfiguration.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    # --- Dynamic admin branding from SiteConfiguration ---
    _original_each_context = admin.site.each_context

    def _branded_each_context(request):
        context = _original_each_context(request)
        try:
            name = SiteConfiguration.load().restaurant_name
        except Exception:
            # table may not exist yet (before first migrate)
            name = "Restaurant"
        context["site_header"] = name
        context["site_title"] = f"{name} Admin"
        return context

    admin.site.each_context = _branded_each_context
    admin.site.index_title = "Manage your restaurant"