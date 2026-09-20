import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Section } from '../../types';
import { ArrowRight, Flame, Croissant, UtensilsCrossed } from 'lucide-react';

export const SectionCards: React.FC = () => {
  const { activeSections, categories, navigateTo } = useRestaurant();

  const getSectionIcon = (slug: string) => {
    switch (slug) {
      case 'meat-grill':
        return <Flame className="w-5 h-5 text-amber-500" />;
      case 'bakery':
        return <Croissant className="w-5 h-5 text-amber-600" />;
      case 'food-drinks':
      default:
        return <UtensilsCrossed className="w-5 h-5 text-orange-500" />;
    }
  };

  const getSectionColorClasses = (slug: string) => {
    switch (slug) {
      case 'meat-grill':
        return {
          badge: 'bg-red-500/10 text-red-400 border-red-500/30',
          hoverBorder: 'hover:border-red-500/50',
          btnBg: 'bg-gradient-to-r from-red-600 to-amber-600',
        };
      case 'bakery':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          hoverBorder: 'hover:border-amber-500/50',
          btnBg: 'bg-gradient-to-r from-amber-600 to-yellow-600',
        };
      case 'food-drinks':
      default:
        return {
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          hoverBorder: 'hover:border-emerald-500/50',
          btnBg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
        };
    }
  };

  return (
    <section id="home-sections-grid" className="py-16 sm:py-20 bg-stone-900 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
            Our Kitchen Pillars
          </span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-white mt-2">
            Explore Three Signature Sections
          </h2>
          <p className="text-stone-400 text-sm sm:text-base mt-3">
            Each kitchen department specializes in artisan preparations, perfected recipes, and the freshest market ingredients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activeSections.map((section: Section) => {
            const styles = getSectionColorClasses(section.slug);
            const sectionCats = categories.filter(
              (c) => c.section_id === section.id && c.is_active
            );

            return (
              <div
                key={section.id}
                id={`card-section-${section.slug}`}
                onClick={() => navigateTo({ type: 'menu', sectionSlug: section.slug })}
                className={`group bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 ${styles.hoverBorder} shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col`}
              >
                {/* Image header with overlay */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={section.image}
                    alt={section.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md bg-stone-950/80 ${styles.badge}`}
                    >
                      {getSectionIcon(section.slug)}
                      <span>{section.name}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif-display text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {section.name}
                    </h3>
                    <p className="text-sm text-stone-400 mt-2 leading-relaxed">
                      {section.description}
                    </p>
                  </div>

                  {/* Categories preview pills */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                      Categories
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sectionCats.map((cat) => (
                        <button
                          key={cat.id}
                          id={`pill-cat-${cat.slug}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo({
                              type: 'menu',
                              sectionSlug: section.slug,
                              categorySlug: cat.slug,
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800 transition-colors"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CTA link */}
                  <div className="pt-2 border-t border-stone-850 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                    <span>Browse {section.name} Menu</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
