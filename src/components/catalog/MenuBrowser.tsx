import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, Flame, Croissant, UtensilsCrossed, X } from 'lucide-react';

interface MenuBrowserProps {
  initialSectionSlug?: string;
  initialCategorySlug?: string;
}

export const MenuBrowser: React.FC<MenuBrowserProps> = ({
  initialSectionSlug,
  initialCategorySlug,
}) => {
  const {
    activeSections,
    categories,
    activeProducts,
    navigateTo,
  } = useRestaurant();

  const [selectedSectionSlug, setSelectedSectionSlug] = useState<string>(
    initialSectionSlug || 'all'
  );
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(
    initialCategorySlug || 'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  // Sync when initialSectionSlug changes
  React.useEffect(() => {
    if (initialSectionSlug) {
      setSelectedSectionSlug(initialSectionSlug);
    }
  }, [initialSectionSlug]);

  React.useEffect(() => {
    if (initialCategorySlug) {
      setSelectedCategorySlug(initialCategorySlug);
    }
  }, [initialCategorySlug]);

  // Selected section object
  const currentSection = useMemo(() => {
    if (selectedSectionSlug === 'all') return null;
    return activeSections.find((s) => s.slug === selectedSectionSlug);
  }, [selectedSectionSlug, activeSections]);

  // Available categories for the currently active section
  const availableCategories = useMemo(() => {
    if (!currentSection) {
      return categories.filter((c) => c.is_active);
    }
    return categories.filter((c) => c.section_id === currentSection.id && c.is_active);
  }, [currentSection, categories]);

  // Handle section switch
  const handleSectionSelect = (slug: string) => {
    setSelectedSectionSlug(slug);
    setSelectedCategorySlug('all');
  };

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return activeProducts.filter((product) => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      // 2. Section filter
      if (currentSection) {
        const cat = categories.find((c) => c.id === product.category_id);
        if (!cat || cat.section_id !== currentSection.id) return false;
      }

      // 3. Category filter
      if (selectedCategorySlug !== 'all') {
        const cat = categories.find((c) => c.id === product.category_id);
        if (!cat || cat.slug !== selectedCategorySlug) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // 'featured'
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return a.display_order - b.display_order;
    });
  }, [activeProducts, searchQuery, currentSection, selectedCategorySlug, sortBy, categories]);

  const getSectionIcon = (slug: string) => {
    switch (slug) {
      case 'meat-grill':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'bakery':
        return <Croissant className="w-4 h-4 text-amber-600" />;
      case 'food-drinks':
        return <UtensilsCrossed className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <div id="menu-browser-container" className="py-8 sm:py-12 bg-stone-100/60 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title & Subtitle */}
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Kitchen Menus & Offerings
            </span>
            <h1 className="font-serif-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
              {currentSection ? currentSection.name : 'Complete Restaurant Menu'}
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              {currentSection
                ? currentSection.description
                : 'Browse our full catalog spanning artisan bakery loaves, flame-grilled cuts, and refreshing drinks.'}
            </p>
          </div>
          {/* Subtle background flair */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-amber-600/10 to-transparent pointer-events-none" />
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 scrollbar-none">
          <button
            id="tab-section-all"
            onClick={() => handleSectionSelect('all')}
            className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedSectionSlug === 'all'
                ? 'bg-stone-900 text-amber-400 shadow-md'
                : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <span>All Sections</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-amber-300">
              {activeProducts.length}
            </span>
          </button>

          {activeSections.map((sec) => {
            const isSelected = selectedSectionSlug === sec.slug;
            const count = activeProducts.filter((p) => {
              const cat = categories.find((c) => c.id === p.category_id);
              return cat && cat.section_id === sec.id;
            }).length;

            return (
              <button
                key={sec.id}
                id={`tab-section-${sec.slug}`}
                onClick={() => handleSectionSelect(sec.slug)}
                className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-stone-900 text-amber-400 shadow-md'
                    : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 border border-stone-200'
                }`}
              >
                {getSectionIcon(sec.slug)}
                <span>{sec.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-stone-800 text-amber-300' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Pills (Sub-Categories) */}
        {availableCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              id="pill-cat-all"
              onClick={() => setSelectedCategorySlug('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategorySlug === 'all'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
              }`}
            >
              All Categories
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                id={`pill-cat-filter-${cat.slug}`}
                onClick={() => setSelectedCategorySlug(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategorySlug === cat.slug
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Search & Sort Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Live Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-menu-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chicken, suya, bread, jollof..."
              className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Result Count and Sort Dropdown */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 text-xs text-stone-500">
            <span className="font-medium">
              Showing <strong className="text-stone-900">{filteredProducts.length}</strong> items
            </span>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
              <select
                id="select-menu-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold py-1.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div
            id="menu-products-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State (Section 56 of spec.md) */
          <div
            id="menu-empty-state"
            className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 max-w-lg mx-auto space-y-4 my-12"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-stone-900">
              No matching menu items found
            </h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              We couldn't find any dishes matching "{searchQuery}". Try searching for another keyword or clear your filters.
            </p>
            <button
              id="btn-clear-search-filter"
              onClick={() => {
                setSearchQuery('');
                setSelectedSectionSlug('all');
                setSelectedCategorySlug('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-amber-400 font-bold text-xs uppercase tracking-wider hover:bg-stone-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
