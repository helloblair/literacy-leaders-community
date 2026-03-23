from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User

from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    MessageSerializer,
    StartConversationSerializer,
)


class IsParticipantOrModerator(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in ("moderator", "admin"):
            return True
        return request.user in obj.participants.all()


class ConversationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role in ("moderator", "admin"):
            convos = Conversation.objects.all()
        else:
            convos = Conversation.objects.filter(participants=request.user)
        convos = convos.prefetch_related("participants", "messages__sender")
        serializer = ConversationSerializer(convos, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        serializer = StartConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        recipient_id = serializer.validated_data["recipient_id"]
        try:
            recipient = User.objects.get(id=recipient_id, is_active=True)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if recipient == request.user:
            return Response(
                {"detail": "Cannot message yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find existing conversation between these two users
        existing = Conversation.objects.filter(
            participants=request.user
        ).filter(participants=recipient)
        if existing.exists():
            convo = existing.first()
        else:
            convo = Conversation.objects.create()
            convo.participants.add(request.user, recipient)

        msg = Message.objects.create(
            conversation=convo,
            sender=request.user,
            content=serializer.validated_data["message"],
        )
        msg.read_by.add(request.user)
        convo.save()  # updates updated_at

        return Response(
            ConversationSerializer(convo, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class ConversationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsParticipantOrModerator]

    def get_conversation(self, pk, user):
        try:
            convo = Conversation.objects.prefetch_related(
                "participants", "messages__sender"
            ).get(pk=pk)
        except Conversation.DoesNotExist:
            return None

        if user.role in ("moderator", "admin"):
            return convo
        if user in convo.participants.all():
            return convo
        return None

    def get(self, request, pk):
        convo = self.get_conversation(pk, request.user)
        if not convo:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Mark messages as read
        convo.messages.exclude(sender=request.user).exclude(
            read_by=request.user
        ).update()
        for msg in convo.messages.exclude(sender=request.user):
            msg.read_by.add(request.user)

        messages = MessageSerializer(convo.messages.all(), many=True).data
        convo_data = ConversationSerializer(convo, context={"request": request}).data
        convo_data["messages"] = messages
        return Response(convo_data)

    def post(self, request, pk):
        convo = self.get_conversation(pk, request.user)
        if not convo:
            return Response(status=status.HTTP_404_NOT_FOUND)

        content = request.data.get("content", "").strip()
        if not content:
            return Response(
                {"detail": "Message content required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_mod = (
            request.user.role in ("moderator", "admin")
            and request.user not in convo.participants.all()
        )
        msg = Message.objects.create(
            conversation=convo,
            sender=request.user,
            content=content,
            is_moderation=is_mod,
        )
        msg.read_by.add(request.user)
        convo.save()

        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)
