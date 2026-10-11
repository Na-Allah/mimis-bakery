# catalog/urls.py
from django.urls import path
from .views import CategoryManageView, MenuView, ProductManageView, SectionManageView

urlpatterns = [
    path("menu/", MenuView.as_view(), name="menu"),
    path("products/manage/", ProductManageView.as_view(), name="product-create"),
    path("products/manage/<uuid:pk>/", ProductManageView.as_view(), name="product-update-delete"),
    path("sections/manage/", SectionManageView.as_view(), name="section-create"),
    path("sections/manage/<uuid:pk>/", SectionManageView.as_view(), name="section-update-delete"),
    path("categories/manage/", CategoryManageView.as_view(), name="category-create"),
    path("categories/manage/<uuid:pk>/", CategoryManageView.as_view(), name="category-update-delete"),
]