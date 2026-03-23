from django.contrib import admin

from .models import ProblemCategory, ProblemStatement


@admin.register(ProblemCategory)
class ProblemCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "order"]
    search_fields = ["name"]
    ordering = ["order", "name"]


@admin.register(ProblemStatement)
class ProblemStatementAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "is_active", "order"]
    list_filter = ["category", "is_active"]
    search_fields = ["title"]
    ordering = ["category__order", "order", "title"]
