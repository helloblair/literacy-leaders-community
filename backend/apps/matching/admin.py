from django.contrib import admin

from .models import SavedMatch


@admin.register(SavedMatch)
class SavedMatchAdmin(admin.ModelAdmin):
    list_display = ["user", "matched_user", "created_at"]
    search_fields = ["user__username", "matched_user__username"]
