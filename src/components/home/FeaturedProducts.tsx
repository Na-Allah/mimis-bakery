import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ProductCard } from '../catalog/ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';

export const FeaturedProducts: React.FC = () => {
  const { featuredProducts, navigateTo } = useRestaurant();

  if (featuredProducts.length === 0) return null;

  return (
    <section id="featured-products-section" className="py-12 sm:py-16 bg-[#FFF8ED]/50 border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D4AF37]/50 text-[#111827] text-xs font-semibold uppercase tracking-wider mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C8102E]" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827]">
              Chef&apos;s Featured Selections
            </h2>
            <p className="text-[#475569] text-sm mt-1">
              Hand-picked specials from our wood grill pit and bakery ovens.
            </p>
          </div>

          <button
            id="featured-btn-view-all"
            onClick={() => navigateTo({ type: 'menu' })}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#C8102E] hover:text-[#A70D26] transition-colors group cursor-pointer"
          >
            <span>View All Menu Items</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
