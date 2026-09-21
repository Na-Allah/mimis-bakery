import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  PackageCheck,
  Clock,
  MapPin,
  ShoppingBag,
  ExternalLink,
  Phone,
  CheckCircle,
  Truck,
  ChefHat,
  MessageCircle,
} from 'lucide-react';
import { OrderStatus } from '../../types';

export const MyOrdersPage: React.FC = () => {
  const {
    currentUser,
    userOrders,
    navigateTo,
    formatMoney,
    products,
    openAuthModal,
  } = useRestaurant();

  if (!currentUser) {
    return (
      <div id="my-orders-unauthenticated" className="min-h-[70vh] flex items-center justify-center p-6 bg-[#FFF8ED]/40">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] text-[#C8102E] flex items-center justify-center mx-auto">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#111827]">Sign in to view your orders</h2>
          <p className="text-sm text-[#475569]">
            Keep track of your current food preparation, delivery progress, and past receipts.
          </p>
          <button
            id="my-orders-signin-prompt-btn"
            onClick={() => openAuthModal('login')}
            className="w-full py-3.5 px-4 bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold rounded-xl text-sm transition shadow-md shadow-[#C8102E]/20 cursor-pointer min-h-[44px]"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

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
            <CheckCircle className="w-3.5 h-3.5" /> Confirmed
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
            <Truck className="w-3.5 h-3.5" /> Ready / Out for Delivery
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Completed
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
    <div id="my-orders-page" className="min-h-screen bg-[#FFF8ED]/40 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Account Info Banner */}
        <div className="bg-white text-[#111827] p-6 sm:p-8 rounded-3xl shadow-xs border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF8ED] text-[#C8102E] border border-[#E5E7EB] flex items-center justify-center text-xl font-black">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">{currentUser.name}</h1>
                {currentUser.role === 'admin' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8ED] text-[#D4AF37] border border-[#D4AF37]/50 uppercase">
                    Staff Admin
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF8ED] text-[#475569] border border-[#E5E7EB] uppercase">
                    Customer
                  </span>
                )}
              </div>
              <p className="text-xs text-[#475569] mt-0.5">{currentUser.email}</p>
              {currentUser.phone && (
                <p className="text-xs text-[#475569] mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#C8102E]" />
                  {currentUser.phone}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#FFF8ED] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-center">
              <span className="text-xs text-[#475569] block font-medium">Your Orders</span>
              <span className="text-xl font-extrabold text-[#C8102E]">{userOrders.length}</span>
            </div>
            <button
              id="my-orders-order-food-btn"
              onClick={() => navigateTo({ type: 'menu' })}
              className="py-3 px-4 rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-[#C8102E]/20 cursor-pointer min-h-[44px]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Food</span>
            </button>
          </div>
        </div>

        {/* Orders List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-[#C8102E]" />
              <span>Order History & Active Tracking</span>
            </h2>
            <span className="text-xs text-[#475569]">Personal orders only</span>
          </div>

          {userOrders.length === 0 ? (
            <div
              id="my-orders-empty-state"
              className="bg-white p-10 sm:p-12 rounded-3xl border border-[#E5E7EB] text-center space-y-4 shadow-xs"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#FFF8ED] text-[#C8102E] border border-[#E5E7EB] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#111827]">No orders placed yet</h3>
              <p className="text-xs text-[#475569] max-w-sm mx-auto leading-relaxed">
                Ready for a flavorful feast? Explore our fresh flame-grilled meals, signature mains, and chilled drinks.
              </p>
              <button
                id="empty-orders-browse-menu-btn"
                onClick={() => navigateTo({ type: 'menu' })}
                className="py-2.5 px-5 rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs transition cursor-pointer min-h-[44px]"
              >
                Browse Full Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => {
                const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={order.id}
                    id={`order-card-${order.order_number}`}
                    className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs hover:border-[#C8102E]/60 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E7EB] gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#111827] text-base">
                            {order.order_number}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <span className="text-xs text-[#475569] block mt-1">{formattedDate}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          id={`btn-track-${order.order_number}`}
                          onClick={() =>
                            navigateTo({ type: 'track-order', orderNumber: order.order_number })
                          }
                          className="py-2 px-3.5 rounded-xl bg-[#FFF8ED] hover:bg-[#FFF8ED]/80 text-[#C8102E] border border-[#E5E7EB] font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                        >
                          <span>Live Tracker</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Order items list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.items.map((item, idx) => {
                        const product = products.find((p) => p.id === item.product_id);
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FFF8ED]/40 border border-[#E5E7EB]"
                          >
                            {product?.image ? (
                              <img
                                src={product.image}
                                alt={item.product_name}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 object-cover rounded-lg shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                                <ShoppingBag className="w-5 h-5 text-[#9CA3AF]" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-[#111827] truncate">{item.product_name}</p>
                              <p className="text-[11px] text-[#475569]">
                                Qty: {item.quantity} × {formatMoney(item.unit_price)}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-[#111827]">
                              {formatMoney(item.subtotal)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order footer */}
                    <div className="pt-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#475569] gap-2">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="capitalize font-semibold text-[#111827]">
                          Type: {order.order_type.toLowerCase()}
                        </span>
                        {order.delivery_address && (
                          <span className="flex items-center gap-1 text-[#475569] truncate max-w-xs">
                            <MapPin className="w-3 h-3 text-[#C8102E]" />
                            {order.delivery_address}
                          </span>
                        )}
                        {order.whatsapp_status === 'SENT' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                            <MessageCircle className="w-3 h-3" /> WhatsApp Dispatched
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2 sm:justify-end">
                        <span className="text-[#475569] text-xs">Total Paid:</span>
                        <span className="text-base font-extrabold text-[#C8102E]">
                          {formatMoney(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
