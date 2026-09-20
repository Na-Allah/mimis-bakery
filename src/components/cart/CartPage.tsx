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
  Truck,
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
    siteConfig,
    formatMoney,
    navigateTo,
  } = useRestaurant();

  if (cart.length === 0) {
    return (
      <div id="cart-page-empty" className="min-h-screen bg-stone-100/70 py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-stone-900">
            Your cart is empty.
          </h2>
          <p className="text-sm text-stone-500 max-w-xs mx-auto leading-relaxed">
            Looks like you haven't added any flame-grilled meats or fresh bakery treats to your order yet.
          </p>
          <button
            id="cart-page-btn-browse-menu"
            onClick={() => navigateTo({ type: 'menu' })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <Utensils className="w-4 h-4" />
            <span>Browse Menu</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="cart-page-container" className="min-h-screen bg-stone-100/70 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            id="cart-page-btn-back"
            onClick={() => navigateTo({ type: 'menu' })}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>

          <button
            id="cart-page-btn-clear-all"
            onClick={clearCart}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
          >
            Clear All Items
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items Table */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
                Your Shopping Cart
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Review your items and adjust quantities before placing order.
              </p>
            </div>

            <div className="divide-y divide-stone-100">
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
                        className="w-18 h-18 rounded-2xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                      />
                      <div>
                        <h4 className="font-serif-display text-base font-bold text-stone-900">
                          {product.name}
                        </h4>
                        <p className="text-xs text-stone-500">
                          {formatMoney(product.price)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-stone-50 border border-stone-300 rounded-xl p-0.5">
                        <button
                          onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <span className="font-bold text-stone-900 text-base min-w-[5rem] text-right">
                        {formatMoney(itemSubtotal)}
                      </span>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-stone-400 hover:text-rose-600 p-1.5 transition-colors"
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
          <div className="lg:col-span-4 bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl space-y-6">
            <h3 className="font-serif-display text-xl font-bold text-white">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span className="text-white font-bold">{formatMoney(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-400 text-xs">
                <span>Delivery Fee</span>
                <span>Calculated at checkout (Free pickup)</span>
              </div>
              <div className="border-t border-stone-800 pt-3 flex justify-between text-base font-extrabold text-white">
                <span>Estimated Total</span>
                <span className="text-amber-400 font-serif-display text-xl">
                  {formatMoney(cartSubtotal)}
                </span>
              </div>
            </div>

            <button
              id="cart-page-btn-proceed-checkout"
              onClick={() => navigateTo({ type: 'checkout' })}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold py-4 px-6 rounded-2xl shadow-lg transition-all text-sm transform active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </button>

            <div className="text-[11px] text-stone-400 space-y-1 pt-2">
              <p className="flex items-center gap-1.5 text-stone-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
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
