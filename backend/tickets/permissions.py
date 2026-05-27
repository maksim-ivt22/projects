from rest_framework import permissions
from users.roles import STAFF_ROLES


class OwnTicketPermission(permissions.BasePermission):
    """
    Object-level permission to only allow updating his own ticket
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsStaffByRole(permissions.BasePermission):
    """
    Allows access only to operators/admins (or Django staff/superusers).
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_staff or request.user.is_superuser:
            return True
        return request.user.groups.filter(name__in=STAFF_ROLES).exists()


class IsOwnerOrStaffByRole(permissions.BasePermission):
    """
    Object-level access for resource owner or operator/admin.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user == obj.user:
            return True
        if user.is_staff or user.is_superuser:
            return True
        return user.groups.filter(name__in=STAFF_ROLES).exists()
