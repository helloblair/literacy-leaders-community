from rest_framework import serializers

from apps.accounts.serializers import UserPublicSerializer

from .models import SavedMatch


class SavedMatchSerializer(serializers.ModelSerializer):
    matched_user_detail = UserPublicSerializer(source="matched_user", read_only=True)

    class Meta:
        model = SavedMatch
        fields = ["id", "matched_user", "matched_user_detail", "created_at"]
        read_only_fields = ["created_at"]

    def validate_matched_user(self, value):
        if value == self.context["request"].user:
            raise serializers.ValidationError("Cannot save yourself as a match.")
        return value


class MatchResultSerializer(serializers.Serializer):
    user = UserPublicSerializer()
    shared_problem_statements = serializers.IntegerField()
    same_locale = serializers.BooleanField()
    same_state = serializers.BooleanField()
    enrollment_similarity = serializers.FloatField()
    frl_similarity = serializers.FloatField()
    ell_similarity = serializers.FloatField()
    match_score = serializers.FloatField()
