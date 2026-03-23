from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    ROLE_MEMBER = "member"
    ROLE_MODERATOR = "moderator"
    ROLE_ADMIN = "admin"

    ROLE_CHOICES = [
        (ROLE_MEMBER, "Member"),
        (ROLE_MODERATOR, "Moderator"),
        (ROLE_ADMIN, "Admin"),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_MEMBER)
    title = models.CharField(max_length=100, blank=True)
    district = models.ForeignKey(
        "districts.District",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="members",
    )
    problem_statements = models.ManyToManyField(
        "taxonomy.ProblemStatement",
        blank=True,
        related_name="users",
    )
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "accounts_user"

    def __str__(self):
        return f"{self.get_full_name() or self.username}"
