import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { X, Plus, Minus, ShoppingBag, Flame, Check } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-stone-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            id="btn-close-product-modal"
            onClick={handleClose}
            className="absolute top-4 right-4 bg-stone-900/80 hover:bg-stone-900 text-white p-2 rounded-full backdrop-blur-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {section && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-950/80 text-amber-400 border border-stone-800 backdrop-blur-md">
                {section.name}
              </span>
            )}
            {category && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-900/80 text-stone-200 border border-stone-850 backdrop-blur-md">
                {category.name}
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif-display text-2xl font-bold text-stone-900">
                {product.name}
              </h3>
              <p className="text-xl font-extrabold text-amber-700 mt-1">
                {formatMoney(product.price)}
              </p>
            </div>
            {product.is_available ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                Available Now
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                Unavailable
              </span>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
              Description
            </h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-xs text-stone-600 space-y-1">
            <p className="font-bold text-stone-900 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Fresh Kitchen Guarantee</span>
            </p>
            <p>
              Cooked & baked to order with premium firewood or stone-deck ovens. Real-time order dispatch directly to kitchen via WhatsApp.
            </p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4">
          {product.is_available ? (
            <>
              {/* Quantity Selector (Rule 13: 1 to 99) */}
              <div className="flex items-center bg-white border border-stone-300 rounded-xl p-1 shadow-sm">
                <button
                  id="modal-btn-qty-minus"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-700 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-stone-900">
                  {quantity}
                </span>
                <button
                  id="modal-btn-qty-plus"
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-700 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                id="modal-btn-add-to-cart"
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold py-3.5 px-6 rounded-xl shadow-md transition-all transform active:scale-95 text-sm"
              >
                <ShoppingBag className="w-4 h-4 text-stone-950" />
                <span>
                  Add {quantity > 1 ? `(${quantity})` : ''} • {formatMoney(product.price * quantity)}
                </span>
              </button>
            </>
          ) : (
            <div className="w-full text-center py-2 text-sm font-bold text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
              This item is currently unavailable
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
