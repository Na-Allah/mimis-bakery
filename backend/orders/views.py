import re
import uuid

from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import User

from .models import NotificationLog, Order, OrderStatus
from .serializers import (
    CourierAssignmentSerializer,
    CourierOptionSerializer,
    CustomerOrderSerializer,
    CreateOrderSerializer,
    NotificationLogSerializer,
    OrderSerializer,
)
from django.db import transaction

from accounts.permissions import IsAdminUser
from core.realtime import publish_event
from .models import OrderType
from .permissions import IsCourier
from .services import apply_order_status_transition, change_order_status, retry_notification


def _digits(value):
    return re.sub(r"\D", "", value or "")


class OrderListCreateView(generics.ListAPIView):
    """Authenticated users place orders and read their own order history."""
    serializer_class = OrderSerializer
    pagination_class = None
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        return CustomerOrderSerializer

    def get_queryset(self):
        qs = Order.objects.select_related("courier").prefetch_related("items")
        user = self.request.user
        return qs if user.is_admin else qs.filter(user=user)

    def post(self, request):
        raw_idempotency_key = request.headers.get("Idempotency-Key")
        if not raw_idempotency_key:
            return Response(
                {"detail": "Idempotency-Key header is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            idempotency_key = uuid.UUID(raw_idempotency_key)
        except (ValueError, AttributeError):
            return Response(
                {"detail": "Idempotency-Key must be a valid UUID."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_order = Order.objects.filter(idempotency_key=idempotency_key).first()
        if existing_order:
            if existing_order.user_id != request.user.id and not request.user.is_admin:
                return Response(
                    {"detail": "This idempotency key is already in use."},
                    status=status.HTTP_409_CONFLICT,
                )
            return Response(
                OrderSerializer(existing_order).data,
                status=status.HTTP_200_OK,
            )

        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        try:
            order = serializer.save(user=user, idempotency_key=idempotency_key)
        except IntegrityError:
            existing_order = Order.objects.filter(idempotency_key=idempotency_key).first()
            if existing_order is None:
                raise
            if existing_order.user_id != request.user.id and not request.user.is_admin:
                return Response(
                    {"detail": "This idempotency key is already in use."},
                    status=status.HTTP_409_CONFLICT,
                )
            return Response(
                OrderSerializer(existing_order).data,
                status=status.HTTP_200_OK,
            )
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderTrackView(APIView):
    """Authenticated customers can track only their own orders."""
    permission_classes = [IsAuthenticated]

    def get(self, request, order_number):
        order = get_object_or_404(
            Order.objects.select_related("courier").prefetch_related("items"),
            order_number=order_number.upper(),
        )
        user = request.user
        allowed = user.is_admin or order.user_id == user.id

        if not allowed:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CustomerOrderSerializer(order, context={"request": request}).data)


class OrderStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not request.user.is_admin:
            return Response({"detail": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)
        order = get_object_or_404(Order.objects.prefetch_related("items"), pk=pk)
        new_status = request.data.get("status")
        if new_status not in OrderStatus.values:
            return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            order = change_order_status(order.pk, new_status)
        except ValueError as error:
            return Response({"detail": str(error)}, status=status.HTTP_409_CONFLICT)
        return Response(OrderSerializer(order).data)


class CompletedOrderDeleteView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        if order.status != OrderStatus.COMPLETED:
            return Response(
                {"detail": "Only completed orders can be deleted."},
                status=status.HTTP_409_CONFLICT,
            )
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CourierListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = CourierOptionSerializer
    pagination_class = None
    queryset = User.objects.filter(role=User.Role.COURIER, is_active=True).order_by("full_name")


class OrderCourierAssignmentView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def patch(self, request, pk):
        order = get_object_or_404(Order.objects.select_for_update(), pk=pk)
        if order.order_type != OrderType.DELIVERY:
            return Response(
                {"detail": "A courier can only be assigned to a delivery order."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if order.status in (OrderStatus.COMPLETED, OrderStatus.CANCELLED):
            return Response(
                {"detail": "A courier cannot be assigned to a completed or cancelled order."},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = CourierAssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        previous_courier_id = order.courier_id
        order.courier = serializer.validated_data["courier_id"]
        order.save(update_fields=["courier", "updated_at"])
        if previous_courier_id and previous_courier_id != order.courier_id:
            publish_event(
                "DELIVERIES_INVALIDATED",
                "delivery",
                "updated",
                order.pk,
                user_ids=(previous_courier_id,),
            )
        order = Order.objects.select_related("courier").prefetch_related("items").get(pk=order.pk)
        return Response(OrderSerializer(order).data)


from django.middleware.csrf import get_token

class CsrfView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        get_token(request)  # makes Django set the csrftoken cookie on the response
        return Response({"detail": "CSRF cookie set"})


class DeliveriesView(generics.ListAPIView):
    """Active delivery orders assigned to the authenticated courier."""
    permission_classes = [IsCourier]
    serializer_class = OrderSerializer
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        return (
            Order.objects.select_related("courier")
            .prefetch_related("items")
            .filter(
                order_type=OrderType.DELIVERY,
                courier=user,
            )
            .exclude(status__in=[OrderStatus.COMPLETED, OrderStatus.CANCELLED])
            .order_by("created_at")
        )


class CourierActionView(APIView):
    """POST {"action": "pickup" | "delivered"}"""
    permission_classes = [IsCourier]

    @transaction.atomic
    def post(self, request, pk):
        action = request.data.get("action")
        order = get_object_or_404(
            Order.objects.select_for_update(), pk=pk, order_type=OrderType.DELIVERY
        )
        user = request.user

        if action == "pickup":
            # lock + check stops two couriers claiming the same order
            if order.status != OrderStatus.READY or order.courier_id not in (None, user.id):
                return Response(
                    {"detail": "This order is not available for pickup."},
                    status=status.HTTP_409_CONFLICT,
                )
            order.courier = user
            try:
                apply_order_status_transition(order, OrderStatus.OUT_FOR_DELIVERY)
            except ValueError as error:
                return Response({"detail": str(error)}, status=status.HTTP_409_CONFLICT)
        elif action == "delivered":
            if order.courier_id != user.id or order.status != OrderStatus.OUT_FOR_DELIVERY:
                return Response(
                    {"detail": "You can only complete your own deliveries that are out for delivery."},
                    status=status.HTTP_409_CONFLICT,
                )
            try:
                apply_order_status_transition(order, OrderStatus.COMPLETED)
            except ValueError as error:
                return Response({"detail": str(error)}, status=status.HTTP_409_CONFLICT)
        else:
            return Response({"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

        if action == "pickup":
            order.save(update_fields=["courier", "updated_at"])
        return Response(OrderSerializer(order).data)


class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = NotificationLogSerializer
    pagination_class = None
    queryset = NotificationLog.objects.select_related("order").all()


class NotificationRetryView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        notification = get_object_or_404(NotificationLog, pk=pk)
        try:
            notification = retry_notification(notification.pk)
        except ValueError as error:
            return Response({"detail": str(error)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response(NotificationLogSerializer(notification).data)