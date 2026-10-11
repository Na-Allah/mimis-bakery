import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Phone, MapPin, Clock, Mail, MessageSquare, ShieldAlert, Lock } from 'lucide-react';
import { buildWhatsAppChatUrl } from '../../services/notificationService';
import { BrandLogo } from './BrandLogo';

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
    <footer id="main-footer" className="bg-[#FFF8ED] text-[#475569] pt-14 pb-32 lg:pb-12 border-t border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10">
          {/* Brand info */}
          <div className="space-y-4">
            <BrandLogo size="lg" showTagline={true} />
            <p className="text-sm text-[#475569] leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="pt-2">
              <a
                id="footer-btn-whatsapp"
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-sm transition-all min-h-[44px]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Menu Sections */}
          <div>
            <h4 className="text-[#111827] text-sm font-semibold uppercase tracking-wider mb-3.5">
              Menu Sections
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  id="footer-link-full-menu"
                  onClick={() => navigateTo({ type: 'menu' })}
                  className="text-[#475569] hover:text-[#C8102E] transition-colors cursor-pointer py-1 block"
                >
                  All Menu Items
                </button>
              </li>
              {activeSections.map((sec) => (
                <li key={sec.id}>
                  <button
                    id={`footer-link-${sec.slug}`}
                    onClick={() => navigateTo({ type: 'menu', sectionSlug: sec.slug })}
                    className="text-[#475569] hover:text-[#C8102E] transition-colors cursor-pointer py-1 block"
                  >
                    {sec.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  id="footer-link-my-orders"
                  onClick={() => navigateTo({ type: 'my-orders' })}
                  className="text-[#475569] hover:text-[#C8102E] transition-colors cursor-pointer py-1 block"
                >
                  My Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-[#111827] text-sm font-semibold uppercase tracking-wider mb-3.5">
              Contact & Location
            </h4>
            <ul className="space-y-3 text-sm text-[#475569]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5" />
                <span>{siteConfig.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C8102E] shrink-0" />
                <a
                  href={`tel:${siteConfig.phone.replace(/[^0-9+]/g, '')}`}
                  className="hover:text-[#C8102E] transition-colors"
                >
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-[#C8102E] transition-colors"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{siteConfig.opening_hours}</span>
              </li>
            </ul>
          </div>

          {/* Ordering Information */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
            <h4 className="text-[#111827] text-sm font-semibold uppercase tracking-wider">
              Ordering Policy
            </h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Orders placed online are validated and dispatched directly to our kitchen staff with real-time WhatsApp order tracking receipts.
            </p>
            <div className="text-xs text-[#1A1A1A] font-semibold pt-1">
              Flat Delivery: <span className="text-[#C8102E]">{siteConfig.currency_symbol}{siteConfig.default_delivery_fee.toLocaleString()}</span> (Free pickup)
            </div>
            <div className="pt-2">
              {isAdminAuthenticated ? (
                <button
                  id="footer-btn-admin-portal"
                  onClick={() => navigateTo({ type: 'admin' })}
                  className="text-xs text-[#C8102E] hover:text-[#A70D26] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin Portal ({adminUser?.full_name || 'Administrator'})</span>
                </button>
              ) : (
                <button
                  id="footer-btn-staff-login"
                  onClick={() => setIsAdminLoginModalOpen(true)}
                  className="text-[11px] text-[#9CA3AF] hover:text-[#475569] flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                  title="Staff Management Portal Sign In"
                >
                  <Lock className="w-3 h-3 text-[#9CA3AF]" />
                  <span>Restaurant Staff Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[#E5E7EB] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9CA3AF] gap-3">
          <p>
            © {new Date().getFullYear()} {siteConfig.restaurant_name}. All rights reserved.
          </p>
          <p className="text-[#475569] font-medium">
            Not just by Name.
          </p>
        </div>
      </div>
    </footer>
  );
};
