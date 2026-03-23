from rest_framework import serializers

from apps.accounts.serializers import UserPublicSerializer

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_detail = UserPublicSerializer(source="sender", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "sender_detail", "content", "is_moderation", "created_at"]
        read_only_fields = ["sender", "is_moderation", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    participants_detail = UserPublicSerializer(source="participants", many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "participants", "participants_detail", "last_message", "unread_count", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        if msg:
            return MessageSerializer(msg).data
        return None

    def get_unread_count(self, obj):
        user = self.context.get("request")
        if user and hasattr(user, "user"):
            return obj.messages.exclude(read_by=user.user).exclude(sender=user.user).count()
        return 0


class StartConversationSerializer(serializers.Serializer):
    recipient_id = serializers.IntegerField()
    message = serializers.CharField()
