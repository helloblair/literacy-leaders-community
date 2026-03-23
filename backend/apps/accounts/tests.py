from django.test import TestCase

from apps.districts.models import District
from apps.taxonomy.models import ProblemCategory, ProblemStatement

from .models import User


class UserModelTest(TestCase):
    def setUp(self):
        self.district = District.objects.create(
            nces_id="0600006", name="Los Angeles Unified", state="CA",
            locale_type="urban", enrollment=596937, frl_percentage=72.10, ell_percentage=19.80,
        )
        self.user = User.objects.create_user(
            username="jdoe", password="testpass123",
            first_name="Jane", last_name="Doe",
            email="jane@example.com", district=self.district,
        )

    def test_str_with_full_name(self):
        self.assertEqual(str(self.user), "Jane Doe")

    def test_str_without_full_name(self):
        user = User.objects.create_user(username="noname", password="testpass123")
        self.assertEqual(str(user), "noname")

    def test_default_role(self):
        self.assertEqual(self.user.role, User.ROLE_MEMBER)

    def test_district_association(self):
        self.assertEqual(self.user.district, self.district)
        self.assertIn(self.user, self.district.members.all())

    def test_problem_statement_association(self):
        cat = ProblemCategory.objects.create(name="Test Cat", order=1)
        ps = ProblemStatement.objects.create(title="Test PS", category=cat, order=1)
        self.user.problem_statements.add(ps)
        self.assertIn(ps, self.user.problem_statements.all())
        self.assertIn(self.user, ps.users.all())

    def test_timestamps(self):
        self.assertIsNotNone(self.user.created_at)
        self.assertIsNotNone(self.user.updated_at)


class MatchingModelTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="testpass123")
        self.user2 = User.objects.create_user(username="user2", password="testpass123")

    def test_saved_match_creation(self):
        from apps.matching.models import SavedMatch
        match = SavedMatch.objects.create(user=self.user1, matched_user=self.user2)
        self.assertEqual(str(match), "user1 -> user2")

    def test_saved_match_unique(self):
        from apps.matching.models import SavedMatch
        SavedMatch.objects.create(user=self.user1, matched_user=self.user2)
        with self.assertRaises(Exception):
            SavedMatch.objects.create(user=self.user1, matched_user=self.user2)


class MessagingModelTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="testpass123")
        self.user2 = User.objects.create_user(username="user2", password="testpass123")

    def test_conversation_creation(self):
        from apps.messaging.models import Conversation
        convo = Conversation.objects.create()
        convo.participants.add(self.user1, self.user2)
        self.assertEqual(convo.participants.count(), 2)

    def test_message_creation(self):
        from apps.messaging.models import Conversation, Message
        convo = Conversation.objects.create()
        convo.participants.add(self.user1, self.user2)
        msg = Message.objects.create(conversation=convo, sender=self.user1, content="Hello!")
        self.assertEqual(str(msg), "user1: Hello!")
        self.assertFalse(msg.is_moderation)

    def test_message_ordering(self):
        from apps.messaging.models import Conversation, Message
        convo = Conversation.objects.create()
        convo.participants.add(self.user1, self.user2)
        msg1 = Message.objects.create(conversation=convo, sender=self.user1, content="First")
        msg2 = Message.objects.create(conversation=convo, sender=self.user2, content="Second")
        msgs = list(convo.messages.all())
        self.assertEqual(msgs[0], msg1)
        self.assertEqual(msgs[1], msg2)

    def test_moderation_message(self):
        from apps.messaging.models import Conversation, Message
        mod = User.objects.create_user(username="mod", password="testpass123", role=User.ROLE_MODERATOR)
        convo = Conversation.objects.create()
        convo.participants.add(self.user1, self.user2)
        msg = Message.objects.create(conversation=convo, sender=mod, content="Mod note", is_moderation=True)
        self.assertTrue(msg.is_moderation)
