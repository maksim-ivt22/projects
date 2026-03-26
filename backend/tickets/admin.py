from django.contrib import admin

# from django.db import models
from unfold.admin import ModelAdmin, TabularInline
# from unfold.contrib.forms.widgets import WysiwygWidget

from .models import Ticket, TicketCategory, TicketType, TicketGroup
from .forms import TicketForm


@admin.register(Ticket)
class TicketAdmin(ModelAdmin):
    form = TicketForm
    list_display = [
        "id",
        "title",
        "status",
        "category_title",
        "type_title",
        "author_full_name",
    ]
    search_fields = ["id", "title"]
    # formfield_overrides = {
    #     models.TextField: {
    #         "widget": WysiwygWidget,
    #     },
    # }

    @admin.display(description="Категория заявки")
    def category_title(self, ticket: Ticket) -> str:
        return ticket.type.category.title

    @admin.display(description="Тип заявки")
    def type_title(self, ticket: Ticket) -> str:
        return ticket.type.title

    @admin.display(description="ФИО пользователя")
    def author_full_name(self, ticket: Ticket) -> str:
        return ticket.user.full_name


class TicketInline(TabularInline):
    form = TicketForm
    model = Ticket
    extra = 0


@admin.register(TicketGroup)
class TicketGroupAdmin(ModelAdmin):
    list_display = ["id", "title", "priority", "created_on", "last_created_on"]
    search_fields = ["id", "title"]
    inlines = [
        TicketInline,
    ]
    pass


class TicketTypeInline(TabularInline):
    model = TicketType
    extra = 0


@admin.register(TicketCategory)
class TicketCategoryAdmin(ModelAdmin):
    list_display = ["id", "title"]
    search_fields = ["id", "title"]
    inlines = [TicketTypeInline]


@admin.register(TicketType)
class TicketTypeAdmin(ModelAdmin):
    list_display = ["id", "title", "category_title"]
    search_fields = ["id", "title"]

    @admin.display(description="Категория")
    def category_title(self, ticket_type: TicketType) -> str:
        return ticket_type.category.title
