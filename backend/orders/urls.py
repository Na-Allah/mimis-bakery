from django.urls import path

from .views import (
    CourierActionView, CsrfView, DeliveriesView,
    CompletedOrderDeleteView, CourierListView, NotificationListView,
    NotificationRetryView, OrderCourierAssignmentView, OrderListCreateView,
    OrderStatusView, OrderTrackView,
)

urlpatterns = [
    path("csrf/", CsrfView.as_view()),
    path("orders/", OrderListCreateView.as_view()),
    path("orders/deliveries/", DeliveriesView.as_view()),
    path("orders/track/<str:order_number>/", OrderTrackView.as_view()),
    path("orders/<uuid:pk>/status/", OrderStatusView.as_view()),
    path("admin/orders/<uuid:pk>/", CompletedOrderDeleteView.as_view()),
    path("admin/orders/<uuid:pk>/courier/", OrderCourierAssignmentView.as_view()),
    path("admin/couriers/", CourierListView.as_view()),
    path("orders/<uuid:pk>/courier/", CourierActionView.as_view()),
    path("admin/notifications/", NotificationListView.as_view()),
    path("admin/notifications/<uuid:pk>/retry/", NotificationRetryView.as_view()),
]