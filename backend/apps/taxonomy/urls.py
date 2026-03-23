from rest_framework.routers import DefaultRouter

from .views import ProblemCategoryViewSet, ProblemStatementViewSet

router = DefaultRouter()
router.register(r"categories", ProblemCategoryViewSet, basename="problemcategory")
router.register(r"statements", ProblemStatementViewSet, basename="problemstatement")

urlpatterns = router.urls
