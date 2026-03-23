from django.contrib import admin

from .models import District


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ["name", "state", "locale_type", "enrollment", "frl_percentage", "ell_percentage"]
    list_filter = ["state", "locale_type"]
    search_fields = ["name", "nces_id"]
    ordering = ["state", "name"]
