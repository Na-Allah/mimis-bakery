import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  PackageCheck,
  Clock,
  MapPin,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  User as UserIcon,
  Phone,
  ShieldCheck,
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
      <div id="my-orders-unauthenticated" className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Sign in to view your orders</h2>
          <p className="text-sm text-stone-500">
            Keep track of your current food preparation, delivery progress, and past receipts.
          </p>
          <button
            id="my-orders-signin-prompt-btn"
            onClick={() => openAuthModal('login')}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm transition"
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Order Placed
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle className="w-3.5 h-3.5" /> Confirmed
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
            <Truck className="w-3.5 h-3.5" /> Ready / Out for Delivery
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Completed
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
    <div id="my-orders-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Account Info Banner */}
      <div className="bg-stone-900 text-stone-100 p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center text-xl font-black">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">{currentUser.name}</h1>
              {currentUser.role === 'admin' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  Staff Admin
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-800 text-stone-300 uppercase">
                  Customer
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">{currentUser.email}</p>
            {currentUser.phone && (
              <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-amber-500" />
                {currentUser.phone}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-stone-800/80 px-4 py-2.5 rounded-xl border border-stone-700/80 text-center">
            <span className="text-xs text-stone-400 block">Total Orders</span>
            <span className="text-xl font-bold text-amber-400">{userOrders.length}</span>
          </div>
          <button
            id="my-orders-order-food-btn"
            onClick={() => navigateTo({ type: 'menu' })}
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order Food</span>
          </button>
        </div>
      </div>

      {/* Orders List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-amber-600" />
            <span>Order History & Active Tracking</span>
          </h2>
          <span className="text-xs text-stone-500">Live synchronization</span>
        </div>

        {userOrders.length === 0 ? (
          <div
            id="my-orders-empty-state"
            className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-stone-800">No orders placed yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Ready for a flavorful feast? Explore our fresh appetizers, signature mains, and drinks.
            </p>
            <button
              id="empty-orders-browse-menu-btn"
              onClick={() => navigateTo({ type: 'menu' })}
              className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition"
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
                  className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm hover:border-amber-400/80 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-stone-900 text-base">
                          {order.order_number}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <span className="text-xs text-stone-400 block mt-1">{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        id={`btn-track-${order.order_number}`}
                        onClick={() =>
                          navigateTo({ type: 'track-order', orderNumber: order.order_number })
                        }
                        className="py-1.5 px-3.5 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 font-semibold text-xs transition flex items-center gap-1.5"
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
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100"
                        >
                          {product?.image ? (
                            <img
                              src={product.image}
                              alt={item.product_name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 object-cover rounded-lg shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center shrink-0">
                              <ShoppingBag className="w-5 h-5 text-stone-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-stone-800 truncate">{item.product_name}</p>
                            <p className="text-[11px] text-stone-500">
                              Qty: {item.quantity} × {formatMoney(item.unit_price)}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-stone-900">
                            {formatMoney(item.subtotal)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order footer */}
                  <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 gap-2">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="capitalize font-semibold text-stone-700">
                        Type: {order.order_type.toLowerCase()}
                      </span>
                      {order.delivery_address && (
                        <span className="flex items-center gap-1 text-stone-500 truncate max-w-xs">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          {order.delivery_address}
                        </span>
                      )}
                      {order.whatsapp_status === 'SENT' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                          <MessageCircle className="w-3 h-3" /> WhatsApp Dispatched
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 sm:justify-end">
                      <span className="text-stone-500 text-xs">Total Paid:</span>
                      <span className="text-base font-extrabold text-stone-900">
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
  );
};
