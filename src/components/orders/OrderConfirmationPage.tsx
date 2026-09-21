import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  ShoppingBag,
  ArrowRight,
  Truck,
  Store,
  Share2,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import {
  buildOrderWhatsAppMessage,
  buildWhatsAppChatUrl,
} from '../../services/notificationService';

interface OrderConfirmationPageProps {
  orderNumber: string;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderNumber,
}) => {
  const { orders, siteConfig, formatMoney, navigateTo, canUserTrackOrder, currentUser } =
    useRestaurant();

  const order = orders.find((o) => o.order_number.trim().toLowerCase() === orderNumber.trim().toLowerCase());

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-serif-display text-2xl font-bold text-stone-900">
            Order Not Found
          </h2>
          <p className="text-sm text-stone-500">
            We couldn't locate order number: <code className="font-mono text-stone-800">{orderNumber}</code>
          </p>
          <button
            id="order-btn-notfound-home"
            onClick={() => navigateTo({ type: 'home' })}
            className="px-6 py-2.5 rounded-xl bg-stone-900 text-amber-400 font-bold text-xs uppercase cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Security & Ownership Gate: Users can only track/view orders that belong to them
  const canView = canUserTrackOrder(order);
  if (!canView) {
    return (
      <div id="order-access-restricted-page" className="min-h-screen bg-stone-100/70 py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
              <Lock className="w-3 h-3" /> Access Restricted
            </span>
            <h2 className="font-serif-display text-2xl font-bold text-stone-900">
              Order Belongs to Another Account
            </h2>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              For customer privacy and security, you can only track and inspect orders placed by your account.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-left space-y-1 text-xs">
            <div className="text-stone-400 text-[11px]">Requested Order:</div>
            <div className="font-mono font-bold text-stone-800">{order.order_number}</div>
            <div className="pt-2 border-t border-stone-200 text-stone-500 text-[11px]">
              Active User: <strong className="text-stone-800">{currentUser?.name}</strong> ({currentUser?.email})
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              id="order-btn-view-my-orders"
              onClick={() => navigateTo({ type: 'my-orders' })}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition cursor-pointer"
            >
              View My Orders
            </button>
            <button
              id="order-btn-track-other"
              onClick={() => navigateTo({ type: 'track-order' })}
              className="flex-1 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition cursor-pointer"
            >
              Track Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generate the formatted WhatsApp message (Section 27)
  const whatsAppMessage = buildOrderWhatsAppMessage(order, siteConfig);
  const whatsAppDirectUrl = buildWhatsAppChatUrl(siteConfig.whatsapp_number, whatsAppMessage);

  // Status progress steps
  const steps: { key: string; label: string }[] = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'READY', label: order.order_type === 'DELIVERY' ? 'Out for Delivery' : 'Ready for Pickup' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY':
        return 3;
      case 'COMPLETED':
        return 4;
      case 'CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div id="order-success-page" className="min-h-screen bg-stone-100/70 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm text-center space-y-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            Order Received!
          </span>

          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900">
            Thank you for your order.
          </h1>

          <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
            We have received your order and will process it shortly. Keep your order number handy for reference.
          </p>

          <div className="pt-2">
            <div className="inline-block bg-stone-900 text-amber-400 font-mono text-base sm:text-lg font-bold px-6 py-2.5 rounded-2xl border border-stone-800 shadow-md">
              <span className="text-stone-400 text-xs font-sans uppercase tracking-wider block font-semibold">
                Order Number
              </span>
              {order.order_number}
            </div>
          </div>

          {/* Primary Action: Direct WhatsApp Dispatch */}
          <div className="pt-4 max-w-md mx-auto space-y-2">
            <a
              id="btn-open-whatsapp-order"
              href={whatsAppDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-950/20 hover:shadow-emerald-900/40 transition-all text-sm transform active:scale-98"
            >
              <MessageSquare className="w-5 h-5 text-white" />
              <span>Send Order to Restaurant via WhatsApp</span>
            </a>
            <p className="text-[11px] text-stone-500">
              Tap above to open WhatsApp with your pre-filled itemized order receipt.
            </p>
          </div>
        </div>

        {/* Live Status Tracker Stepper */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 mb-8">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-serif-display text-lg font-bold text-stone-900">
                Order Status
              </h3>
              <p className="text-xs text-stone-500">
                Live updates directly from the kitchen
              </p>
            </div>
            <div className="text-right">
              <span
                id="badge-order-status"
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : order.status === 'CANCELLED'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {order.status !== 'CANCELLED' ? (
            <div className="grid grid-cols-5 gap-2 sm:gap-4 relative pt-2">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="text-center space-y-2">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mx-auto text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-amber-500 text-stone-950 font-extrabold shadow-md'
                          : 'bg-stone-100 text-stone-400 border border-stone-200'
                      } ${isCurrent ? 'ring-4 ring-amber-200' : ''}`}
                    >
                      {idx + 1}
                    </div>
                    <p
                      className={`text-[11px] sm:text-xs leading-tight ${
                        isPassed ? 'text-stone-900 font-bold' : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              This order has been cancelled. If you have questions, please reach out via phone or WhatsApp.
            </div>
          )}

          {/* WhatsApp Notification Delivery Status */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-stone-700">
                System WhatsApp Status:
              </span>
              <span className="font-bold text-stone-900 uppercase">
                {order.whatsapp_status}
              </span>
            </div>
            {order.whatsapp_message_id && (
              <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
                ID: {order.whatsapp_message_id.slice(0, 18)}...
              </span>
            )}
          </div>
        </div>

        {/* Snapshotted Itemized Receipt */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <h3 className="font-serif-display text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
            Itemized Order Receipt
          </h3>

          <div className="divide-y divide-stone-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                <div className="space-y-0.5">
                  <p className="font-bold text-stone-900">
                    {item.quantity} × {item.product_name}
                  </p>
                  <p className="text-xs text-stone-500">
                    Unit Price: {formatMoney(item.unit_price)}
                  </p>
                </div>
                <span className="font-bold text-stone-900">
                  {formatMoney(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-stone-900">{formatMoney(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Delivery Fee ({order.order_type === 'DELIVERY' ? 'Courier Dispatch' : 'Free Pickup'})</span>
              <span className="font-semibold text-stone-900">{formatMoney(order.delivery_fee)}</span>
            </div>
            <div className="border-t border-stone-100 pt-3 flex justify-between text-base font-extrabold text-stone-900">
              <span>Total Paid / Due</span>
              <span className="text-amber-700 font-serif-display text-xl">
                {formatMoney(order.total)}
              </span>
            </div>
          </div>

          {/* Delivery & Customer details */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-xs text-stone-600 space-y-2">
            <div className="flex justify-between">
              <span className="font-bold text-stone-900">Customer:</span>
              <span>{order.customer_name} ({order.customer_phone})</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-stone-900">Fulfillment:</span>
              <span>{order.order_type === 'DELIVERY' ? 'Doorstep Delivery' : 'In-Store Pickup'}</span>
            </div>
            {order.delivery_address && (
              <div className="flex justify-between">
                <span className="font-bold text-stone-900">Address:</span>
                <span className="text-right max-w-xs">{order.delivery_address}</span>
              </div>
            )}
            {order.customer_note && (
              <div className="flex justify-between">
                <span className="font-bold text-stone-900">Special Note:</span>
                <span className="text-right italic">{order.customer_note}</span>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              id="btn-order-success-browse-more"
              onClick={() => navigateTo({ type: 'menu' })}
              className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-850 text-amber-400 font-bold text-xs uppercase tracking-wider text-center transition-colors"
            >
              Order More Items
            </button>
            <button
              id="btn-order-success-home"
              onClick={() => navigateTo({ type: 'home' })}
              className="flex-1 py-3 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs uppercase tracking-wider text-center transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
