import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  ShoppingBag,
  Flame,
  Menu as MenuIcon,
  X,
  Search,
  ShieldAlert,
  Clock,
  MapPin,
  Phone,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    siteConfig,
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    activeView,
    navigateTo,
    activeSections,
    formatMoney,
    orders,
  } = useRestaurant();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingOrdersCount = orders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  ).length;

  const handleNav = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-stone-800">
      {/* Top micro bar for quick restaurant facts */}
      <div className="bg-stone-950 text-stone-400 text-xs py-1.5 px-4 border-b border-stone-800/60 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              {siteConfig.address}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {siteConfig.opening_hours}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              id="topbar-phone"
              href={`tel:${siteConfig.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              {siteConfig.phone}
            </a>
            <span className="text-amber-400/80 font-medium">WhatsApp Dispatch Active</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand identity */}
        <div
          id="brand-logo-container"
          onClick={() => handleNav(() => navigateTo({ type: 'home' }))}
          className="flex items-center gap-3 cursor-pointer group py-2"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-950/40 group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="font-serif-display text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              {siteConfig.restaurant_name}
            </span>
            <p className="text-xs text-stone-400 tracking-wide hidden sm:block">
              {siteConfig.tagline}
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            id="nav-link-home"
            onClick={() => navigateTo({ type: 'home' })}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeView.type === 'home'
                ? 'text-amber-400 bg-stone-800'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            Home
          </button>

          <button
            id="nav-link-menu-all"
            onClick={() => navigateTo({ type: 'menu' })}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeView.type === 'menu' && !('sectionSlug' in activeView && activeView.sectionSlug)
                ? 'text-amber-400 bg-stone-800'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
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
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? 'text-amber-400 bg-stone-800 font-semibold'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
                }`}
              >
                {sec.name}
              </button>
            );
          })}

          <button
            id="nav-link-track-order"
            onClick={() => navigateTo({ type: 'track-order' })}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
              activeView.type === 'track-order'
                ? 'text-amber-400 bg-stone-800 font-semibold'
                : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
            }`}
          >
            Track Order
            {pendingOrdersCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-stone-950">
                {pendingOrdersCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right side controls: Cart + Admin + Mobile toggle */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Admin link */}
          <button
            id="nav-btn-admin"
            onClick={() => navigateTo({ type: 'admin' })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeView.type === 'admin'
                ? 'bg-amber-500 text-stone-950 border-amber-400'
                : 'border-stone-700 bg-stone-800/60 text-stone-300 hover:text-amber-400 hover:border-amber-500/50'
            }`}
            title="Restaurant Admin Portal"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* Cart button */}
          <button
            id="nav-btn-cart"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold px-3 sm:px-4 py-2 rounded-xl shadow-md shadow-orange-950/40 hover:shadow-orange-900/60 transition-all transform active:scale-95"
            aria-label="View Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-stone-950" />
              {cartCount > 0 && (
                <span
                  id="nav-cart-badge"
                  className="absolute -top-2 -right-2 bg-stone-950 text-amber-400 text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-amber-500"
                >
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-extrabold tracking-wide uppercase">
              {cartCount === 0 ? 'Cart' : formatMoney(cartSubtotal)}
            </span>
          </button>

          {/* Mobile hamburger button */}
          <button
            id="nav-btn-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-300 hover:text-white rounded-lg lg:hidden hover:bg-stone-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="lg:hidden bg-stone-950 border-b border-stone-800 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col gap-1 border-b border-stone-800 pb-3">
            <button
              id="mobile-nav-home"
              onClick={() => handleNav(() => navigateTo({ type: 'home' }))}
              className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-stone-200 hover:bg-stone-850 hover:text-amber-400"
            >
              Home
            </button>
            <button
              id="mobile-nav-menu"
              onClick={() => handleNav(() => navigateTo({ type: 'menu' }))}
              className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-stone-200 hover:bg-stone-850 hover:text-amber-400"
            >
              Full Menu
            </button>
            {activeSections.map((sec) => (
              <button
                key={sec.id}
                id={`mobile-nav-section-${sec.slug}`}
                onClick={() =>
                  handleNav(() => navigateTo({ type: 'menu', sectionSlug: sec.slug }))
                }
                className="text-left px-5 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-amber-400"
              >
                ↳ {sec.name}
              </button>
            ))}
            <button
              id="mobile-nav-track-order"
              onClick={() => handleNav(() => navigateTo({ type: 'track-order' }))}
              className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-stone-200 hover:bg-stone-850 hover:text-amber-400 flex items-center justify-between"
            >
              <span>Track Order</span>
              {pendingOrdersCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-stone-950">
                  {pendingOrdersCount} Active
                </span>
              )}
            </button>
            <button
              id="mobile-nav-admin"
              onClick={() => handleNav(() => navigateTo({ type: 'admin' }))}
              className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-amber-400 hover:bg-stone-850 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Admin Portal</span>
            </button>
          </div>

          <div className="pt-2 text-xs text-stone-400 space-y-1">
            <p className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {siteConfig.opening_hours}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              {siteConfig.address}
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
