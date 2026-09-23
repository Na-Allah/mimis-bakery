import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Flame, Clock, Truck, ShieldCheck, ArrowRight, Utensils } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { siteConfig, navigateTo, formatMoney } = useRestaurant();

  return (
    <section id="hero-section" className="relative overflow-hidden bg-[#FFF8ED] text-[#111827] py-12 sm:py-18 lg:py-24 border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D4AF37]/50 text-[#1A1A1A] text-xs font-semibold shadow-xs">
              <Flame className="w-3.5 h-3.5 text-[#C8102E]" />
              <span>Flame-Grilled Meats & Fresh Heritage Bakery</span>
            </div> */}

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111827] leading-[1.12]">
              Savor Authentic Fire, Crust & Flavor.
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[#475569] max-w-2xl leading-relaxed">
              From charcoal-roasted suya chicken and spicy peppered asun to freshly baked morning pull-apart sweet loaves and artisanal meat pies. Order in seconds with live WhatsApp receipt dispatch.
            </p>

            {/* CTAs - Mobile-first responsive touch targets */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                id="hero-btn-order-now"
                onClick={() => navigateTo({ type: 'menu' })}
                className="flex items-center justify-center gap-2.5 bg-[#C8102E] hover:bg-[#A70D26] active:bg-[#8E0B20] text-white font-semibold px-7 py-3.5 rounded-xl shadow-md shadow-[#C8102E]/20 transition-all transform active:scale-95 text-base cursor-pointer min-h-[44px]"
              >
                <Utensils className="w-5 h-5 text-white" />
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <button
                id="hero-btn-browse-sections"
                onClick={() => {
                  const element = document.getElementById('home-sections-grid');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 bg-white hover:bg-[#FFF8ED] text-[#111827] border border-[#E5E7EB] px-6 py-3.5 rounded-xl text-base font-semibold shadow-xs transition-all cursor-pointer min-h-[44px]"
              >
                <span>Explore 3 Kitchens</span>
              </button>
            </div>

            {/* Feature badging */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-5 border-t border-[#E5E7EB] text-xs text-[#475569]">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span>
                  Delivery <strong className="text-[#111827]">{formatMoney(siteConfig.default_delivery_fee)}</strong> or Free Pickup
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Fast Kitchen Prep</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>WhatsApp Order Receipt</span>
              </div>
            </div> */}
          </div>

          {/* Right Image Composition */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#E5E7EB] aspect-[4/3] sm:aspect-[16/11]">
              <img
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80"
                alt="Wood-Fired Grill Feast"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
                  Daily Special
                </span>
                <p className="text-lg sm:text-xl font-bold text-white mt-0.5 leading-snug">
                  Flame-Grilled Meat Platters & Baked Treats
                </p>
                <p className="text-xs text-stone-200 mt-1">
                  Crafted fresh every morning using heirloom spices and prime cuts.
                </p>
              </div>
            </div>

            {/* Floating feature card */}
            <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-white/95 backdrop-blur-md border border-[#E5E7EB] p-3.5 rounded-2xl shadow-xl items-center gap-3 max-w-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8ED] border border-[#E5E7EB] flex items-center justify-center text-[#C8102E] shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#111827]">Three Distinct Kitchens</p>
                <p className="text-[#475569] text-[11px]">Bakery • Food & Drinks • Meat Grill</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
