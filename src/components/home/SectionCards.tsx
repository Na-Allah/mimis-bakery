import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Section } from '../../types';
import { ArrowRight, Flame, Croissant, UtensilsCrossed } from 'lucide-react';

export const SectionCards: React.FC = () => {
  const { activeSections, categories, navigateTo } = useRestaurant();

  const getSectionIcon = (slug: string) => {
    switch (slug) {
      case 'meat-grill':
        return <Flame className="w-4 h-4 text-[#C8102E]" />;
      case 'bakery':
        return <Croissant className="w-4 h-4 text-[#D4AF37]" />;
      case 'food-drinks':
      default:
        return <UtensilsCrossed className="w-4 h-4 text-[#16A34A]" />;
    }
  };

  return (
    <section id="home-sections-grid" className="py-12 sm:py-16 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">
            Our Kitchen Pillars
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] mt-2">
            Explore Three Signature Sections
          </h2>
          <p className="text-[#475569] text-sm sm:text-base mt-2">
            Each kitchen department specializes in artisan preparations, perfected recipes, and the freshest market ingredients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {activeSections.map((section: Section) => {
            const sectionCats = categories.filter(
              (c) => c.section_id === section.id && c.is_active
            );

            return (
              <div
                key={section.id}
                id={`card-section-${section.slug}`}
                onClick={() => navigateTo({ type: 'menu', sectionSlug: section.slug })}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] hover:border-[#C8102E]/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
              >
                {/* Image header with overlay */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={section.image}
                    alt={section.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="absolute top-3.5 left-3.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md bg-white/90 text-[#111827] border border-white/60 shadow-xs">
                      {getSectionIcon(section.slug)}
                      <span>{section.name}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#C8102E] transition-colors">
                      {section.name}
                    </h3>
                    <p className="text-sm text-[#475569] mt-1.5 leading-relaxed">
                      {section.description}
                    </p>
                  </div>

                  {/* Categories preview pills */}
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#475569] block mb-2">
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
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FFF8ED] text-[#475569] hover:text-[#C8102E] hover:bg-[#FFF8ED]/80 border border-[#E5E7EB] transition-colors cursor-pointer min-h-[32px] flex items-center"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CTA link */}
                  <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-semibold text-[#C8102E] group-hover:text-[#A70D26]">
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
