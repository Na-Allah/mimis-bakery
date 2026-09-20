import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Flame, Clock, MapPin, Award, HeartHandshake, CheckCircle } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { siteConfig } = useRestaurant();

  return (
    <section id="about-restaurant-section" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Showcase Collage */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden shadow-lg border border-stone-200 aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"
                  alt="Fresh Artisan Breads"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="bg-amber-500 text-stone-950 p-6 rounded-3xl space-y-1 shadow-md">
                <span className="font-serif-display text-3xl font-extrabold block">100%</span>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Fresh Wood-Fired & Stone-Deck Baking
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="bg-stone-900 text-white p-6 rounded-3xl space-y-2 border border-stone-800 shadow-xl">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="font-serif-display text-lg font-bold">Heritage Recipes</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Authentic suya rub, slow fire roasting, and rich butter pastry crusts.
                </p>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-lg border border-stone-200 aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80"
                  alt="Meat Grill Fire"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Text Story & Information */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600">
                The Heritage & Craft
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900 mt-2 leading-tight">
                Where Artisanal Bakery Meets Passionate Open-Flame Grilling
              </h2>
            </div>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              At {siteConfig.restaurant_name}, every dish represents a dedication to traditional craft.
              Our bakers arrive before sunrise to knead golden sweet pull-apart loaves, shape tender meat pies,
              and proof delicate pastries. Meanwhile, our grill masters prepare aromatic hickory coals and hand-blended
              suya spices for chargrilled chicken, tender beef skewers, and spicy asun.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Never Pre-Cooked</h4>
                  <p className="text-xs text-stone-500">Every meat grill cut is flame-seared fresh upon your order.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Direct WhatsApp Dispatch</h4>
                  <p className="text-xs text-stone-500">Real-time receipt confirmation and direct kitchen communication channel.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Carefully Sourced Ingredients</h4>
                  <p className="text-xs text-stone-500">Prime farm meats, organic botanical coolers, and premium creamery butter.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-8 text-xs text-stone-600">
              <div className="space-y-1">
                <span className="font-bold text-stone-900 uppercase tracking-wider block">Opening Hours</span>
                <p className="flex items-center gap-1.5 text-stone-500">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  {siteConfig.opening_hours}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-stone-900 uppercase tracking-wider block">Location</span>
                <p className="flex items-center gap-1.5 text-stone-500">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {siteConfig.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
