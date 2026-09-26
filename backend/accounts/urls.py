from django.urls import path

from .views import (
    csrf_view,
    register_view,
    login_view,
    current_user_view,
    logout_view,
)

urlpatterns = [
    path("csrf/", csrf_view, name="csrf"),
    path("register/", register_view, name="register"),
    path("login/", login_view, name="login"),
    path("me/", current_user_view, name="current-user"),
    path("logout/", logout_view, name="logout"),
]