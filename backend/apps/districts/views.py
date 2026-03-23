import django_filters
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import District
from .serializers import DistrictSerializer


class DistrictFilter(django_filters.FilterSet):
    state = django_filters.CharFilter(lookup_expr="iexact")
    locale_type = django_filters.CharFilter(lookup_expr="iexact")
    enrollment_min = django_filters.NumberFilter(field_name="enrollment", lookup_expr="gte")
    enrollment_max = django_filters.NumberFilter(field_name="enrollment", lookup_expr="lte")
    frl_min = django_filters.NumberFilter(field_name="frl_percentage", lookup_expr="gte")
    frl_max = django_filters.NumberFilter(field_name="frl_percentage", lookup_expr="lte")
    ell_min = django_filters.NumberFilter(field_name="ell_percentage", lookup_expr="gte")
    ell_max = django_filters.NumberFilter(field_name="ell_percentage", lookup_expr="lte")

    class Meta:
        model = District
        fields = ["state", "locale_type"]


class DistrictViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = District.objects.all().order_by("name")
    serializer_class = DistrictSerializer
    filterset_class = DistrictFilter
    filter_backends = [
        django_filters.rest_framework.DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["name"]
    ordering_fields = ["name", "state", "enrollment", "frl_percentage", "ell_percentage"]

    @action(detail=False, methods=["get"])
    def search(self, request):
        query = request.query_params.get("q", "")
        qs = self.get_queryset().filter(name__icontains=query) if query else self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
