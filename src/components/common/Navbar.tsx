import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  ShoppingBag,
  ShieldAlert,
  Clock,
  MapPin,
  Phone,
  LogIn,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { MobileBottomNav } from './MobileBottomNav';

export const Navbar: React.FC = () => {
  const {
    siteConfig,
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    activeView,
    navigateTo,
    formatMoney,
    currentUser,
    isAuthenticated,
    isAdmin,
    openAuthModal,
    userOrders,
    activeSections,
  } = useRestaurant();

  const handleMobileTab = (tab: 'home' | 'menu' | 'cart' | 'orders' | 'profile') => {
    switch (tab) {
      case 'home':
        navigateTo({ type: 'home' });
        break;
      case 'menu':
        navigateTo({ type: 'menu' });
        break;
      case 'cart':
        navigateTo({ type: 'cart' });
        break;
      case 'orders':
        navigateTo({ type: 'my-orders' });
        break;
      case 'profile':
        navigateTo({ type: 'profile' });
        break;
    }
  };

  return (
    <>
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-[#111827] border-b border-[#E5E7EB] shadow-xs">
      {/* Top micro bar for quick restaurant facts */}
      <div className="bg-[#FFF8ED] text-[#475569] text-xs py-1.5 px-4 border-b border-[#E5E7EB] hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#111827]">
              <MapPin className="w-3.5 h-3.5 text-[#C8102E]" />
              {siteConfig.address}
            </span>y
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              {siteConfig.opening_hours}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              id="topbar-phone"
              href={`tel:${siteConfig.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-1.5 hover:text-[#C8102E] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#C8102E]" />
              {siteConfig.phone}
            </a>
            <span className="text-[#C8102E] font-semibold text-[11px] px-2 py-0.5 rounded-full bg-white border border-[#E5E7EB]">
              WhatsApp Dispatch Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand identity */}
        <div
          id="brand-logo-container"
          onClick={() => navigateTo({ type: 'home' })}
          className="cursor-pointer group py-2"
        >
          <BrandLogo size="md" showTagline={true} />
          {/* <img src="images/logo.jpeg" alt="Logo" style={{ height: 36 }} /> */}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            id="nav-link-home"
            onClick={() => navigateTo({ type: 'home' })}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeView.type === 'home'
                ? 'text-[#C8102E] bg-[#FFF8ED] font-semibold'
                : 'text-[#475569] hover:text-[#C8102E] hover:bg-[#FFF8ED]/60'
              }`}
          >
            Home
          </button>

          {isAuthenticated && (
            <>
          <button
            id="nav-link-menu-all"
            onClick={() => navigateTo({ type: 'menu' })}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeView.type === 'menu' && !('sectionSlug' in activeView && activeView.sectionSlug)
                ? 'text-[#C8102E] bg-[#FFF8ED] font-semibold'
                : 'text-[#475569] hover:text-[#C8102E] hover:bg-[#FFF8ED]/60'
              }`}
          >
            Full Menu
          </button>

          {/* Quick Section Tabs */}
          {activeSections.map((sec) => {
            const isSelected =
              activeView.type === 'menu' &&
              'sectionSlug' in activeView &&
              activeView.sectionSlug === sec.slug;
            return (
              <button
                key={sec.id}
                id={`nav-link-section-${sec.slug}`}
                onClick={() => navigateTo({ type: 'menu', sectionSlug: sec.slug })}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${isSelected
                    ? 'text-[#C8102E] bg-[#FFF8ED] font-semibold'
                    : 'text-[#475569] hover:text-[#C8102E] hover:bg-[#FFF8ED]/60'
                  }`}
              >
                {sec.name}
              </button>
            );
          })}

            </>
          )}

          {/* My Orders link for authenticated user */}
          {isAuthenticated && (
            <button
              id="nav-link-my-orders"
              onClick={() => navigateTo({ type: 'my-orders' })}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors relative cursor-pointer ${activeView.type === 'my-orders'
                  ? 'text-[#C8102E] bg-[#FFF8ED] font-semibold'
                  : 'text-[#475569] hover:text-[#C8102E] hover:bg-[#FFF8ED]/60'
                }`}
            >
              My Orders
              {userOrders.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#E5E7EB] text-[#475569]">
                  {userOrders.length}
                </span>
              )}
            </button>
          )}
        </nav>

        {/* Right side controls: Cart + Auth (with Role-Gated Admin Button) + Mobile toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* CRITICAL REQUIREMENT: Admin button ONLY visible to users with role === 'admin' */}
           {isAdmin && (
            <button
              id="nav-btn-admin"
              onClick={() => navigateTo({ type: 'admin' })}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeView.type === 'admin'
                  ? 'bg-[#1A1A1A] text-[#D4AF37] border-[#1A1A1A] shadow-sm'
                  : 'border-[#D4AF37]/60 bg-[#FFF8ED] text-[#1A1A1A] hover:bg-[#D4AF37]/15'
              }`}
              title="Restaurant Admin Portal"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Admin</span>
            </button>
          )}

          {/* User Account / Sign In Control */}


          {/* Cart button in Mimis Red */}
          {isAuthenticated && (
          <button
            id="nav-btn-cart"
            onClick={() => setIsCartOpen(true)}
            className="hidden lg:flex items-center gap-2 bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold px-3 sm:px-4 py-2 rounded-xl shadow-md shadow-[#C8102E]/20 transition-all transform active:scale-95 cursor-pointer min-h-[44px]"
            aria-label="View Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-white" />
              {cartCount > 0 && (
                <span
                  id="nav-cart-badge"
                  className="absolute -top-2 -right-2 bg-[#D4AF37] text-[#1A1A1A] text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white"
                >
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-bold tracking-wide">
              {cartCount === 0 ? 'Cart' : formatMoney(cartSubtotal)}
            </span>
          </button>
          )}
          {!isAuthenticated && (
            <button
              id="nav-desktop-signin-btn"
              onClick={() => openAuthModal('login')}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#C8102E]/30 text-[#C8102E] font-semibold text-sm min-h-[44px]"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}

        </div>
      </div>

    </header>
      <MobileBottomNav
        activeView={activeView}
        cartCount={cartCount}
        onNavigate={handleMobileTab}
      />
    </>
  );
};
