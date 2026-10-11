import React, { useCallback, useEffect, useState } from 'react';
import { MapPin, Phone, PackageCheck, Bike, RefreshCw } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { fetchDeliveries, courierAction } from '../../api/orders';
import type { Order } from '../../types';

export const CourierPage: React.FC = () => {
  const { currentUser, authLoading, formatMoney, showToast, lastRealtimeEvent } = useRestaurant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isCourier = currentUser?.role === 'COURIER';

  const load = useCallback(async () => {
    try {
      setOrders(await fetchDeliveries());
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not load deliveries', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!isCourier) return;
    load();
  }, [isCourier, load]);

  useEffect(() => {
    if (lastRealtimeEvent?.type === 'DELIVERIES_INVALIDATED') void load();
  }, [lastRealtimeEvent, load]);

  const act = async (id: string, action: 'pickup' | 'delivered') => {
    setBusyId(id);
    try {
      await courierAction(id, action);
      showToast(action === 'pickup' ? 'Order picked up. Safe trip!' : 'Delivery completed.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Action failed', 'error');
    } finally {
      setBusyId(null);
      load();
    }
  };

  if (authLoading) {
    return <div className="py-24 text-center text-sm text-[#475569]">Loading…</div>;
  }
  if (!isCourier) {
    return (
      <div className="py-24 text-center text-sm text-[#475569]">
        This page is for delivery staff. Please sign in with a courier account.
      </div>
    );
  }

  const onTheRoad = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY');
  const ready = orders.filter((o) => o.status === 'READY');
  const awaitingPreparation = orders.filter(
    (o) => o.status !== 'READY' && o.status !== 'OUT_FOR_DELIVERY'
  );

  const Card = ({ order }: { order: Order }) => (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-[#111827]">{order.order_number}</span>
        <span className="text-sm font-semibold text-[#111827]">{formatMoney(order.total)}</span>
      </div>
      <p className="inline-flex rounded-full bg-[#FFF8ED] px-3 py-1 text-xs font-semibold text-[#475569]">
        {order.status.replaceAll('_', ' ')}
      </p>

      <div className="text-sm text-[#475569] space-y-1.5">
        <div className="font-semibold text-[#111827]">{order.customer_name}</div>
        <a href={`tel:${order.customer_phone}`} className="flex items-center gap-2 text-[#C8102E]">
          <Phone className="w-4 h-4" /> {order.customer_phone}
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address || '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2 text-[#C8102E]"
        >
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {order.delivery_address}
        </a>
        {order.customer_note && <p className="italic">Note: {order.customer_note}</p>}
      </div>

      <ul className="text-sm text-[#111827] border-t border-[#E5E7EB] pt-3">
        {order.items.map((i) => (
          <li key={i.id}>
            {i.quantity} × {i.product_name}
          </li>
        ))}
      </ul>

      {order.status === 'READY' ? (
        <button
          disabled={busyId === order.id}
          onClick={() => act(order.id, 'pickup')}
          className="w-full min-h-[44px] rounded-xl bg-[#D4AF37] text-[#1A1A1A] font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Bike className="w-4 h-4" /> Pick up this order
        </button>
      ) : order.status === 'OUT_FOR_DELIVERY' ? (
        <button
          disabled={busyId === order.id}
          onClick={() => act(order.id, 'delivered')}
          className="w-full min-h-[44px] rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <PackageCheck className="w-4 h-4" /> Mark as delivered
        </button>
      ) : (
        <p className="rounded-lg bg-[#FFF8ED] px-3 py-2 text-sm font-medium text-[#475569]">
          Waiting for the restaurant to prepare this order.
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#111827]">My deliveries</h1>
        <button onClick={load} className="p-2 text-[#475569] hover:text-[#111827] cursor-pointer" aria-label="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#475569]">Loading deliveries…</p>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#C8102E]">
              Assigned, awaiting preparation ({awaitingPreparation.length})
            </h2>
            {awaitingPreparation.length === 0 && (
              <p className="text-sm text-[#475569]">No assigned orders are awaiting preparation.</p>
            )}
            {awaitingPreparation.map((o) => <Card key={o.id} order={o} />)}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#C8102E]">
              On the road ({onTheRoad.length})
            </h2>
            {onTheRoad.length === 0 && <p className="text-sm text-[#475569]">No assigned orders are out for delivery.</p>}
            {onTheRoad.map((o) => <Card key={o.id} order={o} />)}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#C8102E]">
              Ready for pickup ({ready.length})
            </h2>
            {ready.length === 0 && <p className="text-sm text-[#475569]">No assigned orders are waiting for pickup.</p>}
            {ready.map((o) => <Card key={o.id} order={o} />)}
          </section>
        </>
      )}
    </div>
  );
};