import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ProductCard } from '../catalog/ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';

export const FeaturedProducts: React.FC = () => {
  const { featuredProducts, navigateTo } = useRestaurant();

  if (featuredProducts.length === 0) return null;

  return (
    <section id="featured-products-section" className="py-16 sm:py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900">
              Chef's Featured Selections
            </h2>
            <p className="text-stone-600 text-sm mt-1">
              Hand-picked specials from our wood grill pit and bakery ovens.
            </p>
          </div>

          <button
            id="featured-btn-view-all"
            onClick={() => navigateTo({ type: 'menu' })}
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors group"
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
