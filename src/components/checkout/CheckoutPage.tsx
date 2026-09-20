import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { OrderType } from '../../types';
import {
  ShoppingBag,
  Truck,
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    products,
    cartSubtotal,
    siteConfig,
    formatMoney,
    createOrder,
    navigateTo,
  } = useRestaurant();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delivery fee calculation (Rule 14 & 59)
  const deliveryFee = orderType === 'DELIVERY' ? siteConfig.default_delivery_fee : 0;
  const grandTotal = cartSubtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Frontend validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 7) {
      setErrorMessage('Please enter a valid phone number so we can reach you.');
      return;
    }

    if (orderType === 'DELIVERY' && (!deliveryAddress.trim() || deliveryAddress.trim().length < 5)) {
      setErrorMessage('Please provide a complete street address for delivery.');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before checking out.');
      return;
    }

    // Disable button & show loading state (Section 24)
    setIsSubmitting(true);

    try {
      const result = await createOrder({
        customer_name: fullName.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim() || undefined,
        order_type: orderType,
        delivery_address: orderType === 'DELIVERY' ? deliveryAddress.trim() : undefined,
        customer_note: customerNote.trim() || undefined,
      });

      if (result.success && result.order) {
        navigateTo({ type: 'order-success', orderNumber: result.order.order_number });
      } else {
        setErrorMessage(result.error || 'Failed to place order. Please review and try again.');
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-stone-900">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-stone-500">
            You don't have any items in your cart to checkout.
          </p>
          <button
            id="checkout-btn-return-menu"
            onClick={() => navigateTo({ type: 'menu' })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs uppercase tracking-wider"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="checkout-page-container" className="min-h-screen bg-stone-100/70 py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          id="checkout-btn-back"
          onClick={() => navigateTo({ type: 'menu' })}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
                Express Checkout
              </span>
              <h1 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
                Complete Your Order
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                No customer account required. We will dispatch order updates directly to your phone and WhatsApp.
              </p>
            </div>

            {errorMessage && (
              <div
                id="checkout-error-banner"
                className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Contact Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>1. Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="input-customer-name"
                      className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                    >
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-customer-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Adeola Johnson"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="input-customer-phone"
                      className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                    >
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-customer-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0803 123 4567 or +234..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="input-customer-email"
                    className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                  >
                    Email Address <span className="text-stone-400 text-[10px] font-normal">(Optional for e-receipt)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-customer-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="adeola@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Order Type Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>2. Order Fulfillment Method</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <label
                    id="label-order-type-delivery"
                    className={`flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      orderType === 'DELIVERY'
                        ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                        : 'border-stone-200 bg-stone-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-stone-900 text-sm flex items-center gap-2">
                        <Truck className="w-4 h-4 text-amber-600" />
                        <span>Delivery</span>
                      </span>
                      <input
                        type="radio"
                        name="order_type"
                        checked={orderType === 'DELIVERY'}
                        onChange={() => setOrderType('DELIVERY')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                    </div>
                    <span className="text-xs text-stone-500">
                      Dispatched to your address (+{formatMoney(siteConfig.default_delivery_fee)})
                    </span>
                  </label>

                  <label
                    id="label-order-type-pickup"
                    className={`flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      orderType === 'PICKUP'
                        ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                        : 'border-stone-200 bg-stone-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-stone-900 text-sm flex items-center gap-2">
                        <Store className="w-4 h-4 text-amber-600" />
                        <span>Self Pickup</span>
                      </span>
                      <input
                        type="radio"
                        name="order_type"
                        checked={orderType === 'PICKUP'}
                        onChange={() => setOrderType('PICKUP')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                    </div>
                    <span className="text-xs text-stone-500">
                      Free pickup at restaurant counter
                    </span>
                  </label>
                </div>
              </div>

              {/* 3. Delivery Address (Required only if Delivery - Section 18 & 22) */}
              {orderType === 'DELIVERY' ? (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <label
                    htmlFor="input-delivery-address"
                    className="block text-xs font-bold uppercase tracking-wider text-stone-700"
                  >
                    Delivery Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <textarea
                      id="input-delivery-address"
                      required={orderType === 'DELIVERY'}
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. Flat 4B, Oceanview Towers, Admiralty Way, Lekki Phase 1, Lagos"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-stone-700 flex items-start gap-3">
                  <Store className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-bold mb-0.5">
                      Pickup Location
                    </strong>
                    {siteConfig.address} • Ready in 20-30 minutes after confirmation.
                  </div>
                </div>
              )}

              {/* 4. Customer Note */}
              <div className="space-y-2">
                <label
                  htmlFor="input-customer-note"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700"
                >
                  Special Kitchen Notes <span className="text-stone-400 text-[10px] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <textarea
                    id="input-customer-note"
                    rows={2}
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="e.g. Extra spicy suya pepper, sauce on the side, or gate security code..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Submit Button (Section 24: Disabled & loading state) */}
              <div className="pt-4 border-t border-stone-100">
                <button
                  id="checkout-btn-place-order"
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 text-stone-950 font-bold py-4 px-6 rounded-2xl text-base shadow-xl transition-all ${
                    isSubmitting
                      ? 'bg-amber-400/80 cursor-not-allowed opacity-90'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-orange-950/20 active:scale-98'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-stone-950" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-stone-950" />
                      <span>Place Order • {formatMoney(grandTotal)}</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-stone-400 mt-2.5">
                  Safe checkout • You will receive an instant order number & WhatsApp confirmation
                </p>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl space-y-6">
            <h3 className="font-serif-display text-xl font-bold text-white flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-normal text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                {cart.length} item{cart.length > 1 ? 's' : ''}
              </span>
            </h3>

            {/* Itemized List */}
            <div className="divide-y divide-stone-800 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.product_id);
                if (!product) return null;
                const itemTotal = product.price * item.quantity;

                return (
                  <div key={item.product_id} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-stone-800 text-amber-400 text-xs font-bold flex items-center justify-center">
                        {item.quantity}×
                      </span>
                      <div>
                        <p className="font-semibold text-stone-100 line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-stone-400">
                          {formatMoney(product.price)} each
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-white ml-2">
                      {formatMoney(itemTotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-stone-800 pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span className="text-white font-medium">{formatMoney(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Delivery Fee</span>
                <span className="text-white font-medium">
                  {orderType === 'DELIVERY' ? formatMoney(deliveryFee) : 'FREE (Pickup)'}
                </span>
              </div>
              <div className="border-t border-stone-800 pt-3 flex justify-between text-base font-extrabold text-white">
                <span>Total Due</span>
                <span className="text-amber-400 font-serif-display text-xl">
                  {formatMoney(grandTotal)}
                </span>
              </div>
            </div>

            {/* WhatsApp Integration Notice */}
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-xs text-stone-300 space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                WhatsApp Notification Connected
              </span>
              <p className="text-stone-400">
                After submission, your receipt will be saved to our database and transmitted to our kitchen WhatsApp dispatch desk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
