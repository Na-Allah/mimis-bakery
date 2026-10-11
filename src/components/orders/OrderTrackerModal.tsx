import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  Search,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Truck,
  ChefHat,
  ChevronRight,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { CourierContactCard } from './CourierContactCard';

interface OrderTrackerModalProps {
  initialOrderNumber?: string;
  initialTrackingToken?: string;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  initialOrderNumber,
  initialTrackingToken,
}) => {
  const {
    userOrders,
    currentUser,
    isAdmin,
    isOrderOwnedByUser,
    formatMoney,
    navigateTo,
    lookupOrder,
    lastRealtimeEvent,
  } = useRestaurant();

  const [searchNumber, setSearchNumber] = useState(initialOrderNumber || '');
  const [trackingToken, setTrackingToken] = useState(initialTrackingToken || '');
  const [searched, setSearched] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const trackedOrderId = matchedOrder?.id;
  const trackedOrderNumber = matchedOrder?.order_number;

  React.useEffect(() => {
    if (
      !trackedOrderId
      || !trackedOrderNumber
      || lastRealtimeEvent?.data.resource !== 'order'
      || lastRealtimeEvent.id !== trackedOrderId
    ) return;

    let cancelled = false;
    lookupOrder(trackedOrderNumber)
      .then((order) => { if (!cancelled) setMatchedOrder(order); })
      .catch(() => {
        if (!cancelled) {
          setMatchedOrder(null);
          setTrackError('This order is no longer available.');
        }
      });
    return () => { cancelled = true; };
  }, [lastRealtimeEvent, lookupOrder, trackedOrderId, trackedOrderNumber]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setMatchedOrder(null);
    setTrackError(null);

    if (!currentUser && !trackingToken.trim()) {
      setTrackError('Enter the tracking token from your order confirmation.');
      return;
    }

    setIsSearching(true);
    try {
      setMatchedOrder(
        await lookupOrder(searchNumber.trim(), currentUser ? undefined : trackingToken.trim())
      );
    } catch {
      setTrackError('We could not verify this order. Check the order number and tracking token.');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Order Placed
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200">
            <ChefHat className="w-3.5 h-3.5" /> In Kitchen
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <Truck className="w-3.5 h-3.5" />
            {matchedOrder?.order_type === 'DELIVERY' ? 'Ready for dispatch' : 'Ready for pickup'}
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <Truck className="w-3.5 h-3.5" /> Out for delivery
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-[#EF4444] border border-red-200">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="order-tracker-container" className="min-h-screen bg-[#FFF8ED]/40 py-10 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Main Tracking Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E7EB] shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] flex items-center justify-center text-[#C8102E] mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
              Track Your Order Status
            </h1>
            {/* <p className="text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
              Enter your unique Order Number (e.g. <span className="font-mono font-semibold text-[#111827]">ORD-XXXXXX-XXXXX</span>) to view real-time kitchen preparation and delivery progress.
            </p> */}

            {/* User Security Badge */}
            {currentUser && (
              <div className="pt-2 flex items-center justify-center gap-2 flex-wrap text-xs text-[#475569]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF8ED] drop-shadow-lg text-[#111827] font-medium">
                  Signed in: <strong>{currentUser.full_name}</strong>
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-track-order-number"
                type="text"
                required
                value={searchNumber}
                onChange={(e) => {
                  setSearchNumber(e.target.value);
                  setSearched(false);
                  setMatchedOrder(null);
                  setTrackError(null);
                }}
                placeholder="Enter ORD-XXXXXX-XXXXX..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E7EB] text-sm font-mono bg-[#FFF8ED]/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] text-[#111827] placeholder-[#9CA3AF] min-h-[44px]"
              />
            </div>
            {!currentUser && (
              <input
                id="input-track-order-token"
                type="password"
                required
                autoComplete="off"
                value={trackingToken}
                onChange={(e) => {
                  setTrackingToken(e.target.value);
                  setSearched(false);
                  setTrackError(null);
                }}
                placeholder="Tracking token from your order confirmation"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm font-mono bg-[#FFF8ED]/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] text-[#111827] placeholder-[#9CA3AF] min-h-[44px]"
              />
            )}
            <button
              id="btn-track-order-search"
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer min-h-[44px] flex items-center justify-center shadow-xs disabled:opacity-60"
            >
              {isSearching ? 'Checking…' : 'Track'}
            </button>
          </form>

          {/* Results Display */}
          {matchedOrder ? (
            <div id="tracked-order-result" className="pt-4 border-t border-[#E5E7EB] space-y-4">
              {/* Order Header */}
              <div className="p-4 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#475569] uppercase block font-semibold">
                      Order Number
                    </span>
                    {isAdmin && !isOrderOwnedByUser(matchedOrder) && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#111827]">
                        Staff View
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-base font-bold text-[#111827]">
                    {matchedOrder.order_number}
                  </span>
                </div>
                <div>{getStatusBadge(matchedOrder.status)}</div>
              </div>

              <CourierContactCard order={matchedOrder} />

              {/* Order Info Summary */}
              <div className="text-xs text-[#475569] grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#FFF8ED]/40 border border-[#E5E7EB]">
                <div>
                  <span className="text-[#9CA3AF] block text-[11px]">Customer</span>
                  <span className="font-semibold text-[#111827]">
                    {matchedOrder.customer_name} ({matchedOrder.customer_phone})
                  </span>
                </div>
                <div>
                  <span className="text-[#9CA3AF] block text-[11px]">Fulfillment Type</span>
                  <span className="font-semibold text-[#111827] capitalize">
                    {matchedOrder.order_type.toLowerCase()}
                  </span>
                </div>
                {matchedOrder.delivery_address && (
                  <div className="sm:col-span-2">
                    <span className="text-[#9CA3AF] block text-[11px]">Delivery Address</span>
                    <span className="font-medium text-[#111827]">
                      {matchedOrder.delivery_address}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-[#9CA3AF] block text-[11px]">Placed At</span>
                  <span className="text-[#475569]">
                    {new Date(matchedOrder.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#9CA3AF] block text-[11px]">Order Total</span>
                  <span className="font-bold text-[#111827] text-sm">
                    {formatMoney(matchedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-[#111827] block">Items in this order:</span>
                <div className="space-y-1">
                  {matchedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white border border-[#E5E7EB]"
                    >
                      <span className="text-[#111827] font-medium">
                        {item.quantity} × {item.product_name}
                      </span>
                      <span className="font-mono text-[#111827] font-semibold">
                        {formatMoney(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                id="btn-track-view-full-receipt"
                onClick={() => navigateTo({
                  type: 'order-success',
                  orderNumber: matchedOrder.order_number,
                  trackingToken: matchedOrder.tracking_token,
                })}
                className="w-full py-3.5 rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#C8102E]/20 min-h-[44px]"
              >
                <span>View Full Receipt & Progress Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : searched && trackError ? (
            <div
              id="track-order-not-found-alert"
              className="p-4 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] text-[#475569] text-xs flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-[#9CA3AF] shrink-0" />
              <span>{trackError}</span>
            </div>
          ) : null}

          {/* User's Own Placed Orders quick list */}
          {currentUser && (
          <div className="pt-6 border-t border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-[#C8102E]" />
                <span>Your Placed Orders ({userOrders.length})</span>
              </h4>
              {userOrders.length > 0 && (
                <button
                  id="btn-view-all-my-orders-link"
                  onClick={() => navigateTo({ type: 'my-orders' })}
                  className="text-xs text-[#C8102E] hover:underline font-semibold cursor-pointer"
                >
                  View All Receipts
                </button>
              )}
            </div>

            {userOrders.length === 0 ? (
              <div
                id="tracker-empty-orders"
                className="p-6 rounded-2xl bg-[#FFF8ED]/50 border border-[#E5E7EB] text-center space-y-3"
              >
                <p className="text-xs text-[#475569]">
                  You haven&apos;t placed any orders with this account yet. Once you place an order, it will appear here for fast 1-click tracking.
                </p>
                <button
                  id="tracker-browse-menu-btn"
                  onClick={() => navigateTo({ type: 'menu' })}
                  className="py-2.5 px-4 rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs transition cursor-pointer min-h-[40px]"
                >
                  Browse Menu & Place Order
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {userOrders.slice(0, 5).map((o) => {
                  const isSelected =
                    searchNumber.trim().toLowerCase() === o.order_number.trim().toLowerCase();

                  return (
                    <div
                      key={o.id}
                      id={`user-trackable-order-${o.order_number}`}
                      onClick={() => {
                        setSearchNumber(o.order_number);
                        setSearched(false);
                        setMatchedOrder(null);
                        setTrackError(null);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                        isSelected
                          ? 'border-[#C8102E] bg-[#FFF8ED] shadow-xs'
                          : 'border-[#E5E7EB] hover:border-[#C8102E]/50 hover:bg-[#FFF8ED]/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#111827] text-sm">
                            {o.order_number}
                          </span>
                          <span className="text-[10px] text-[#9CA3AF]">
                            {new Date(o.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-[#475569] text-[11px] block mt-0.5">
                          {o.items.length} item{o.items.length > 1 ? 's' : ''} • {formatMoney(o.total)} • {o.order_type.toLowerCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(o.status)}
                        <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};
