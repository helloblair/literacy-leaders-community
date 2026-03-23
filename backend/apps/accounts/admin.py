from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "email", "first_name", "last_name", "role", "district", "is_active"]
    list_filter = ["role", "is_active", "district__state"]
    search_fields = ["username", "email", "first_name", "last_name"]
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Profile", {"fields": ("role", "title", "district", "problem_statements", "bio")}),
    )
    filter_horizontal = ["problem_statements"]
