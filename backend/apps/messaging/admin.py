from django.contrib import admin

from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ["sender", "content", "is_moderation", "created_at"]


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ["id", "get_participants", "created_at", "updated_at"]
    inlines = [MessageInline]

    def get_participants(self, obj):
        return ", ".join(str(p) for p in obj.participants.all())
    get_participants.short_description = "Participants"


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["sender", "conversation", "content_preview", "is_moderation", "created_at"]
    list_filter = ["is_moderation"]
    search_fields = ["content", "sender__username"]

    def content_preview(self, obj):
        return obj.content[:60]
    content_preview.short_description = "Content"
