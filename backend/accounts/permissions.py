from rest_framework.permissions import BasePermission

from .models import User


class IsAdminUser(BasePermission):
    message = "Administrator access required."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_admin
        )

