import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Flame, Clock, Truck, ShieldCheck, ArrowRight, Utensils } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { siteConfig, navigateTo, formatMoney } = useRestaurant();

  return (
    <section id="hero-section" className="relative overflow-hidden bg-stone-950 text-white py-16 sm:py-24 border-b border-stone-800">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide uppercase">
              <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Flame-Grilled Meats & Fresh Heritage Bakery</span>
            </div>

            <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Savor Authentic Fire, Crust & Flavor.
            </h1>

            <p className="text-base sm:text-lg text-stone-300 max-w-2xl leading-relaxed">
              From charcoal-roasted suya chicken and spicy peppered asun to freshly baked morning pull-apart sweet loaves and artisanal meat pies. Order in seconds with live WhatsApp receipt dispatch.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-btn-order-now"
                onClick={() => navigateTo({ type: 'menu' })}
                className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-orange-950/60 hover:shadow-orange-900 transition-all transform active:scale-95 text-base"
              >
                <Utensils className="w-5 h-5 text-stone-950" />
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>

              <button
                id="hero-btn-browse-sections"
                onClick={() => {
                  const element = document.getElementById('home-sections-grid');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 bg-stone-900 hover:bg-stone-850 text-stone-200 border border-stone-700 px-6 py-3.5 rounded-xl text-base font-semibold transition-all hover:border-amber-500/40"
              >
                <span>Explore 3 Kitchens</span>
              </button>
            </div>

            {/* Feature badging */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-850 text-xs text-stone-400">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Delivery <strong className="text-stone-200">{formatMoney(siteConfig.default_delivery_fee)}</strong> or Free Pickup
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Fast Kitchen Prep</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>WhatsApp Order Receipt</span>
              </div>
            </div>
          </div>

          {/* Right Image Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-800 aspect-[4/3] sm:aspect-[16/11]">
              <img
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80"
                alt="Wood-Fired Grill Feast"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-stone-200">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Daily Special
                </span>
                <p className="font-serif-display text-xl font-bold text-white mt-1">
                  Flame-Grilled Meat Platters & Baked Treats
                </p>
                <p className="text-xs text-stone-300 mt-1">
                  Crafted fresh every single morning using heirloom spices and prime cuts.
                </p>
              </div>
            </div>

            {/* Floating floating card */}
            <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-stone-900/90 backdrop-blur-md border border-stone-700 p-4 rounded-2xl shadow-xl items-center gap-3 max-w-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Three Distinct Sections</p>
                <p className="text-stone-400">Bakery • Food & Drinks • Meat Grill</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
