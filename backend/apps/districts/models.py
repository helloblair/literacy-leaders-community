from django.db import models


class District(models.Model):
    LOCALE_URBAN = "urban"
    LOCALE_SUBURBAN = "suburban"
    LOCALE_TOWN = "town"
    LOCALE_RURAL = "rural"

    LOCALE_CHOICES = [
        (LOCALE_URBAN, "Urban"),
        (LOCALE_SUBURBAN, "Suburban"),
        (LOCALE_TOWN, "Town"),
        (LOCALE_RURAL, "Rural"),
    ]

    nces_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    state = models.CharField(max_length=2)
    locale_type = models.CharField(max_length=10, choices=LOCALE_CHOICES)
    enrollment = models.IntegerField()
    frl_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    ell_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["state"]),
            models.Index(fields=["locale_type"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.state})"
