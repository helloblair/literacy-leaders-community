from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model for Literacy Leaders Community."""

    class Meta:
        db_table = "accounts_user"
