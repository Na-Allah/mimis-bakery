import React from 'react';
import { ClipboardList, Home, LayoutGrid, ShoppingCart, UserRound } from 'lucide-react';
import type { ActiveView } from '../../types';

type NavigationTab = 'home' | 'menu' | 'cart' | 'orders' | 'profile';

interface MobileBottomNavProps {
  activeView: ActiveView;
  cartCount: number;
  onNavigate: (tab: NavigationTab) => void;
}

const tabs: { id: NavigationTab; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'menu', label: 'Menu', Icon: LayoutGrid },
  { id: 'cart', label: 'Cart', Icon: ShoppingCart },
  { id: 'orders', label: 'Orders', Icon: ClipboardList },
  { id: 'profile', label: 'Profile', Icon: UserRound },
];

function isActiveTab(tab: NavigationTab, view: ActiveView): boolean {
  switch (tab) {
    case 'home':
      return view.type === 'home';
    case 'menu':
      return view.type === 'menu' || view.type === 'product';
    case 'cart':
      return view.type === 'cart' || view.type === 'checkout';
    case 'orders':
      return view.type === 'my-orders'
        || view.type === 'order-status'
        || view.type === 'order-success'
        || view.type === 'track-order';
    case 'profile':
      return view.type === 'profile' || view.type === 'admin' || view.type === 'courier';
  }
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  cartCount,
  onNavigate,
}) => (
  <nav
    aria-label="Mobile navigation"
    className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden"
  >
    <div className="mx-auto flex min-h-[58px] max-w-md items-center justify-around gap-1 rounded-full border border-[#E5E7EB] bg-white/95 p-1.5 shadow-[0_8px_28px_rgba(17,24,39,0.16)] backdrop-blur-md">
      {tabs.map(({ id, label, Icon }) => {
        const isActive = isActiveTab(id, activeView);
        return (
          <button
            key={id}
            id={`mobile-bottom-nav-${id}`}
            type="button"
            aria-label={label}
            aria-current={isActive && id !== 'profile' ? 'page' : undefined}
            onClick={() => onNavigate(id)}
            className={`relative flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center gap-2 rounded-full px-3 text-[#111827] transition-all duration-200 ${
              isActive ? 'bg-[#FFF8ED] text-[#C8102E]' : 'hover:bg-[#FFF8ED]/70 active:bg-[#FFF8ED]'
            }`}
          >
            <span className="relative flex shrink-0 items-center justify-center">
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#C8102E]' : 'text-[#475569]'}`} strokeWidth={2} />
              {id === 'cart' && cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[9px] font-bold leading-none text-[#111827]">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </span>
            {isActive && <span className="whitespace-nowrap text-xs font-semibold text-[#111827]">{label}</span>}
          </button>
        );
      })}
    </div>
  </nav>
);
