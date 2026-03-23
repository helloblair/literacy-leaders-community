from django.db import models


class ProblemCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "Problem Categories"

    def __str__(self):
        return self.name


class ProblemStatement(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        ProblemCategory, on_delete=models.CASCADE, related_name="statements"
    )
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["category__order", "order", "title"]

    def __str__(self):
        return self.title
