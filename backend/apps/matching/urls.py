from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CommunityDirectoryView, FindMatchesView, SavedMatchViewSet

router = DefaultRouter()
router.register(r"saved", SavedMatchViewSet, basename="savedmatch")

urlpatterns = [
    path("directory/", CommunityDirectoryView.as_view(), name="community-directory"),
    path("find/", FindMatchesView.as_view(), name="find-matches"),
] + router.urls
