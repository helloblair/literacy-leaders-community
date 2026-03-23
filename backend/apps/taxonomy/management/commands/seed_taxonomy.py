from django.core.management.base import BaseCommand

from apps.taxonomy.models import ProblemCategory, ProblemStatement

TAXONOMY_DATA = [
    {
        "name": "Curriculum & Instruction",
        "description": "Challenges related to curriculum design, adoption, and instructional approaches.",
        "order": 1,
        "statements": [
            {"title": "Curriculum adoption & implementation", "order": 1},
            {"title": "Culturally responsive literacy instruction", "order": 2},
            {"title": "Technology integration & digital literacy", "order": 3},
        ],
    },
    {
        "name": "Professional Development",
        "description": "Building educator capacity through training, coaching, and leadership development.",
        "order": 2,
        "statements": [
            {"title": "Teacher professional development", "order": 1},
            {"title": "Literacy coaching & instructional leadership", "order": 2},
        ],
    },
    {
        "name": "Student Support",
        "description": "Intervention and support systems to meet diverse student literacy needs.",
        "order": 3,
        "statements": [
            {"title": "Intervention programs (RTI/MTSS)", "order": 1},
            {"title": "English Language Learner support", "order": 2},
            {"title": "Special education literacy", "order": 3},
            {"title": "Student motivation & reading engagement", "order": 4},
        ],
    },
    {
        "name": "Grade-Level Focus",
        "description": "Literacy challenges specific to particular grade bands.",
        "order": 4,
        "statements": [
            {"title": "Early literacy (Pre-K–2)", "order": 1},
            {"title": "Adolescent literacy (6–12)", "order": 2},
        ],
    },
    {
        "name": "Community & Resources",
        "description": "Family engagement, library programs, and resource allocation.",
        "order": 5,
        "statements": [
            {"title": "Family & community engagement", "order": 1},
            {"title": "School library & media programs", "order": 2},
            {"title": "Funding & resource allocation", "order": 3},
        ],
    },
    {
        "name": "Data & Assessment",
        "description": "Using data and assessment tools to drive literacy improvement.",
        "order": 6,
        "statements": [
            {"title": "Assessment tools & data use", "order": 1},
        ],
    },
]


class Command(BaseCommand):
    help = "Seed the problem statement taxonomy with initial categories and statements"

    def handle(self, *args, **options):
        created_cats = 0
        created_stmts = 0

        for cat_data in TAXONOMY_DATA:
            statements = cat_data.pop("statements")
            category, cat_created = ProblemCategory.objects.update_or_create(
                name=cat_data["name"],
                defaults=cat_data,
            )
            if cat_created:
                created_cats += 1
                self.stdout.write(f"  Created category: {category.name}")
            else:
                self.stdout.write(f"  Updated category: {category.name}")

            for stmt_data in statements:
                stmt, stmt_created = ProblemStatement.objects.update_or_create(
                    title=stmt_data["title"],
                    category=category,
                    defaults={"order": stmt_data["order"], "is_active": True},
                )
                if stmt_created:
                    created_stmts += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! Categories created: {created_cats}, Statements created: {created_stmts}"
            )
        )
