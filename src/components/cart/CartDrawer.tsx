import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Utensils } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    products,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    formatMoney,
    navigateTo,
    isAuthenticated,
  } = useRestaurant();

  if (!isAuthenticated || !isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigateTo({ type: 'checkout' });
  };

  const handleBrowseMenu = () => {
    setIsCartOpen(false);
    navigateTo({ type: 'menu' });
  };

  return (
    <div
      id="cart-drawer-overlay"
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsCartOpen(false)}
    >
      <div className="fixed inset-0 sm:inset-y-0 sm:left-auto sm:right-0 max-w-full flex justify-center sm:justify-end px-4 py-4 sm:p-0 sm:pl-10">
        <div
          id="cart-drawer-panel"
          className="w-full sm:w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between rounded-2xl sm:rounded-none overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-white text-[#111827] flex items-center justify-between border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8ED] border border-[#E5E7EB] flex items-center justify-center text-[#C8102E]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#111827]">
                  Your Cart
                </h3>
                <p className="text-xs text-[#475569]">
                  {cart.length === 0 ? 'Empty' : `${cart.length} item${cart.length > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  id="btn-clear-cart"
                  onClick={clearCart}
                  className="text-xs text-[#475569] hover:text-[#EF4444] p-1.5 transition-colors cursor-pointer"
                  title="Clear entire cart"
                >
                  Clear
                </button>
              )}
              <button
                id="btn-close-cart"
                onClick={() => setIsCartOpen(false)}
                className="text-[#475569] hover:text-[#111827] p-2 rounded-xl hover:bg-[#FFF8ED] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-[#E5E7EB]">
            {cart.length === 0 ? (
              <div
                id="cart-empty-state"
                className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] flex items-center justify-center text-[#C8102E]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-[#111827]">
                  Your cart is empty.
                </h4>
                <p className="text-sm text-[#475569] max-w-xs leading-relaxed">
                  Explore our flame-grilled chicken, fresh bakeries, and chilled juices to add to your order.
                </p>
                <button
                  id="btn-cart-browse-menu"
                  onClick={handleBrowseMenu}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-all min-h-[44px] cursor-pointer"
                >
                  <Utensils className="w-4 h-4 text-white" />
                  <span>Browse Menu</span>
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const product = products.find((p) => p.id === item.product_id);
                if (!product) return null;
                const itemTotal = product.price * item.quantity;

                return (
                  <div
                    key={item.product_id}
                    id={`cart-item-${product.slug}`}
                    className="py-4 flex items-center gap-3 sm:gap-4 first:pt-0 last:pb-0"
                  >
                    {/* Thumbnail */}
                    <img
                      src={getMediaUrl(product.image)}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0 border border-[#E5E7EB]"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#111827] truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-[#475569]">
                        {formatMoney(product.price)} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-[#E5E7EB] rounded-lg p-0.5 bg-[#FFF8ED]/30">
                          <button
                            id={`btn-cart-qty-minus-${product.slug}`}
                            onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded text-[#111827] hover:bg-[#FFF8ED] text-xs font-bold transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-[#111827]">
                            {item.quantity}
                          </span>
                          <button
                            id={`btn-cart-qty-plus-${product.slug}`}
                            onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded text-[#111827] hover:bg-[#FFF8ED] text-xs font-bold transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          id={`btn-cart-remove-${product.slug}`}
                          onClick={() => removeFromCart(product.id)}
                          className="text-[#9CA3AF] hover:text-[#EF4444] p-1.5 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Item Subtotal */}
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-[#111827] block">
                        {formatMoney(itemTotal)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 bg-[#FFF8ED]/50 border-t border-[#E5E7EB] space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#475569]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#111827]">{formatMoney(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#475569]">
                  <span>Delivery Fee</span>
                  <span>Calculated at checkout (Free for pickup)</span>
                </div>
              </div>

              <button
                id="btn-cart-checkout"
                onClick={handleCheckoutClick}
                className="w-full flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold py-3.5 px-6 rounded-xl shadow-md shadow-[#C8102E]/20 transition-all text-sm min-h-[44px] cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <p className="text-[11px] text-center text-[#475569]">
                Order will be dispatched to kitchen & sent directly via WhatsApp
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};