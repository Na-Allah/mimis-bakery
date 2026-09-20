import React from 'react';
import { Product } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { Plus, Check, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    formatMoney,
    addToCart,
    cart,
    updateCartQuantity,
    setSelectedProductModal,
    categories,
    sections,
  } = useRestaurant();

  const cartItem = cart.find((i) => i.product_id === product.id);
  const currentQty = cartItem ? cartItem.quantity : 0;

  const category = categories.find((c) => c.id === product.category_id);
  const section = category ? sections.find((s) => s.id === category.section_id) : null;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.is_available) return;
    addToCart(product.id, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.is_available) return;
    updateCartQuantity(product.id, currentQty + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCartQuantity(product.id, currentQty - 1);
  };

  return (
    <div
      id={`product-card-${product.slug}`}
      onClick={() => setSelectedProductModal(product)}
      className={`group bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-amber-400/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        !product.is_available ? 'opacity-70 bg-stone-50' : ''
      }`}
    >
      <div>
        {/* Product Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              !product.is_available ? 'grayscale contrast-75' : ''
            }`}
            loading="lazy"
          />

          {/* Badging: Category & Availability */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            {category && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-stone-900/80 backdrop-blur-md text-amber-400 border border-stone-800">
                {category.name}
              </span>
            )}
            {product.is_featured && product.is_available && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-stone-950 shadow-sm">
                Featured
              </span>
            )}
            {!product.is_available && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-900/90 text-rose-200 border border-rose-700">
                Unavailable
              </span>
            )}
          </div>

          {/* Quick view overlay icon on hover */}
          <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-stone-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>View Details</span>
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h4 className="font-serif-display text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
              {product.name}
            </h4>
          </div>

          <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer with Price & Add Button */}
      <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
            Price
          </span>
          <span className="text-base sm:text-lg font-extrabold text-stone-900">
            {formatMoney(product.price)}
          </span>
        </div>

        {/* Action Button */}
        <div>
          {!product.is_available ? (
            <span
              id={`btn-unavailable-${product.slug}`}
              className="inline-block px-3 py-1.5 rounded-xl text-xs font-bold text-stone-400 bg-stone-200/60 cursor-not-allowed"
            >
              Unavailable
            </span>
          ) : currentQty === 0 ? (
            <button
              id={`btn-add-product-${product.slug}`}
              onClick={handleAdd}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-sm hover:shadow transition-all transform active:scale-95"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add</span>
            </button>
          ) : (
            <div className="flex items-center bg-stone-900 text-white rounded-xl p-1 shadow-sm">
              <button
                id={`btn-decrement-${product.slug}`}
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 text-amber-400 font-bold text-sm transition-colors"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-6 text-center text-xs font-bold text-white">
                {currentQty}
              </span>
              <button
                id={`btn-increment-${product.slug}`}
                onClick={handleIncrement}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 text-amber-400 font-bold text-sm transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
