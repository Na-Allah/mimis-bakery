import React, { useState, useRef, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  ShoppingBag,
  Flame,
  Menu as MenuIcon,
  X,
  ShieldAlert,
  Clock,
  MapPin,
  Phone,
  LogOut,
  User as UserIcon,
  LogIn,
  ChevronDown,
  PackageCheck,
  ShieldCheck,
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
    currentUser,
    isAuthenticated,
    isAdmin,
    openAuthModal,
    logout,
    userOrders,
  } = useRestaurant();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pendingOrdersCount = orders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  ).length;

  const handleNav = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          {/* My Orders link for authenticated user */}
          {isAuthenticated && (
            <button
              id="nav-link-my-orders"
              onClick={() => navigateTo({ type: 'my-orders' })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                activeView.type === 'my-orders'
                  ? 'text-amber-400 bg-stone-800 font-semibold'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
              }`}
            >
              My Orders
              {userOrders.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-stone-700 text-stone-300">
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
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                activeView.type === 'admin'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-950/50'
                  : 'border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
              }`}
              title="Restaurant Admin Portal"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>
          )}

          {/* User Account / Sign In Control */}
          {isAuthenticated && currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                id="nav-btn-user-profile"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 transition text-left cursor-pointer"
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-extrabold ${
                    isAdmin
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-stone-950'
                      : 'bg-stone-700 text-stone-200'
                  }`}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-stone-200 leading-tight flex items-center gap-1">
                    <span className="truncate max-w-[90px]">{currentUser.name.split(' ')[0]}</span>
                    {isAdmin ? (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                        Admin
                      </span>
                    ) : (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-stone-700 text-stone-400 font-semibold uppercase">
                        User
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  id="nav-user-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-2 border-b border-stone-800/80">
                    <p className="text-xs font-semibold text-stone-100 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-stone-400 truncate">{currentUser.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <ShieldCheck className="w-3 h-3 text-amber-400" /> Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                          <UserIcon className="w-3 h-3 text-stone-400" /> Customer Account
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      id="dropdown-link-my-orders"
                      onClick={() => handleNav(() => navigateTo({ type: 'my-orders' }))}
                      className="w-full text-left px-3 py-1.5 text-xs text-stone-300 hover:text-amber-400 hover:bg-stone-800/60 flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-2">
                        <PackageCheck className="w-3.5 h-3.5 text-amber-500" />
                        My Orders
                      </span>
                      {userOrders.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-300 font-bold">
                          {userOrders.length}
                        </span>
                      )}
                    </button>

                    {/* ONLY SHOW ADMIN DASHBOARD OPTION IF USER IS ADMIN */}
                    {isAdmin && (
                      <button
                        id="dropdown-link-admin"
                        onClick={() => handleNav(() => navigateTo({ type: 'admin' }))}
                        className="w-full text-left px-3 py-1.5 text-xs text-amber-300 hover:text-amber-200 hover:bg-stone-800/60 flex items-center gap-2 font-medium transition"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        Admin Dashboard
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-stone-800/80">
                    <button
                      id="dropdown-link-logout"
                      onClick={() => handleNav(logout)}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-stone-800/60 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="nav-btn-signin"
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700/80 border border-stone-700/80 text-stone-200 text-xs font-semibold transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* Cart button */}
          <button
            id="nav-btn-cart"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold px-3 sm:px-4 py-2 rounded-xl shadow-md shadow-orange-950/40 hover:shadow-orange-900/60 transition-all transform active:scale-95"
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
          {/* User Status Card in Mobile */}
          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                    isAdmin
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-700 text-stone-200'
                  }`}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    {isAdmin ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                        Admin
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 font-semibold uppercase">
                        Customer
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400">{currentUser.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-stone-400" />
                <span className="text-xs text-stone-300">Guest Customer</span>
              </div>
            )}

            {isAuthenticated ? (
              <button
                id="mobile-nav-signout-btn"
                onClick={() => handleNav(logout)}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded bg-stone-800/80"
              >
                Sign Out
              </button>
            ) : (
              <button
                id="mobile-nav-signin-btn"
                onClick={() => handleNav(() => openAuthModal('login'))}
                className="text-xs text-amber-400 font-semibold px-3 py-1.5 rounded-lg bg-stone-800 border border-amber-500/30"
              >
                Sign In / Join
              </button>
            )}
          </div>

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

            {isAuthenticated && (
              <button
                id="mobile-nav-my-orders"
                onClick={() => handleNav(() => navigateTo({ type: 'my-orders' }))}
                className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-stone-200 hover:bg-stone-850 hover:text-amber-400 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-amber-500" />
                  My Orders
                </span>
                {userOrders.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-stone-800 text-stone-300">
                    {userOrders.length}
                  </span>
                )}
              </button>
            )}

            {/* CRITICAL REQUIREMENT: Admin link strictly visible ONLY if user has admin role */}
            {isAdmin && (
              <button
                id="mobile-nav-admin"
                onClick={() => handleNav(() => navigateTo({ type: 'admin' }))}
                className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-amber-400 hover:bg-stone-850 flex items-center gap-2 mt-1 border border-amber-500/20 bg-amber-500/5"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Admin Portal</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 font-bold uppercase">
                  Staff Only
                </span>
              </button>
            )}
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

