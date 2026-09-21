import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { X, Plus, Minus, ShoppingBag, Flame } from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductModal,
    setSelectedProductModal,
    formatMoney,
    addToCart,
    categories,
    sections,
  } = useRestaurant();

  const [quantity, setQuantity] = useState(1);

  if (!selectedProductModal) return null;

  const product = selectedProductModal;
  const category = categories.find((c) => c.id === product.category_id);
  const section = category ? sections.find((s) => s.id === category.section_id) : null;

  const handleClose = () => {
    setSelectedProductModal(null);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!product.is_available) return;
    addToCart(product.id, quantity);
    handleClose();
  };

  return (
    <div
      id="product-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-[#E5E7EB] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative aspect-[16/10] w-full bg-[#FFF8ED]/50 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            id="btn-close-product-modal"
            onClick={handleClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {section && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/95 text-[#111827] border border-white/60 backdrop-blur-md shadow-xs">
                {section.name}
              </span>
            )}
            {category && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#FFF8ED]/95 text-[#475569] border border-[#E5E7EB] backdrop-blur-md shadow-xs">
                {category.name}
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#111827]">
                {product.name}
              </h3>
              <p className="text-xl font-extrabold text-[#C8102E] mt-1">
                {formatMoney(product.price)}
              </p>
            </div>
            {product.is_available ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-[#16A34A] border border-emerald-200">
                Available Now
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-50 text-[#EF4444] border border-red-200">
                Unavailable
              </span>
            )}
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1">
              Description
            </h4>
            <p className="text-sm text-[#475569] leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="bg-[#FFF8ED] p-4 rounded-2xl border border-[#E5E7EB] text-xs text-[#475569] space-y-1">
            <p className="font-bold text-[#111827] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#C8102E]" />
              <span>Fresh Kitchen Guarantee</span>
            </p>
            <p>
              Cooked & baked to order with premium firewood or stone-deck ovens. Real-time order dispatch directly to kitchen via WhatsApp.
            </p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 sm:p-6 bg-[#FFF8ED]/40 border-t border-[#E5E7EB] flex items-center justify-between gap-4">
          {product.is_available ? (
            <>
              {/* Quantity Selector */}
              <div className="flex items-center bg-white border border-[#E5E7EB] rounded-xl p-1 shadow-xs">
                <button
                  id="modal-btn-qty-minus"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#FFF8ED] text-[#111827] transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-9 text-center text-sm font-bold text-[#111827]">
                  {quantity}
                </span>
                <button
                  id="modal-btn-qty-plus"
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#FFF8ED] text-[#111827] transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                id="modal-btn-add-to-cart"
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#A70D26] active:bg-[#8E0B20] text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-[#C8102E]/20 transition-all transform active:scale-95 text-sm cursor-pointer min-h-[44px]"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span>
                  Add {quantity > 1 ? `(${quantity})` : ''} • {formatMoney(product.price * quantity)}
                </span>
              </button>
            </>
          ) : (
            <div className="w-full text-center py-2.5 text-sm font-semibold text-[#EF4444] bg-red-50 rounded-xl border border-red-200">
              This item is currently unavailable
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
