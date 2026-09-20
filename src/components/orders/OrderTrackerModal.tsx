import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Search, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface OrderTrackerModalProps {
  initialOrderNumber?: string;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  initialOrderNumber,
}) => {
  const { orders, navigateTo } = useRestaurant();
  const [searchNumber, setSearchNumber] = useState(initialOrderNumber || '');
  const [searched, setSearched] = useState(false);

  const matchedOrder = orders.find(
    (o) => o.order_number.trim().toLowerCase() === searchNumber.trim().toLowerCase()
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <div id="order-tracker-container" className="min-h-screen bg-stone-100/70 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
              Track Your Order Status
            </h1>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Enter the unique Order Number (e.g. <span className="font-mono text-stone-700">ORD-260920-00124</span>) provided upon checkout.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-track-order-number"
                type="text"
                required
                value={searchNumber}
                onChange={(e) => {
                  setSearchNumber(e.target.value);
                  setSearched(false);
                }}
                placeholder="Enter ORD-XXXXXX-XXXXX..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm font-mono bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <button
              id="btn-track-order-search"
              type="submit"
              className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-850 text-amber-400 font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
            >
              Track
            </button>
          </form>

          {/* Results Display */}
          {matchedOrder ? (
            <div className="pt-4 border-t border-stone-100 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500 uppercase block font-semibold">
                    Order Number
                  </span>
                  <span className="font-mono text-base font-bold text-stone-900">
                    {matchedOrder.order_number}
                  </span>
                </div>
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      matchedOrder.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {matchedOrder.status}
                  </span>
                </div>
              </div>

              <div className="text-xs text-stone-600 space-y-1.5 px-2">
                <p>
                  <strong>Customer:</strong> {matchedOrder.customer_name} ({matchedOrder.customer_phone})
                </p>
                <p>
                  <strong>Type:</strong> {matchedOrder.order_type}
                </p>
                {matchedOrder.delivery_address && (
                  <p>
                    <strong>Address:</strong> {matchedOrder.delivery_address}
                  </p>
                )}
                <p>
                  <strong>Placed at:</strong> {new Date(matchedOrder.created_at).toLocaleString()}
                </p>
              </div>

              <button
                id="btn-track-view-full-receipt"
                onClick={() =>
                  navigateTo({ type: 'order-success', orderNumber: matchedOrder.order_number })
                }
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <span>View Full Receipt & Progress Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : searched ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>No order found matching "{searchNumber}". Please check the number and retry.</span>
            </div>
          ) : null}

          {/* Recent Orders quick list if any */}
          {orders.length > 0 && !matchedOrder && (
            <div className="pt-6 border-t border-stone-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                Recent Orders in this Session
              </h4>
              <div className="space-y-2">
                {orders.slice(0, 3).map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      setSearchNumber(o.order_number);
                      setSearched(true);
                    }}
                    className="p-3 rounded-xl border border-stone-200 hover:border-amber-400/50 hover:bg-stone-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-stone-900 block">
                        {o.order_number}
                      </span>
                      <span className="text-stone-500">
                        {o.items.length} items • {o.order_type}
                      </span>
                    </div>
                    <span className="font-semibold text-amber-700 uppercase">
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
