import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { Plus, Eye } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

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
  } = useRestaurant();

  const cartItem = cart.find((i) => i.product_id === product.id);
  const currentQty = cartItem ? cartItem.quantity : 0;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [product.image]);

  const imageSrc = getMediaUrl(product.image);

  const category = categories.find((c) => c.id === product.category_id);

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
      className={`group bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] hover:border-[#C8102E]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        !product.is_available ? 'opacity-70 bg-[#FFF8ED]/30' : ''
      }`}
    >
      <div>
        {/* Product Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FFF8ED]/50">
          {imageSrc && !imageFailed ? (
            <img
              src={imageSrc}
              alt={product.name}
              onError={() => setImageFailed(true)}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                !product.is_available ? 'grayscale contrast-75' : ''
              }`}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[#9CA3AF]">
              Image unavailable
            </div>
          )}

          {/* Badging: Category & Availability */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            {category && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-white/90 backdrop-blur-md text-[#111827] border border-white/60 shadow-xs">
                {category.name}
              </span>
            )}
            {product.is_featured && product.is_available && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37] text-[#1A1A1A] shadow-xs">
                Featured
              </span>
            )}
            {!product.is_available && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-red-100 text-[#EF4444] border border-red-200">
                Unavailable
              </span>
            )}
          </div>

          {/* Quick view overlay icon on hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white/95 backdrop-blur-md text-[#111827] text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md border border-[#E5E7EB]">
              <Eye className="w-3.5 h-3.5 text-[#C8102E]" />
              <span>View Details</span>
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h4 className="text-base sm:text-lg font-bold text-[#111827] group-hover:text-[#C8102E] transition-colors line-clamp-1">
              {product.name}
            </h4>
          </div>

          <p className="text-xs sm:text-sm text-[#475569] line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer with Price & Add Button */}
      <div className="p-4 sm:p-5 pt-0 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider block">
            Price
          </span>
          <span className="text-base sm:text-lg font-extrabold text-[#111827]">
            {formatMoney(product.price)}
          </span>
        </div>

        {/* Action Button */}
        <div>
          {!product.is_available ? (
            <span
              id={`btn-unavailable-${product.slug}`}
              className="inline-block px-3 py-1.5 rounded-xl text-xs font-semibold text-[#9CA3AF] bg-[#E5E7EB] cursor-not-allowed"
            >
              Unavailable
            </span>
          ) : currentQty === 0 ? (
            <button
              id={`btn-add-product-${product.slug}`}
              onClick={handleAdd}
              className="flex items-center gap-1.5 bg-[#C8102E] hover:bg-[#A70D26] active:bg-[#8E0B20] text-white font-semibold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-xs transition-all transform active:scale-95 cursor-pointer min-h-[38px]"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add</span>
            </button>
          ) : (
            <div className="flex items-center bg-[#1A1A1A] text-white rounded-xl p-1 shadow-xs">
              <button
                id={`btn-decrement-${product.slug}`}
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 text-[#D4AF37] font-bold text-sm transition-colors cursor-pointer"
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
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 text-[#D4AF37] font-bold text-sm transition-colors cursor-pointer"
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
