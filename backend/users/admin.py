from django.contrib import admin
from django.contrib.auth.admin import (
    UserAdmin as BaseUserAdmin,
    GroupAdmin as BaseGroupAdmin,
)
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import Group
from unfold.admin import ModelAdmin

from .models import User
from .forms import CustomUserCreationForm, CustomUserChangeForm

admin.site.unregister(Group)


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    """
    Define the admin pages for the custom User model.
    """

    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    list_display = ("email", "full_name", "is_staff", "is_active", "date_joined")
    list_filter = ("is_staff", "is_active", "groups")

    fieldsets = (
        (
            None,
            {"fields": ("email", "password")},
        ),
        (_("Personal info"), {"fields": ("full_name",)}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "full_name",
                    "password",
                    "password2",
                ),  # password2 is from UserCreationForm
            },
        ),
    )

    search_fields = ("email", "full_name")
    ordering = ("email",)

    filter_horizontal = (
        "groups",
        "user_permissions",
    )

    readonly_fields = ("last_login", "date_joined")

    # Use email as the primary identifier in admin views
    list_display_links = ("email",)


@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass
