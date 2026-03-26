from rest_framework import permissions


class OwnTicketPermission(permissions.BasePermission):
    """
    Object-level permission to only allow updating his own ticket
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
