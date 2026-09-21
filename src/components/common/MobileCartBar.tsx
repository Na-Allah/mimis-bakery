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
      className="fixed bottom-0 inset-x-0 z-40 p-3 sm:hidden bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-center justify-between gap-3">
        <button
          id="btn-mobile-cart-toggle"
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2.5 text-[#111827] px-2 cursor-pointer min-h-[44px]"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-[#C8102E]" />
            <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-[#1A1A1A] font-extrabold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </span>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-[#475569] uppercase font-semibold tracking-wider block">
              Total
            </span>
            <span className="text-sm font-bold text-[#111827]">
              {formatMoney(cartSubtotal)}
            </span>
          </div>
        </button>

        <button
          id="btn-mobile-cart-checkout"
          onClick={() => navigateTo({ type: 'checkout' })}
          className="flex-1 flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#A70D26] active:bg-[#8E0B20] text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-md shadow-[#C8102E]/25 cursor-pointer min-h-[44px]"
        >
          <span>Checkout</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
