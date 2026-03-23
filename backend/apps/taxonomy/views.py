from rest_framework import viewsets
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.viewsets import GenericViewSet

from .models import ProblemCategory, ProblemStatement
from .serializers import ProblemCategorySerializer, ProblemStatementSerializer


class ProblemCategoryViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):
    queryset = ProblemCategory.objects.prefetch_related("statements").all()
    serializer_class = ProblemCategorySerializer


class ProblemStatementViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):
    queryset = ProblemStatement.objects.select_related("category").filter(is_active=True)
    serializer_class = ProblemStatementSerializer
