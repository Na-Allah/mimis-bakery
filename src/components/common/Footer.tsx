import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Flame, Phone, MapPin, Clock, Mail, MessageSquare, ShieldAlert, Lock } from 'lucide-react';
import { buildWhatsAppChatUrl } from '../../services/notificationService';

export const Footer: React.FC = () => {
  const {
    siteConfig,
    activeSections,
    navigateTo,
    isAdminAuthenticated,
    adminUser,
    setIsAdminLoginModalOpen,
  } = useRestaurant();

  const directWhatsAppUrl = buildWhatsAppChatUrl(
    siteConfig.whatsapp_number,
    `Hello ${siteConfig.restaurant_name}, I would like to make an inquiry regarding your menu and orders.`
  );

  return (
    <footer id="main-footer" className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-950">
                <Flame className="w-6 h-6" />
              </div>
              <span className="font-serif-display text-xl font-bold text-white tracking-tight">
                {siteConfig.restaurant_name}
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="pt-2">
              <a
                id="footer-btn-whatsapp"
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Menu Sections */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Menu Sections
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  id="footer-link-full-menu"
                  onClick={() => navigateTo({ type: 'menu' })}
                  className="text-stone-400 hover:text-amber-400 transition-colors"
                >
                  All Menu Items
                </button>
              </li>
              {activeSections.map((sec) => (
                <li key={sec.id}>
                  <button
                    id={`footer-link-${sec.slug}`}
                    onClick={() => navigateTo({ type: 'menu', sectionSlug: sec.slug })}
                    className="text-stone-400 hover:text-amber-400 transition-colors"
                  >
                    {sec.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  id="footer-link-track"
                  onClick={() => navigateTo({ type: 'track-order' })}
                  className="text-stone-400 hover:text-amber-400 transition-colors"
                >
                  Track Existing Order
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Contact & Location
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{siteConfig.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a
                  href={`tel:${siteConfig.phone.replace(/[^0-9+]/g, '')}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{siteConfig.opening_hours}</span>
              </li>
            </ul>
          </div>

          {/* Ordering Information */}
          <div className="bg-stone-900/80 p-5 rounded-2xl border border-stone-800 space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">
              Ordering Policy
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Orders placed online are validated and dispatched directly to our kitchen staff with real-time WhatsApp order tracking receipts.
            </p>
            <div className="text-xs text-amber-400/90 font-medium pt-1">
              Flat Delivery: {siteConfig.currency_symbol}{siteConfig.default_delivery_fee.toLocaleString()} (Free in-store pickup)
            </div>
            <div className="pt-2">
              {isAdminAuthenticated ? (
                <button
                  id="footer-btn-admin-portal"
                  onClick={() => navigateTo({ type: 'admin' })}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin Portal ({adminUser?.name || 'Administrator'})</span>
                </button>
              ) : (
                <button
                  id="footer-btn-staff-login"
                  onClick={() => setIsAdminLoginModalOpen(true)}
                  className="text-[11px] text-stone-500 hover:text-stone-300 flex items-center gap-1.5 transition-colors"
                  title="Staff Management Portal Sign In"
                >
                  <Lock className="w-3 h-3 text-stone-500" />
                  <span>Restaurant Staff Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-stone-850 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>
            © {new Date().getFullYear()} {siteConfig.restaurant_name}. All rights reserved.
          </p>
          <p className="text-stone-400">
            Powered by Single-Restaurant Ordering Platform
          </p>
        </div>
      </div>
    </footer>
  );
};
