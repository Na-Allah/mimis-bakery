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
        return <Flame className="w-4 h-4" />;
      case 'bakery':
        return <Croissant className="w-4 h-4" />;
      case 'food-drinks':
        return <UtensilsCrossed className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div id="menu-browser-container" className="py-8 sm:py-12 bg-[#FFF8ED]/40 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header Title & Subtitle */}
        <div className="bg-white text-[#111827] rounded-3xl p-6 sm:p-10 border border-[#E5E7EB] shadow-xs relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">
              Kitchen Menus & Offerings
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111827]">
              {currentSection ? currentSection.name : 'Complete Restaurant Menu'}
            </h1>
            <p className="text-[#475569] text-sm sm:text-base leading-relaxed">
              {currentSection
                ? currentSection.description
                : 'Browse our full catalog spanning artisan bakery loaves, flame-grilled cuts, and refreshing drinks.'}
            </p>
          </div>
          {/* Subtle background flair */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-[#FFF8ED] to-transparent pointer-events-none" />
        </div>

        {/* Section Navigation Tabs - Touch friendly & Mobile First */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E7EB] scrollbar-none">
          <button
            id="tab-section-all"
            onClick={() => handleSectionSelect('all')}
            className={`px-5 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer min-h-[44px] ${
              selectedSectionSlug === 'all'
                ? 'bg-[#C8102E] text-white shadow-xs'
                : 'bg-white text-[#475569] hover:text-[#111827] hover:bg-[#FFF8ED] border border-[#E5E7EB]'
            }`}
          >
            <span>All Sections</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              selectedSectionSlug === 'all' ? 'bg-white/20 text-white' : 'bg-[#FFF8ED] text-[#475569]'
            }`}>
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
                className={`px-5 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'bg-[#C8102E] text-white shadow-xs'
                    : 'bg-white text-[#475569] hover:text-[#111827] hover:bg-[#FFF8ED] border border-[#E5E7EB]'
                }`}
              >
                {getSectionIcon(sec.slug)}
                <span>{sec.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#FFF8ED] text-[#475569]'
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              id="pill-cat-all"
              onClick={() => setSelectedCategorySlug('all')}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[36px] ${
                selectedCategorySlug === 'all'
                  ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-xs'
                  : 'bg-white text-[#475569] border border-[#E5E7EB] hover:bg-[#FFF8ED]'
              }`}
            >
              All Categories
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                id={`pill-cat-filter-${cat.slug}`}
                onClick={() => setSelectedCategorySlug(cat.slug)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[36px] ${
                  selectedCategorySlug === cat.slug
                    ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-xs'
                    : 'bg-white text-[#475569] border border-[#E5E7EB] hover:bg-[#FFF8ED]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Search & Sort Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Live Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-menu-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chicken, suya, bread, jollof..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm bg-[#FFF8ED]/30 border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] text-[#111827] placeholder-[#9CA3AF] min-h-[44px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Result Count and Sort Dropdown */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 text-xs text-[#475569]">
            <span className="font-medium">
              Showing <strong className="text-[#111827]">{filteredProducts.length}</strong> items
            </span>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <select
                id="select-menu-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#E5E7EB] text-[#111827] text-xs font-semibold py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C8102E] min-h-[38px] cursor-pointer"
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
          /* Empty State */
          <div
            id="menu-empty-state"
            className="bg-white rounded-3xl p-10 sm:p-12 text-center border border-dashed border-[#E5E7EB] max-w-lg mx-auto space-y-4 my-12"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] flex items-center justify-center text-[#C8102E] mx-auto">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[#111827]">
              No matching menu items found
            </h3>
            <p className="text-sm text-[#475569] leading-relaxed">
              We couldn&apos;t find any dishes matching &quot;{searchQuery}&quot;. Try searching for another keyword or clear your filters.
            </p>
            <button
              id="btn-clear-search-filter"
              onClick={() => {
                setSearchQuery('');
                setSelectedSectionSlug('all');
                setSelectedCategorySlug('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs tracking-wider transition-colors cursor-pointer min-h-[44px]"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
