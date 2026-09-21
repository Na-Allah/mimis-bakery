import React, { useState, useRef, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  ShoppingBag,
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
import { BrandLogo } from './BrandLogo';

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
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-[#111827] border-b border-[#E5E7EB] shadow-xs">
      {/* Top micro bar for quick restaurant facts */}
      <div className="bg-[#FFF8ED] text-[#475569] text-xs py-1.5 px-4 border-b border-[#E5E7EB] hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#111827]">
              <MapPin className="w-3.5 h-3.5 text-[#C8102E]" />
              {siteConfig.address}
            </span>
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
          onClick={() => handleNav(() => navigateTo({ type: 'home' }))}
          className="cursor-pointer group py-2"
        >
          <BrandLogo size="md" showTagline={true} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            id="nav-link-home"
            onClick={() => navigateTo({ type: 'home' })}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeView.type === 'home'
                ? 'text-[#C8102E] bg-[#FFF8ED] font-semibold'
                : 'text-[#475569] hover:text-[#C8102E] hover:bg-[#FFF8ED]/60'
            }`}
          >
            Home
          </button>

          <button
            id="nav-link-menu-all"
            onClick={() => navigateTo({ type: 'menu' })}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeView.type === 'menu' && !('sectionSlug' in activeView && activeView.sectionSlug)
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
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'text-[#C8102E] bg-[#FFF8ED] font-semibold'
                    : 'text-[#475569] hover:text-[#C8102E] hover:bg-[#FFF8ED]/60'
                }`}
              >
                {sec.name}
              </button>
            );
          })}

          <button
            id="nav-link-track-order"
            onClick={() => navigateTo({ type: 'track-order' })}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors relative cursor-pointer ${
              activeView.type === 'track-order'
                ? 'text-[#C8102E] bg-[#FFF8ED] font-semibold'
                : 'text-[#475569] hover:text-[#C8102E] hover:bg-[#FFF8ED]/60'
            }`}
          >
            Track Order
            {pendingOrdersCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#D4AF37] text-[#1A1A1A]">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          {/* My Orders link for authenticated user */}
          {isAuthenticated && (
            <button
              id="nav-link-my-orders"
              onClick={() => navigateTo({ type: 'my-orders' })}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors relative cursor-pointer ${
                activeView.type === 'my-orders'
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
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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
          {isAuthenticated && currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                id="nav-btn-user-profile"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-[#FFF8ED] hover:bg-[#FFF8ED]/80 border border-[#E5E7EB] transition text-left cursor-pointer min-h-[44px]"
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold ${
                    isAdmin
                      ? 'bg-[#C8102E] text-white'
                      : 'bg-[#1A1A1A] text-white'
                  }`}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-[#111827] leading-tight flex items-center gap-1">
                    <span className="truncate max-w-[90px]">{currentUser.name.split(' ')[0]}</span>
                    {isAdmin ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#C8102E]/10 text-[#C8102E] font-bold uppercase">
                        Admin
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#E5E7EB] text-[#475569] font-medium uppercase">
                        User
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  id="nav-user-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3.5 py-2.5 border-b border-[#E5E7EB]">
                    <p className="text-xs font-semibold text-[#111827] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-[#475569] truncate">{currentUser.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C8102E]/10 text-[#C8102E] border border-[#C8102E]/20">
                          <ShieldCheck className="w-3 h-3 text-[#C8102E]" /> Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FFF8ED] text-[#475569] border border-[#E5E7EB]">
                          <UserIcon className="w-3 h-3 text-[#475569]" /> Customer Account
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      id="dropdown-link-my-orders"
                      onClick={() => handleNav(() => navigateTo({ type: 'my-orders' }))}
                      className="w-full text-left px-3.5 py-2 text-xs text-[#475569] hover:text-[#C8102E] hover:bg-[#FFF8ED] flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <PackageCheck className="w-3.5 h-3.5 text-[#C8102E]" />
                        My Orders
                      </span>
                      {userOrders.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E5E7EB] text-[#111827] font-bold">
                          {userOrders.length}
                        </span>
                      )}
                    </button>

                    {isAdmin && (
                      <button
                        id="dropdown-link-admin"
                        onClick={() => handleNav(() => navigateTo({ type: 'admin' }))}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#1A1A1A] hover:text-[#C8102E] hover:bg-[#FFF8ED] flex items-center gap-2 font-medium transition cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-[#D4AF37]" />
                        Admin Dashboard
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-[#E5E7EB]">
                    <button
                      id="dropdown-link-logout"
                      onClick={() => handleNav(logout)}
                      className="w-full text-left px-3.5 py-2 text-xs text-[#EF4444] hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer font-medium"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8ED] hover:bg-[#FFF8ED]/80 border border-[#E5E7EB] text-[#111827] text-xs font-semibold transition cursor-pointer min-h-[44px]"
            >
              <LogIn className="w-3.5 h-3.5 text-[#C8102E]" />
              <span>Sign In</span>
            </button>
          )}

          {/* Cart button in Mimis Red */}
          <button
            id="nav-btn-cart"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold px-3 sm:px-4 py-2 rounded-xl shadow-md shadow-[#C8102E]/20 transition-all transform active:scale-95 cursor-pointer min-h-[44px]"
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

          {/* Mobile hamburger button */}
          <button
            id="nav-btn-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#475569] hover:text-[#111827] rounded-xl lg:hidden hover:bg-[#FFF8ED] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu - Mobile-First design */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="lg:hidden bg-white border-b border-[#E5E7EB] px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {/* User Status Card in Mobile */}
          <div className="p-3.5 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] flex items-center justify-between">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                    isAdmin
                      ? 'bg-[#C8102E] text-white'
                      : 'bg-[#1A1A1A] text-white'
                  }`}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    {isAdmin ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#C8102E]/10 text-[#C8102E] font-bold uppercase">
                        Admin
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white text-[#475569] font-semibold uppercase border border-[#E5E7EB]">
                        Customer
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#475569]">{currentUser.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-[#9CA3AF]" />
                <span className="text-xs text-[#475569]">Guest Customer</span>
              </div>
            )}

            {isAuthenticated ? (
              <button
                id="mobile-nav-signout-btn"
                onClick={() => handleNav(logout)}
                className="text-xs text-[#EF4444] hover:bg-rose-50 font-semibold px-2.5 py-1.5 rounded-xl border border-rose-200 cursor-pointer min-h-[44px] flex items-center"
              >
                Sign Out
              </button>
            ) : (
              <button
                id="mobile-nav-signin-btn"
                onClick={() => handleNav(() => openAuthModal('login'))}
                className="text-xs text-[#C8102E] font-semibold px-3 py-1.5 rounded-xl bg-white border border-[#C8102E]/30 cursor-pointer min-h-[44px] flex items-center"
              >
                Sign In
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1 border-b border-[#E5E7EB] pb-3">
            <button
              id="mobile-nav-home"
              onClick={() => handleNav(() => navigateTo({ type: 'home' }))}
              className="text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#111827] hover:bg-[#FFF8ED] hover:text-[#C8102E] cursor-pointer min-h-[44px] flex items-center"
            >
              Home
            </button>
            <button
              id="mobile-nav-menu"
              onClick={() => handleNav(() => navigateTo({ type: 'menu' }))}
              className="text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#111827] hover:bg-[#FFF8ED] hover:text-[#C8102E] cursor-pointer min-h-[44px] flex items-center"
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
                className="text-left px-6 py-2 rounded-xl text-xs font-medium text-[#475569] hover:text-[#C8102E] hover:bg-[#FFF8ED] cursor-pointer min-h-[40px] flex items-center"
              >
                ↳ {sec.name}
              </button>
            ))}
            <button
              id="mobile-nav-track-order"
              onClick={() => handleNav(() => navigateTo({ type: 'track-order' }))}
              className="text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#111827] hover:bg-[#FFF8ED] hover:text-[#C8102E] flex items-center justify-between cursor-pointer min-h-[44px]"
            >
              <span>Track Order</span>
              {pendingOrdersCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#D4AF37] text-[#1A1A1A]">
                  {pendingOrdersCount} Active
                </span>
              )}
            </button>

            {isAuthenticated && (
              <button
                id="mobile-nav-my-orders"
                onClick={() => handleNav(() => navigateTo({ type: 'my-orders' }))}
                className="text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#111827] hover:bg-[#FFF8ED] hover:text-[#C8102E] flex items-center justify-between cursor-pointer min-h-[44px]"
              >
                <span className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-[#C8102E]" />
                  My Orders
                </span>
                {userOrders.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#E5E7EB] text-[#475569]">
                    {userOrders.length}
                  </span>
                )}
              </button>
            )}

            {/* Admin link strictly visible ONLY if user has admin role */}
            {isAdmin && (
              <button
                id="mobile-nav-admin"
                onClick={() => handleNav(() => navigateTo({ type: 'admin' }))}
                className="text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#1A1A1A] hover:bg-[#FFF8ED] flex items-center gap-2 mt-1 border border-[#D4AF37]/50 bg-[#FFF8ED] cursor-pointer min-h-[44px]"
              >
                <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
                <span>Admin Portal</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#1A1A1A] font-bold uppercase">
                  Staff
                </span>
              </button>
            )}
          </div>

          <div className="pt-2 text-xs text-[#475569] space-y-1.5">
            <p className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              {siteConfig.opening_hours}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#C8102E]" />
              {siteConfig.address}
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
