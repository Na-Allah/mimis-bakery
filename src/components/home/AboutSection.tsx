import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Flame, Clock, MapPin, CheckCircle } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { siteConfig } = useRestaurant();

  return (
    <section id="about-restaurant-section" className="py-12 sm:py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Visual Showcase Collage */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden shadow-md border border-[#E5E7EB] aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"
                  alt="Fresh Artisan Breads"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="bg-[#C8102E] text-white p-5 sm:p-6 rounded-3xl space-y-1 shadow-md shadow-[#C8102E]/20">
                <span className="text-3xl font-extrabold block">100%</span>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/90">
                  Fresh Wood-Fired & Stone-Deck Baking
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6 sm:pt-8">
              <div className="bg-[#FFF8ED] text-[#111827] p-5 sm:p-6 rounded-3xl space-y-2 border border-[#E5E7EB] shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] text-[#C8102E] flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="text-base sm:text-lg font-bold">Heritage Recipes</h4>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Authentic suya rub, slow fire roasting, and rich butter pastry crusts.
                </p>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-md border border-[#E5E7EB] aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80"
                  alt="Meat Grill Fire"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Text Story & Information */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">
                The Heritage & Craft
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] mt-2 leading-tight">
                Where Artisanal Bakery Meets Passionate Open-Flame Grilling
              </h2>
            </div>

            <p className="text-[#475569] text-sm sm:text-base leading-relaxed">
              At {siteConfig.restaurant_name}, every dish represents a dedication to traditional craft.
              Our bakers arrive before sunrise to knead golden sweet pull-apart loaves, shape tender meat pies,
              and proof delicate pastries. Meanwhile, our grill masters prepare aromatic hickory coals and hand-blended
              suya spices for chargrilled chicken, tender beef skewers, and spicy asun.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Never Pre-Cooked</h4>
                  <p className="text-xs text-[#475569]">Every meat grill cut is flame-seared fresh upon your order.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Direct WhatsApp Dispatch</h4>
                  <p className="text-xs text-[#475569]">Real-time receipt confirmation and direct kitchen communication channel.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Carefully Sourced Ingredients</h4>
                  <p className="text-xs text-[#475569]">Prime farm meats, organic botanical coolers, and premium creamery butter.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] flex flex-wrap gap-6 text-xs text-[#475569]">
              <div className="space-y-1">
                <span className="font-bold text-[#111827] uppercase tracking-wider block">Opening Hours</span>
                <p className="flex items-center gap-1.5 text-[#475569]">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {siteConfig.opening_hours}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#111827] uppercase tracking-wider block">Location</span>
                <p className="flex items-center gap-1.5 text-[#475569]">
                  <MapPin className="w-3.5 h-3.5 text-[#C8102E]" />
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
