from django.db.models import Count, Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.accounts.serializers import UserPublicSerializer

from .models import SavedMatch
from .serializers import MatchResultSerializer, SavedMatchSerializer


class CommunityDirectoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = User.objects.filter(is_active=True).exclude(id=request.user.id)
        qs = qs.select_related("district").prefetch_related("problem_statements")

        # Filters
        state = request.query_params.get("state")
        locale_type = request.query_params.get("locale_type")
        problem_statement = request.query_params.get("problem_statement")
        search = request.query_params.get("q")

        if state:
            qs = qs.filter(district__state__iexact=state)
        if locale_type:
            qs = qs.filter(district__locale_type__iexact=locale_type)
        if problem_statement:
            qs = qs.filter(problem_statements__id=problem_statement)
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(district__name__icontains=search)
            )

        qs = qs.distinct()
        serializer = UserPublicSerializer(qs, many=True)
        return Response(serializer.data)


class FindMatchesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.district:
            return Response(
                {"detail": "Set your district to find matches."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_ps_ids = set(user.problem_statements.values_list("id", flat=True))
        if not user_ps_ids:
            return Response(
                {"detail": "Select problem statements to find matches."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        candidates = (
            User.objects.filter(is_active=True, district__isnull=False)
            .exclude(id=user.id)
            .select_related("district")
            .prefetch_related("problem_statements")
        )

        # Optional filters
        state = request.query_params.get("state")
        locale_type = request.query_params.get("locale_type")
        if state:
            candidates = candidates.filter(district__state__iexact=state)
        if locale_type:
            candidates = candidates.filter(district__locale_type__iexact=locale_type)

        results = []
        for candidate in candidates:
            candidate_ps_ids = set(
                candidate.problem_statements.values_list("id", flat=True)
            )
            shared = len(user_ps_ids & candidate_ps_ids)
            if shared == 0:
                continue

            same_locale = (
                candidate.district.locale_type == user.district.locale_type
            )
            same_state = candidate.district.state == user.district.state

            score = shared * 3.0
            if same_locale:
                score += 1.0
            if same_state:
                score += 0.5

            results.append(
                {
                    "user": candidate,
                    "shared_problem_statements": shared,
                    "same_locale": same_locale,
                    "same_state": same_state,
                    "match_score": score,
                }
            )

        results.sort(key=lambda x: x["match_score"], reverse=True)
        serializer = MatchResultSerializer(results, many=True)
        return Response(serializer.data)


class SavedMatchViewSet(viewsets.ModelViewSet):
    serializer_class = SavedMatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "delete"]

    def get_queryset(self):
        return SavedMatch.objects.filter(user=self.request.user).select_related(
            "matched_user__district"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
