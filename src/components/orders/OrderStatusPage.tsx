import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, MapPin, MessageCircle, PackageCheck, Phone } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import type { Order } from '../../types';
import { CourierContactCard } from './CourierContactCard';

interface OrderStatusPageProps {
  orderNumber: string;
}

const statusLabels: Record<Order['status'], string> = {
  PENDING: 'Order placed',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Being prepared',
  READY: 'Ready for dispatch',
  OUT_FOR_DELIVERY: 'Out for delivery',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const OrderStatusPage: React.FC<OrderStatusPageProps> = ({ orderNumber }) => {
  const { userOrders, lookupOrder, navigateTo, formatMoney, lastRealtimeEvent, realtimeStatus } = useRestaurant();
  const [order, setOrder] = useState<Order | null>(
    userOrders.find((candidate) => candidate.order_number === orderNumber) ?? null
  );
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const orderId = order?.id;
  const progressSteps: [string, string, string][] = order?.order_type === 'DELIVERY'
    ? [
        ['PENDING', 'Order placed', 'We received your order.'],
        ['CONFIRMED', 'Confirmed', 'The restaurant confirmed your order.'],
        ['PREPARING', 'Being prepared', 'Your order is being prepared.'],
        ['READY', 'Ready for dispatch', 'Your order is ready for the courier.'],
        ['OUT_FOR_DELIVERY', 'Out for delivery', 'Your courier is on the way.'],
        ['COMPLETED', 'Completed', 'Your order has been delivered.'],
      ]
    : [
        ['PENDING', 'Order placed', 'We received your order.'],
        ['CONFIRMED', 'Confirmed', 'The restaurant confirmed your order.'],
        ['PREPARING', 'Being prepared', 'Your order is being prepared.'],
        ['READY', 'Ready for pickup', 'Your order is ready to collect.'],
        ['COMPLETED', 'Completed', 'Your order has been collected.'],
      ];

  useEffect(() => {
    const refreshedOrder = userOrders.find((candidate) => candidate.order_number === orderNumber);
    if (refreshedOrder) setOrder(refreshedOrder);
  }, [orderNumber, userOrders]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    lookupOrder(orderNumber)
      .then((latestOrder) => {
        if (!cancelled) setOrder(latestOrder);
      })
      .catch(() => {
        if (!cancelled) {
          setOrder(null);
          setError('We could not load this order. Please try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lookupOrder, orderNumber, refreshVersion]);

  useEffect(() => {
    if (!orderId || !lastRealtimeEvent || lastRealtimeEvent.id !== orderId) return;
    if (lastRealtimeEvent.data.resource === 'order' || lastRealtimeEvent.data.resource === 'notification') {
      setRefreshVersion((version) => version + 1);
    }
  }, [lastRealtimeEvent, orderId]);

  useEffect(() => {
    if (realtimeStatus === 'connected') setRefreshVersion((version) => version + 1);
  }, [realtimeStatus]);

  if (loading && !order) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-[#475569]" role="status">Loading order status…</div>;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-[#111827]">Order unavailable</h1>
          <p className="mt-2 text-sm text-[#475569]">{error ?? 'This order could not be found.'}</p>
          <button
            type="button"
            onClick={() => navigateTo({ type: 'my-orders' })}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#C8102E] px-4 py-2 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  const statusText = order.status === 'READY' && order.order_type === 'PICKUP'
    ? 'Ready for pickup'
    : statusLabels[order.status];

  return (
    <div className="min-h-screen bg-[#FFF8ED]/40 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-5">
        <button
          type="button"
          onClick={() => navigateTo({ type: 'my-orders' })}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-[#C8102E]"
        >
          <ArrowLeft className="h-4 w-4" /> My Orders
        </button>

        <section className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-xs sm:p-8">
          <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#475569]">Order number</p>
              <h1 className="mt-1 font-mono text-xl font-extrabold text-[#111827]">{order.order_number}</h1>
            </div>
            <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold ${
              order.status === 'COMPLETED'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : order.status === 'CANCELLED'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}>
              {order.status === 'COMPLETED' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              {statusText}
            </span>
          </div>

          {order.status === 'CANCELLED' ? (
            <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              This order has been cancelled. Please contact the restaurant if you need help.
            </p>
          ) : (
            <ol className="mt-5 space-y-1" aria-label="Order progress">
              {progressSteps.map(([key, label, description], index) => {
                const activeIndex = progressSteps.findIndex(([stepKey]) => stepKey === order.status);
                const isReached = index <= activeIndex;
                const isCurrent = index === activeIndex;
                return (
                  <li key={key} className={`relative flex min-h-[76px] gap-4 rounded-2xl px-3 py-2 ${
                    isCurrent ? 'bg-[#FFF8ED]/70' : ''
                  }`}>
                    {index < progressSteps.length - 1 && (
                      <span aria-hidden="true" className={`absolute bottom-[-1px] left-[27px] top-[42px] w-0.5 ${
                        index < activeIndex ? 'bg-[#C8102E]' : 'bg-[#E5E7EB]'
                      }`} />
                    )}
                    <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isReached ? 'bg-[#C8102E] text-white' : 'border border-[#E5E7EB] bg-white text-[#9CA3AF]'
                    } ${isCurrent ? 'ring-4 ring-[#C8102E]/20' : ''}`}>
                      {index + 1}
                    </span>
                    <div className="pb-2">
                      <p className={`text-sm font-bold ${isReached ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>{label}</p>
                      <p className="mt-1 text-xs text-[#475569]">{description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <CourierContactCard order={order} />

        <section className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-xs sm:p-8">
          <h2 className="text-base font-bold text-[#111827]">Order details</h2>
          <div className="mt-4 divide-y divide-[#E5E7EB]">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="text-[#111827]">{item.quantity} × {item.product_name}</span>
                <span className="font-semibold text-[#111827]">{formatMoney(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[#E5E7EB] pt-4 text-sm">
            <span className="font-bold text-[#111827]">Total</span>
            <span className="text-lg font-extrabold text-[#C8102E]">{formatMoney(order.total)}</span>
          </div>
          <div className="mt-4 space-y-2 text-xs text-[#475569]">
            <p className="flex items-start gap-2"><PackageCheck className="mt-0.5 h-4 w-4 shrink-0" />{order.order_type === 'DELIVERY' ? 'Delivery' : 'Pickup'}</p>
            {order.delivery_address && <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{order.delivery_address}</p>}
            <p className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" />{order.customer_phone}</p>
            <p className="flex items-start gap-2"><MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />WhatsApp notification: <strong>{order.whatsapp_status}</strong></p>
          </div>
        </section>

        <p className="text-center text-xs text-[#64748B]" role="status">
          {realtimeStatus === 'connected' ? 'Order updates are live.' : 'Live updates reconnecting. We will refresh when connected.'}
        </p>
      </div>
    </div>
  );
};
