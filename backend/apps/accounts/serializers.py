from django.contrib.auth import authenticate
from rest_framework import serializers

from apps.districts.serializers import DistrictSerializer
from apps.taxonomy.serializers import ProblemStatementSerializer

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    problem_statement_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False, default=[]
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "title",
            "district",
            "problem_statement_ids",
            "bio",
        ]

    def create(self, validated_data):
        ps_ids = validated_data.pop("problem_statement_ids", [])
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        if ps_ids:
            user.problem_statements.set(ps_ids)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data["username"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        data["user"] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    district_detail = DistrictSerializer(source="district", read_only=True)
    problem_statements_detail = ProblemStatementSerializer(
        source="problem_statements", many=True, read_only=True
    )
    problem_statement_ids = serializers.PrimaryKeyRelatedField(
        source="problem_statements",
        many=True,
        queryset=__import__("apps.taxonomy.models", fromlist=["ProblemStatement"]).ProblemStatement.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "title",
            "role",
            "district",
            "district_detail",
            "problem_statements_detail",
            "problem_statement_ids",
            "bio",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "username", "role", "created_at", "updated_at"]


class UserPublicSerializer(serializers.ModelSerializer):
    district_detail = DistrictSerializer(source="district", read_only=True)
    problem_statements_detail = ProblemStatementSerializer(
        source="problem_statements", many=True, read_only=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "title",
            "district",
            "district_detail",
            "problem_statements_detail",
            "bio",
        ]
