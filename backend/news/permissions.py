from rest_framework import permissions
from users.roles import STAFF_ROLES


class IsStaffByRole(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_staff or request.user.is_superuser:
            return True
        return request.user.groups.filter(name__in=STAFF_ROLES).exists()
