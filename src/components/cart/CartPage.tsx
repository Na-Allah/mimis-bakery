import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Utensils,
  ShieldCheck,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    products,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    formatMoney,
    navigateTo,
  } = useRestaurant();

  if (cart.length === 0) {
    return (
      <div id="cart-page-empty" className="min-h-screen bg-[#FFF8ED]/40 py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 sm:p-12 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] flex items-center justify-center text-[#C8102E] mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#111827]">
            Your cart is empty.
          </h2>
          <p className="text-sm text-[#475569] max-w-xs mx-auto leading-relaxed">
            Looks like you haven&apos;t added any flame-grilled meals or fresh bakery treats to your order yet.
          </p>
          <button
            id="cart-page-btn-browse-menu"
            onClick={() => navigateTo({ type: 'menu' })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs uppercase tracking-wider transition-colors min-h-[44px] cursor-pointer"
          >
            <Utensils className="w-4 h-4" />
            <span>Browse Menu</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="cart-page-container" className="min-h-screen bg-[#FFF8ED]/40 py-8 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            id="cart-page-btn-back"
            onClick={() => navigateTo({ type: 'menu' })}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#475569] hover:text-[#111827] transition-colors min-h-[44px] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>

          <button
            id="cart-page-btn-clear-all"
            onClick={clearCart}
            className="text-xs text-[#EF4444] hover:text-red-700 font-semibold cursor-pointer min-h-[44px] flex items-center"
          >
            Clear All Items
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items Table */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6">
            <div className="border-b border-[#E5E7EB] pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                Your Shopping Cart
              </h1>
              <p className="text-xs text-[#475569] mt-1">
                Review your items and adjust quantities before placing your order.
              </p>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.product_id);
                if (!product) return null;
                const itemSubtotal = product.price * item.quantity;

                return (
                  <div
                    key={item.product_id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover bg-stone-100 border border-[#E5E7EB] shrink-0"
                      />
                      <div>
                        <h4 className="text-base font-semibold text-[#111827]">
                          {product.name}
                        </h4>
                        <p className="text-xs text-[#475569]">
                          {formatMoney(product.price)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-[#FFF8ED]/40 border border-[#E5E7EB] rounded-xl p-0.5">
                        <button
                          onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FFF8ED] text-[#111827] text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-[#111827]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FFF8ED] text-[#111827] text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <span className="font-bold text-[#111827] text-base min-w-[5rem] text-right">
                        {formatMoney(itemSubtotal)}
                      </span>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-[#9CA3AF] hover:text-[#EF4444] p-2 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checkout Summary Card */}
          <div className="lg:col-span-4 bg-white text-[#111827] rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6">
            <h3 className="text-xl font-bold text-[#111827]">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#475569]">
                <span>Subtotal</span>
                <span className="text-[#111827] font-bold">{formatMoney(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-[#475569] text-xs">
                <span>Delivery Fee</span>
                <span>Calculated at checkout (Free pickup)</span>
              </div>
              <div className="border-t border-[#E5E7EB] pt-3 flex justify-between text-base font-extrabold text-[#111827]">
                <span>Estimated Total</span>
                <span className="text-[#C8102E] text-xl font-black">
                  {formatMoney(cartSubtotal)}
                </span>
              </div>
            </div>

            <button
              id="cart-page-btn-proceed-checkout"
              onClick={() => navigateTo({ type: 'checkout' })}
              className="w-full flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold py-4 px-6 rounded-2xl shadow-md shadow-[#C8102E]/20 transition-all text-sm cursor-pointer min-h-[44px]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <div className="text-[11px] text-[#475569] space-y-1 pt-2">
              <p className="flex items-center gap-1.5 text-[#111827] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C8102E]" />
                <span>Instant Kitchen WhatsApp Notification</span>
              </p>
              <p>Delivery and pickup options selectable on the next step.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
