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
  LogIn,
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
    openAuthModal,
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
            <Truck className="w-3.5 h-3.5" /> Ready / Out
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

  // If user is not authenticated, prompt them to sign in because only users can track orders that belong to them
  if (!currentUser) {
    return (
      <div id="order-tracker-container" className="min-h-screen bg-[#FFF8ED]/40 py-10 sm:py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E7EB] shadow-xs text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] flex items-center justify-center text-[#C8102E] mx-auto shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF8ED] text-[#C8102E] border border-[#E5E7EB] text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Protected Order Tracking
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                Sign In to Track Your Orders
              </h1>
              <p className="text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
                To protect customer privacy and security, users can only track orders that belong to their own account. Please sign in or register to access real-time status and receipts.
              </p>
            </div>

            <button
              id="tracker-login-prompt-btn"
              onClick={() => openAuthModal('login')}
              className="w-full py-3.5 px-6 rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-sm transition-all shadow-md shadow-[#C8102E]/20 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>

            {/* Quick Demo Test Buttons */}
            <div className="pt-4 border-t border-[#E5E7EB] text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#475569] mb-2">
                Quick 1-Click Evaluation Sign In:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="p-3 rounded-xl bg-[#FFF8ED] border border-[#E5E7EB] text-left hover:border-[#C8102E]/40 transition cursor-pointer"
                >
                  <span className="font-bold text-[#111827] block">Customer: Adeola</span>
                  <span className="text-[11px] text-[#475569]">adeola@example.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="p-3 rounded-xl bg-[#FFF8ED] border border-[#E5E7EB] text-left hover:border-[#C8102E]/40 transition cursor-pointer"
                >
                  <span className="font-bold text-[#111827] block">Admin: Muhammad</span>
                  <span className="text-[11px] text-[#475569]">asmuhammad42@gmail.com</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <p className="text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
              Enter your unique Order Number (e.g. <span className="font-mono font-semibold text-[#111827]">ORD-XXXXXX-XXXXX</span>) to view real-time kitchen preparation and delivery progress.
            </p>

            {/* User Security Badge */}
            <div className="pt-2 flex items-center justify-center gap-2 flex-wrap text-xs text-[#475569]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8ED] border border-[#E5E7EB] text-[#111827] font-medium">
                <UserIcon className="w-3.5 h-3.5 text-[#C8102E]" />
                Signed in: <strong>{currentUser.name}</strong> ({currentUser.email})
              </span>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF8ED] border border-[#D4AF37]/50 text-[#111827] font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> Staff Admin Oversight
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium text-[11px]">
                  <Lock className="w-3 h-3 text-blue-600" /> Personal Orders Only
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
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
                }}
                placeholder="Enter ORD-XXXXXX-XXXXX..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E7EB] text-sm font-mono bg-[#FFF8ED]/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] text-[#111827] placeholder-[#9CA3AF] min-h-[44px]"
              />
            </div>
            <button
              id="btn-track-order-search"
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer min-h-[44px] flex items-center justify-center shadow-xs"
            >
              Track
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
                onClick={() =>
                  navigateTo({ type: 'order-success', orderNumber: matchedOrder.order_number })
                }
                className="w-full py-3.5 rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#C8102E]/20 min-h-[44px]"
              >
                <span>View Full Receipt & Progress Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : isForeignOrder ? (
            /* Foreign order access blocked */
            <div
              id="track-order-unauthorized-alert"
              className="p-5 rounded-2xl bg-red-50 border border-red-200 text-[#EF4444] text-xs space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-[#EF4444] flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-900 text-sm">
                      Order Belongs to Another Customer
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-200 text-red-900 text-[10px] font-bold uppercase">
                      Access Restricted
                    </span>
                  </div>
                  <p className="text-red-800 leading-relaxed">
                    You can only track orders placed from your own account. Order <code className="font-mono font-bold">{searchNumber}</code> is registered to a different customer and cannot be tracked from this account.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-red-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-red-700 text-[11px]">
                  Logged in as: <strong>{currentUser.name}</strong> ({currentUser.email})
                </span>
                <button
                  id="btn-unauthorized-view-my-orders"
                  onClick={() => navigateTo({ type: 'my-orders' })}
                  className="py-2 px-3.5 rounded-lg bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs transition cursor-pointer min-h-[36px]"
                >
                  View My Orders
                </button>
              </div>
            </div>
          ) : searched ? (
            <div
              id="track-order-not-found-alert"
              className="p-4 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] text-[#475569] text-xs flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-[#9CA3AF] shrink-0" />
              <span>No order found matching &quot;{searchNumber}&quot;. Please verify your order number and retry.</span>
            </div>
          ) : null}

          {/* User's Own Placed Orders quick list */}
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
        </div>
      </div>
    </div>
  );
};
