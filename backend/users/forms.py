from django import forms
from django.contrib.auth.forms import (
    UserCreationForm,
    UserChangeForm,
    AuthenticationForm,
    UsernameField,
)
from django.utils.translation import gettext_lazy as _
from .models import User


# --- Form for Regular User Creation (Signup) ---
class CustomUserCreationForm(UserCreationForm):
    """
    A form that creates a user, with no privileges, from the given email,
    full name and password.
    """

    email = forms.EmailField(
        label=_("Email"),
        max_length=254,
        widget=forms.EmailInput(attrs={"autocomplete": "email"}),
    )
    full_name = forms.CharField(
        label=_("Full Name"),
        strip=True,
        max_length=User._meta.get_field("full_name").max_length,
        widget=forms.TextInput(attrs={"autocomplete": "name"}),
    )

    class Meta:
        model = User
        fields = ("email", "full_name")

    def save(self, commit=True):
        """
        Save the new user.
        Ensure email and full_name from the form are correctly saved.
        """
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        user.full_name = self.cleaned_data["full_name"]
        if commit:
            user.save()
        return user


# --- Form for Admin User Change ---
class CustomUserChangeForm(UserChangeForm):
    """
    A form for updating users. Includes all the fields on
    the user, but replaces the password field with admin's
    password hash display field.
    """

    email = forms.EmailField(
        label=_("Email"),
        max_length=254,
        widget=forms.EmailInput(attrs={"autocomplete": "email"}),
    )
    full_name = forms.CharField(
        label=_("Full Name"),
        strip=True,
        max_length=User._meta.get_field("full_name").max_length,
        widget=forms.TextInput(attrs={"autocomplete": "name"}),
        required=True,
    )

    class Meta:
        model = User
        fields = (
            "email",
            "full_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "groups",
            "user_permissions",
        )


# --- Form for Authentication (Login) ---
class CustomAuthenticationForm(AuthenticationForm):
    """
    Overrides the default AuthenticationForm to use email label instead of username.
    """

    username = UsernameField(
        label=_("Email"),
        widget=forms.EmailInput(attrs={"autofocus": True, "autocomplete": "email"}),
    )

    error_messages = {
        "invalid_login": _(
            "Please enter a correct %(username)s and password. Note that both "
            "fields may be case-sensitive."
        ),
        "inactive": _("This account is inactive."),
    }

    def __init__(self, request=None, *args, **kwargs):
        super().__init__(request=request, *args, **kwargs)
        self.fields["username"].label = _("Email Address")
        self.fields["username"].widget.attrs.update({"placeholder": _("Email Address")})
        self.fields["password"].widget.attrs.update({"placeholder": _("Password")})
