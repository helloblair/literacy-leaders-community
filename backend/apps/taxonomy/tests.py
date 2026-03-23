from django.test import TestCase

from .models import ProblemCategory, ProblemStatement


class ProblemCategoryModelTest(TestCase):
    def setUp(self):
        self.category = ProblemCategory.objects.create(
            name="Curriculum & Instruction",
            description="Challenges related to curriculum design.",
            order=1,
        )

    def test_str_representation(self):
        self.assertEqual(str(self.category), "Curriculum & Instruction")

    def test_default_ordering(self):
        ProblemCategory.objects.create(name="Student Support", order=3)
        ProblemCategory.objects.create(name="Professional Development", order=2)
        categories = list(ProblemCategory.objects.values_list("name", flat=True))
        self.assertEqual(categories[0], "Curriculum & Instruction")
        self.assertEqual(categories[1], "Professional Development")
        self.assertEqual(categories[2], "Student Support")

    def test_order_field(self):
        self.assertEqual(self.category.order, 1)


class ProblemStatementModelTest(TestCase):
    def setUp(self):
        self.category = ProblemCategory.objects.create(name="Curriculum & Instruction", order=1)
        self.statement = ProblemStatement.objects.create(
            title="Curriculum adoption & implementation",
            category=self.category,
            is_active=True,
            order=1,
        )

    def test_str_representation(self):
        self.assertEqual(str(self.statement), "Curriculum adoption & implementation")

    def test_is_active_default(self):
        stmt = ProblemStatement.objects.create(
            title="Another statement",
            category=self.category,
        )
        self.assertTrue(stmt.is_active)

    def test_category_relationship(self):
        self.assertEqual(self.statement.category, self.category)
        self.assertIn(self.statement, self.category.statements.all())

    def test_active_filter(self):
        ProblemStatement.objects.create(
            title="Inactive statement",
            category=self.category,
            is_active=False,
        )
        active = ProblemStatement.objects.filter(is_active=True)
        inactive = ProblemStatement.objects.filter(is_active=False)
        self.assertEqual(active.count(), 1)
        self.assertEqual(inactive.count(), 1)

    def test_cascade_delete(self):
        self.category.delete()
        self.assertEqual(ProblemStatement.objects.count(), 0)
