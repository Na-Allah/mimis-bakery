import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Utensils } from 'lucide-react';

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
    siteConfig,
    formatMoney,
    navigateTo,
  } = useRestaurant();

  if (!isCartOpen) return null;

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
      className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsCartOpen(false)}
    >
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="cart-drawer-panel"
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-display text-lg font-bold text-white">
                  Your Order Cart
                </h3>
                <p className="text-xs text-stone-400">
                  {cart.length === 0 ? 'Empty' : `${cart.length} unique item${cart.length > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  id="btn-clear-cart"
                  onClick={clearCart}
                  className="text-xs text-stone-400 hover:text-rose-400 p-1.5 transition-colors"
                  title="Clear entire cart"
                >
                  Clear
                </button>
              )}
              <button
                id="btn-close-cart"
                onClick={() => setIsCartOpen(false)}
                className="text-stone-400 hover:text-white p-2 rounded-xl hover:bg-stone-800 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div
                id="cart-empty-state"
                className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif-display text-xl font-bold text-stone-900">
                  Your cart is empty.
                </h4>
                <p className="text-sm text-stone-500 max-w-xs leading-relaxed">
                  Explore our flame-grilled chicken, fresh bakeries, and chilled juices to add to your order.
                </p>
                <button
                  id="btn-cart-browse-menu"
                  onClick={handleBrowseMenu}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md transition-all"
                >
                  <Utensils className="w-4 h-4 text-stone-950" />
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
                    className="py-4 flex items-center gap-4 first:pt-0 last:pb-0"
                  >
                    {/* Thumbnail */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif-display text-sm font-bold text-stone-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {formatMoney(product.price)} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-stone-300 rounded-lg p-0.5 bg-stone-50">
                          <button
                            id={`btn-cart-qty-minus-${product.slug}`}
                            onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded text-stone-700 hover:bg-stone-200 text-xs font-bold transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            id={`btn-cart-qty-plus-${product.slug}`}
                            onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded text-stone-700 hover:bg-stone-200 text-xs font-bold transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          id={`btn-cart-remove-${product.slug}`}
                          onClick={() => removeFromCart(product.id)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Item Subtotal */}
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-stone-900 block">
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
            <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-stone-900">{formatMoney(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Delivery Fee</span>
                  <span>Calculated at checkout (Free for pickup)</span>
                </div>
              </div>

              <button
                id="btn-cart-checkout"
                onClick={handleCheckoutClick}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-orange-950/20 hover:shadow-orange-950/40 transition-all transform active:scale-95 text-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>

              <p className="text-[11px] text-center text-stone-400">
                Order will be dispatched to kitchen & sent directly via WhatsApp
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
