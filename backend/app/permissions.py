from django.contrib.auth.models import User
from rest_framework.permissions import BasePermission
from django.core.cache import cache

from .jwt_helper import get_session_payload, get_session

class IsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        session = get_session(request)

        if session is None or session not in cache:
            return False

        try:
            payload = get_session_payload(session)
        except:
            return False

        try:
            user = User.objects.get(pk=payload["user_id"])
        except:
            return False

        return user.is_active


class IsModerator(BasePermission):
    def has_permission(self, request, view):
        session = get_session(request)

        if session is None:
            print("No session token found")
            return False

        try:
            payload = get_session_payload(session)
            print(f"JWT payload: {payload}")
        except Exception as e:
            print(f"JWT decode error: {e}")
            return False

        try:
            user = User.objects.get(pk=payload["user_id"])
            print(f"User found: {user.username}, is_staff: {user.is_staff}")
        except User.DoesNotExist:
            print("User not found")
            return False

        return user.is_staff