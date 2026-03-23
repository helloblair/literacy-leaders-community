"""
URL configuration for Literacy Leaders Community.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("apps.accounts.urls")),
    path("api/districts/", include("apps.districts.urls")),
    path("api/taxonomy/", include("apps.taxonomy.urls")),
    path("api/matching/", include("apps.matching.urls")),
    path("api/messaging/", include("apps.messaging.urls")),
]
