from rest_framework import serializers

from .models import ProblemCategory, ProblemStatement


class ProblemStatementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProblemStatement
        fields = ["id", "title", "description", "category", "is_active", "order"]


class ProblemCategorySerializer(serializers.ModelSerializer):
    statements = ProblemStatementSerializer(many=True, read_only=True)

    class Meta:
        model = ProblemCategory
        fields = ["id", "name", "description", "order", "statements"]
