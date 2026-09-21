import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  Search,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Lock,
  ShoppingBag,
  ShieldCheck,
  User as UserIcon,
  Truck,
  ChefHat,
  ChevronRight,
} from 'lucide-react';
import { OrderStatus } from '../../types';

interface OrderTrackerModalProps {
  initialOrderNumber?: string;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  initialOrderNumber,
}) => {
  const {
    orders,
    userOrders,
    currentUser,
    isAdmin,
    canUserTrackOrder,
    isOrderOwnedByUser,
    formatMoney,
    navigateTo,
  } = useRestaurant();

  const [searchNumber, setSearchNumber] = useState(initialOrderNumber || '');
  const [searched, setSearched] = useState(Boolean(initialOrderNumber));

  const trimmedQuery = searchNumber.trim().toLowerCase();
  const rawMatchedOrder = orders.find(
    (o) => o.order_number.trim().toLowerCase() === trimmedQuery
  );

  const isOrderAuthorized = rawMatchedOrder ? canUserTrackOrder(rawMatchedOrder) : false;
  const isForeignOrder = rawMatchedOrder && !isOrderAuthorized;
  const matchedOrder = isOrderAuthorized ? rawMatchedOrder : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Order Placed
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
            <ChefHat className="w-3.5 h-3.5" /> In Kitchen
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Truck className="w-3.5 h-3.5" /> Ready / Out
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="order-tracker-container" className="min-h-screen bg-stone-100/70 py-10 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Main Tracking Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
              Track Your Order Status
            </h1>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Enter your unique Order Number (e.g. <span className="font-mono text-stone-700">ORD-260920-00124</span>) to view real-time kitchen preparation and delivery progress.
            </p>

            {/* User Security Badge */}
            <div className="pt-2 flex items-center justify-center gap-2 flex-wrap text-xs text-stone-500">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 font-medium">
                <UserIcon className="w-3 h-3 text-amber-600" />
                Signed in: <strong>{currentUser?.name}</strong> ({currentUser?.email})
              </span>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Staff Admin Oversight
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium text-[11px]">
                  <Lock className="w-3 h-3 text-blue-600" /> Personal Orders Only
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-track-order-number"
                type="text"
                required
                value={searchNumber}
                onChange={(e) => {
                  setSearchNumber(e.target.value);
                  setSearched(false);
                }}
                placeholder="Enter ORD-XXXXXX-XXXXX..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm font-mono bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <button
              id="btn-track-order-search"
              type="submit"
              className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-850 text-amber-400 font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
            >
              Track
            </button>
          </form>

          {/* Results Display */}
          {matchedOrder ? (
            <div id="tracked-order-result" className="pt-4 border-t border-stone-100 space-y-4">
              {/* Order Header */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 uppercase block font-semibold">
                      Order Number
                    </span>
                    {isAdmin && !isOrderOwnedByUser(matchedOrder) && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                        Staff View
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-base font-bold text-stone-900">
                    {matchedOrder.order_number}
                  </span>
                </div>
                <div>{getStatusBadge(matchedOrder.status)}</div>
              </div>

              {/* Order Info Summary */}
              <div className="text-xs text-stone-600 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <div>
                  <span className="text-stone-400 block text-[11px]">Customer</span>
                  <span className="font-semibold text-stone-800">
                    {matchedOrder.customer_name} ({matchedOrder.customer_phone})
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Fulfillment Type</span>
                  <span className="font-semibold text-stone-800 capitalize">
                    {matchedOrder.order_type.toLowerCase()}
                  </span>
                </div>
                {matchedOrder.delivery_address && (
                  <div className="sm:col-span-2">
                    <span className="text-stone-400 block text-[11px]">Delivery Address</span>
                    <span className="font-medium text-stone-800">
                      {matchedOrder.delivery_address}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-stone-400 block text-[11px]">Placed At</span>
                  <span className="text-stone-700">
                    {new Date(matchedOrder.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Order Total</span>
                  <span className="font-bold text-stone-900 text-sm">
                    {formatMoney(matchedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-stone-700 block">Items in this order:</span>
                <div className="space-y-1">
                  {matchedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-white border border-stone-100"
                    >
                      <span className="text-stone-800 font-medium">
                        {item.quantity} × {item.product_name}
                      </span>
                      <span className="font-mono text-stone-600 font-semibold">
                        {formatMoney(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                id="btn-track-view-full-receipt"
                onClick={() =>
                  navigateTo({ type: 'order-success', orderNumber: matchedOrder.order_number })
                }
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>View Full Receipt & Progress Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : isForeignOrder ? (
            /* Foreign order access blocked */
            <div
              id="track-order-unauthorized-alert"
              className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-950 text-sm">
                      Order Belongs to Another Customer
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-800 text-[10px] font-bold uppercase">
                      Access Restricted
                    </span>
                  </div>
                  <p className="text-rose-800 leading-relaxed">
                    You can only track orders placed from your own account. Order <code className="font-mono font-bold">{searchNumber}</code> is registered to a different customer and cannot be tracked from this account.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-200/80 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-rose-700 text-[11px]">
                  Logged in as: <strong>{currentUser?.name}</strong> ({currentUser?.email})
                </span>
                <button
                  id="btn-unauthorized-view-my-orders"
                  onClick={() => navigateTo({ type: 'my-orders' })}
                  className="py-1.5 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  View My Orders
                </button>
              </div>
            </div>
          ) : searched ? (
            <div
              id="track-order-not-found-alert"
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-700 text-xs flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-stone-400 shrink-0" />
              <span>No order found matching "{searchNumber}". Please verify your order number and retry.</span>
            </div>
          ) : null}

          {/* User's Own Placed Orders quick list */}
          <div className="pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                <span>Your Placed Orders ({userOrders.length})</span>
              </h4>
              {userOrders.length > 0 && (
                <button
                  id="btn-view-all-my-orders-link"
                  onClick={() => navigateTo({ type: 'my-orders' })}
                  className="text-xs text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                >
                  View All Receipts
                </button>
              )}
            </div>

            {userOrders.length === 0 ? (
              <div
                id="tracker-empty-orders"
                className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 text-center space-y-3"
              >
                <p className="text-xs text-stone-500">
                  You haven't placed any orders with this account yet. Once you place an order, it will appear here for fast 1-click tracking.
                </p>
                <button
                  id="tracker-browse-menu-btn"
                  onClick={() => navigateTo({ type: 'menu' })}
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition cursor-pointer"
                >
                  Browse Menu & Place Order
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {userOrders.slice(0, 5).map((o) => {
                  const isSelected =
                    trimmedQuery === o.order_number.trim().toLowerCase();

                  return (
                    <div
                      key={o.id}
                      id={`user-trackable-order-${o.order_number}`}
                      onClick={() => {
                        setSearchNumber(o.order_number);
                        setSearched(true);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                          : 'border-stone-200 hover:border-amber-400/70 hover:bg-stone-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            {o.order_number}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(o.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-stone-500 text-[11px] block mt-0.5">
                          {o.items.length} item{o.items.length > 1 ? 's' : ''} • {formatMoney(o.total)} • {o.order_type.toLowerCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(o.status)}
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
