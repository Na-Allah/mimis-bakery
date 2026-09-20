import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const MobileCartBar: React.FC = () => {
  const { cartCount, cartSubtotal, setIsCartOpen, formatMoney, activeView, navigateTo } =
    useRestaurant();

  // Don't show on checkout or order confirmation views
  if (cartCount === 0) return null;
  if (activeView.type === 'checkout' || activeView.type === 'order-success') return null;

  return (
    <div
      id="mobile-sticky-cart-bar"
      className="fixed bottom-0 inset-x-0 z-40 p-3 sm:hidden bg-stone-950/95 backdrop-blur-md border-t border-stone-800 shadow-2xl animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-center justify-between gap-3">
        <button
          id="btn-mobile-cart-toggle"
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2.5 text-stone-100 px-2"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span className="absolute -top-2 -right-2 bg-amber-500 text-stone-950 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </div>
          <div className="text-left">
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">
              Total
            </span>
            <span className="text-sm font-bold text-white">
              {formatMoney(cartSubtotal)}
            </span>
          </div>
        </button>

        <button
          id="btn-mobile-cart-checkout"
          onClick={() => navigateTo({ type: 'checkout' })}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 active:from-amber-400 active:to-orange-500 text-stone-950 font-extrabold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-lg shadow-orange-950/40"
        >
          <span>Checkout</span>
          <ArrowRight className="w-4 h-4 text-stone-950" />
        </button>
      </div>
    </div>
  );
};
