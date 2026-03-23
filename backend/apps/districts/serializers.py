from rest_framework import serializers

from .models import District


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = [
            "id",
            "nces_id",
            "name",
            "state",
            "locale_type",
            "enrollment",
            "frl_percentage",
            "ell_percentage",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
