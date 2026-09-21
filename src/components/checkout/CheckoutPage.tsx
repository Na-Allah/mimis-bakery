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
  LogIn,
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
    currentUser,
    openAuthModal,
  } = useRestaurant();

  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.default_address || '');
  const [customerNote, setCustomerNote] = useState('');

  // Update fields if user logs in while on checkout
  React.useEffect(() => {
    if (currentUser) {
      if (!fullName) setFullName(currentUser.name);
      if (!email) setEmail(currentUser.email);
      if (!phone && currentUser.phone) setPhone(currentUser.phone);
      if (!deliveryAddress && currentUser.default_address) {
        setDeliveryAddress(currentUser.default_address);
      }
    }
  }, [currentUser]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delivery fee calculation
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
      <div className="min-h-screen bg-[#FFF8ED]/40 py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 sm:p-12 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] flex items-center justify-center text-[#C8102E] mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#111827]">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-[#475569]">
            You don&apos;t have any items in your cart to checkout.
          </p>
          <button
            id="checkout-btn-return-menu"
            onClick={() => navigateTo({ type: 'menu' })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs uppercase tracking-wider min-h-[44px]"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="checkout-page-container" className="min-h-screen bg-[#FFF8ED]/40 py-8 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          id="checkout-btn-back"
          onClick={() => navigateTo({ type: 'menu' })}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#475569] hover:text-[#111827] mb-6 transition-colors min-h-[44px] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E7EB] shadow-xs space-y-6 sm:space-y-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C8102E]">
                Express Checkout
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1">
                Complete Your Order
              </h1>
              <p className="text-sm text-[#475569] mt-1">
                Order updates and real-time status tracking will be dispatched to your phone and WhatsApp.
              </p>
            </div>

            {/* Account Status Notice */}
            {!currentUser ? (
              <div className="p-4 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="text-[#475569]">
                  <strong className="text-[#111827] block font-semibold">Have an account?</strong>
                  Sign in to link this order to your profile for easy 1-click tracking.
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-[#C8102E] font-semibold hover:bg-[#FFF8ED] transition flex items-center gap-1.5 shrink-0 min-h-[36px]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] flex items-center gap-2 text-xs text-[#475569]">
                <ShieldCheck className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span>
                  Ordering as <strong className="text-[#111827]">{currentUser.name}</strong> ({currentUser.email}). This order will be linked to your account for private tracking.
                </span>
              </div>
            )}

            {errorMessage && (
              <div
                id="checkout-error-banner"
                className="p-4 rounded-2xl bg-red-50 border border-red-200 text-[#EF4444] text-sm flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Contact Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#111827] flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
                  <User className="w-4 h-4 text-[#C8102E]" />
                  <span>1. Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="input-customer-name"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1.5"
                    >
                      Full Name <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      id="input-customer-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Adeola Johnson"
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm bg-[#FFF8ED]/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] text-[#111827] placeholder-[#9CA3AF] min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="input-customer-phone"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1.5"
                    >
                      Phone Number <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-customer-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0803 123 4567 or +234..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E7EB] text-sm bg-[#FFF8ED]/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] text-[#111827] placeholder-[#9CA3AF] min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="input-customer-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1.5"
                  >
                    Email Address <span className="text-[#9CA3AF] text-[10px] font-normal">(Optional for e-receipt)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-customer-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="adeola@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E7EB] text-sm bg-[#FFF8ED]/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] text-[#111827] placeholder-[#9CA3AF] min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Order Type Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#111827] flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
                  <Truck className="w-4 h-4 text-[#C8102E]" />
                  <span>2. Order Fulfillment Method</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    id="label-order-type-delivery"
                    className={`flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      orderType === 'DELIVERY'
                        ? 'border-[#C8102E] bg-[#FFF8ED] shadow-xs'
                        : 'border-[#E5E7EB] bg-[#FFF8ED]/20 hover:bg-[#FFF8ED]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#111827] text-sm flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#C8102E]" />
                        <span>Delivery</span>
                      </span>
                      <input
                        type="radio"
                        name="order_type"
                        checked={orderType === 'DELIVERY'}
                        onChange={() => setOrderType('DELIVERY')}
                        className="text-[#C8102E] focus:ring-[#C8102E]"
                      />
                    </div>
                    <span className="text-xs text-[#475569]">
                      Dispatched to your address (+{formatMoney(siteConfig.default_delivery_fee)})
                    </span>
                  </label>

                  <label
                    id="label-order-type-pickup"
                    className={`flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      orderType === 'PICKUP'
                        ? 'border-[#C8102E] bg-[#FFF8ED] shadow-xs'
                        : 'border-[#E5E7EB] bg-[#FFF8ED]/20 hover:bg-[#FFF8ED]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#111827] text-sm flex items-center gap-2">
                        <Store className="w-4 h-4 text-[#C8102E]" />
                        <span>Self Pickup</span>
                      </span>
                      <input
                        type="radio"
                        name="order_type"
                        checked={orderType === 'PICKUP'}
                        onChange={() => setOrderType('PICKUP')}
                        className="text-[#C8102E] focus:ring-[#C8102E]"
                      />
                    </div>
                    <span className="text-xs text-[#475569]">
                      Free pickup at restaurant counter
                    </span>
                  </label>
                </div>
              </div>

              {/* 3. Delivery Address */}
              {orderType === 'DELIVERY' ? (
                <div className="space-y-2">
                  <label
                    htmlFor="input-delivery-address"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#111827]"
                  >
                    Delivery Address <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
                    <textarea
                      id="input-delivery-address"
                      required={orderType === 'DELIVERY'}
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. Flat 4B, Oceanview Towers, Admiralty Way, Lekki Phase 1, Lagos"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E7EB] text-sm bg-[#FFF8ED]/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] text-[#111827] placeholder-[#9CA3AF]"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] text-xs text-[#475569] flex items-start gap-3">
                  <Store className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#111827] font-bold mb-0.5">
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
                  className="block text-xs font-semibold uppercase tracking-wider text-[#111827]"
                >
                  Special Kitchen Notes <span className="text-[#9CA3AF] text-[10px] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
                  <textarea
                    id="input-customer-note"
                    rows={2}
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="e.g. Extra spicy suya pepper, sauce on the side, or gate security code..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E7EB] text-sm bg-[#FFF8ED]/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] text-[#111827] placeholder-[#9CA3AF]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-[#E5E7EB]">
                <button
                  id="checkout-btn-place-order"
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-4 px-6 rounded-2xl text-base shadow-md transition-all min-h-[48px] cursor-pointer ${
                    isSubmitting
                      ? 'bg-[#C8102E]/70 cursor-not-allowed opacity-90'
                      : 'bg-[#C8102E] hover:bg-[#A70D26] shadow-[#C8102E]/20 active:scale-98'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-white" />
                      <span>Place Order • {formatMoney(grandTotal)}</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-[#475569] mt-2.5">
                  Safe checkout • You will receive an instant order number & WhatsApp confirmation
                </p>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 bg-white text-[#111827] rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6">
            <h3 className="text-xl font-bold text-[#111827] flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-semibold text-[#C8102E] bg-[#FFF8ED] px-2.5 py-1 rounded-full border border-[#E5E7EB]">
                {cart.length} item{cart.length > 1 ? 's' : ''}
              </span>
            </h3>

            {/* Itemized List */}
            <div className="divide-y divide-[#E5E7EB] max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.product_id);
                if (!product) return null;
                const itemTotal = product.price * item.quantity;

                return (
                  <div key={item.product_id} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#FFF8ED] text-[#C8102E] border border-[#E5E7EB] text-xs font-bold flex items-center justify-center">
                        {item.quantity}×
                      </span>
                      <div>
                        <p className="font-semibold text-[#111827] line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#475569]">
                          {formatMoney(product.price)} each
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[#111827] ml-2">
                      {formatMoney(itemTotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-[#E5E7EB] pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-[#475569]">
                <span>Subtotal</span>
                <span className="text-[#111827] font-semibold">{formatMoney(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Delivery Fee</span>
                <span className="text-[#111827] font-semibold">
                  {orderType === 'DELIVERY' ? formatMoney(deliveryFee) : 'FREE (Pickup)'}
                </span>
              </div>
              <div className="border-t border-[#E5E7EB] pt-3 flex justify-between text-base font-extrabold text-[#111827]">
                <span>Total Due</span>
                <span className="text-[#C8102E] text-xl font-black">
                  {formatMoney(grandTotal)}
                </span>
              </div>
            </div>

            {/* WhatsApp Integration Notice */}
            <div className="p-4 rounded-2xl bg-[#FFF8ED]/50 border border-[#E5E7EB] text-xs text-[#475569] space-y-1">
              <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                WhatsApp Notification Connected
              </span>
              <p className="text-[#475569]">
                After submission, your receipt will be saved to our database and transmitted to our kitchen WhatsApp dispatch desk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
