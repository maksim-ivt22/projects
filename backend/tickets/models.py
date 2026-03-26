from django.db import models
from django.contrib.gis.db import models as gis_models
from django.core.validators import MaxValueValidator, MinValueValidator

from users.models import User


class TicketCategory(models.Model):
    title = models.CharField(max_length=100, verbose_name="Название")
    score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )

    class Meta:
        verbose_name = "Категория заявки"
        verbose_name_plural = "Категории заявок"

    def __str__(self):
        return self.title


class TicketType(models.Model):
    title = models.CharField(max_length=100, verbose_name="Название")
    category = models.ForeignKey(
        TicketCategory, on_delete=models.CASCADE, related_name="types"
    )
    score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )

    class Meta:
        verbose_name = "Тип заявки"
        verbose_name_plural = "Типы заявок"

    def __str__(self):
        return self.title


class TicketGroup(models.Model):
    title = models.CharField(max_length=255, verbose_name="Название")
    created_on = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    last_created_on = models.DateTimeField(
        auto_now_add=True, verbose_name="Дата создания последней заявки"
    )
    # TODO: add ticket group status

    class Meta:
        verbose_name = "Группа заявок"
        verbose_name_plural = "Группы заявок"

    @property
    def priority(self) -> int:
        days_diff: int = (self.last_created_on - self.created_on).days
        ticket_count: int = self.tickets.count()  # type: ignore
        type: TicketType = self.tickets.first().type  # type: ignore
        category: TicketCategory = type.category  # type: ignore
        calculated_priority: int = (
            category.score * type.score + days_diff
        ) * ticket_count
        return calculated_priority

    priority.fget.short_description = "Приоритет"  # type: ignore

    def __str__(self):
        return self.title


class Ticket(models.Model):
    STATUS_PENDING_REVIEW = "PENDING_REVIEW"
    STATUS_IN_PROGRESS = "IN_PROGRESS"
    STATUS_COMPLETED = "COMPLETED"
    STATUS_REJECTED = "REJECTED"

    STATUS_CHOICES = (
        (STATUS_PENDING_REVIEW, "Принята на рассмотрение"),
        (STATUS_IN_PROGRESS, "Работы ведутся"),
        (STATUS_COMPLETED, "Работы завершены"),
        (STATUS_REJECTED, "Отказано"),
    )

    title = models.CharField(max_length=255, verbose_name="Название")
    description = models.TextField(blank=True, verbose_name="Описание")
    type = models.ForeignKey(
        TicketType, on_delete=models.CASCADE, related_name="tickets", verbose_name="Тип"
    )
    location = gis_models.PointField(
        srid=4326,
        null=False,
        help_text="Geographic location (longitude, latitude)",
        verbose_name="Координаты",
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    group = models.ForeignKey(
        TicketGroup,
        on_delete=models.CASCADE,
        related_name="tickets",
        verbose_name="Группа",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING_REVIEW,
        verbose_name="Статус",
    )
    address = models.CharField(max_length=255, verbose_name="Адрес")
    image = models.ImageField(null=True, blank=True)

    class Meta:
        verbose_name = "Заявка"
        verbose_name_plural = "Заявки"

    def __str__(self):
        return self.title

    @property
    def latitude(self):
        return self.location.y

    @property
    def longitude(self):
        return self.location.x
