import React, { useState } from 'react';
import { X, Search, Truck, CheckCircle2, Clock, MapPin, Package, RotateCcw, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

export const TrackOrderModal: React.FC = () => {
  const {
    trackOrderModalOpen,
    setTrackOrderModalOpen,
    orders,
    formatCurrency,
    requestOrderExchange,
    setExchangePolicyModalOpen,
  } = useStore();
  const [query, setQuery] = useState('');
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Exchange request form state
  const [showExchangeForm, setShowExchangeForm] = useState(false);
  const [exchangeReason, setExchangeReason] = useState('Size Replacement');
  const [exchangeNotes, setExchangeNotes] = useState('');
  const [isSubmittingExchange, setIsSubmittingExchange] = useState(false);

  if (!trackOrderModalOpen) return null;

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const clean = query.trim().toUpperCase();
    const found = orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === clean ||
        o.customer.phoneNumber === clean ||
        o.customer.email.toLowerCase() === clean.toLowerCase()
    );

    setMatchedOrder(found || null);
    setHasSearched(true);
    setShowExchangeForm(false);
  };

  const handleExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedOrder) return;
    setIsSubmittingExchange(true);
    try {
      await requestOrderExchange(matchedOrder.id, exchangeReason, exchangeNotes);
      setShowExchangeForm(false);
      // update local matchedOrder state view
      setMatchedOrder({
        ...matchedOrder,
        exchangeStatus: 'requested',
        exchangeReason,
        exchangeNotes,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingExchange(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Track SolveSpace Order
              </h3>
              <p className="text-xs text-slate-500">Pan-India express logistics & exchange</p>
            </div>
          </div>
          <button
            onClick={() => {
              setTrackOrderModalOpen(false);
              setHasSearched(false);
              setMatchedOrder(null);
              setShowExchangeForm(false);
            }}
            className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <form onSubmit={handleTrack} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter Order ID (e.g. SS-IN-123456) or 10-digit Mobile"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0B2545] focus:outline-hidden font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] bg-[#0B2545] hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Track Status
          </button>
        </form>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4 pt-2">
            {matchedOrder ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Order Reference</span>
                    <span className="font-mono font-bold text-slate-900">
                      {matchedOrder.orderNumber}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
                    {matchedOrder.orderStatus}
                  </span>
                </div>

                {/* Logistics Timeline */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Order Confirmed</div>
                      <div className="text-slate-500 text-[11px]">
                        Payment method: {matchedOrder.paymentMethod.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#0B2545] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Packed & Quality Verified</div>
                      <div className="text-slate-500 text-[11px]">
                        Dispatched from Regional Hub
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-900" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Delivery Destination</div>
                      <div className="text-slate-500 text-[11px]">
                        {matchedOrder.customer.city}, PIN {matchedOrder.customer.pincode} ({matchedOrder.customer.state})
                      </div>
                      {matchedOrder.estimatedDeliveryDate && (
                        <div className="text-emerald-700 font-bold text-xs mt-1">
                          ⚡ Guaranteed Delivery by: {matchedOrder.estimatedDeliveryDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="pt-2 border-t border-slate-200/80 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Items in Parcel:</span>
                  {matchedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600 py-0.5">
                      <span className="truncate max-w-[240px]">
                        {it.productTitle} x {it.quantity}
                      </span>
                      <span className="font-bold text-slate-800">
                        {formatCurrency(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Exchange Status / Request Action */}
                <div className="pt-3 border-t border-slate-200/80">
                  {matchedOrder.exchangeStatus ? (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                          <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                          Exchange Status:
                        </span>
                        <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                          {matchedOrder.exchangeStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-purple-700">
                        Reason: {matchedOrder.exchangeReason || 'Product Replacement'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Our regional courier will verify the replacement parcel upon doorstep pickup. (Product Exchange Only)
                      </div>
                    </div>
                  ) : showExchangeForm ? (
                    <form onSubmit={handleExchangeSubmit} className="p-3 bg-white border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                          Request Product Exchange
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowExchangeForm(false)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>Notice: Only product exchanges are accepted. Cash refunds are not provided.</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Exchange Reason
                        </label>
                        <select
                          value={exchangeReason}
                          onChange={(e) => setExchangeReason(e.target.value)}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                        >
                          <option value="Size Replacement">Size / Dimension Replacement</option>
                          <option value="Damaged in Transit">Damaged in Transit</option>
                          <option value="Defective or Malfunctioning">Defective Piece</option>
                          <option value="Wrong Item Received">Wrong Item Received</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Replacement Details / Notes
                        </label>
                        <textarea
                          rows={2}
                          value={exchangeNotes}
                          onChange={(e) => setExchangeNotes(e.target.value)}
                          placeholder="Describe the exchange requirement or size needed..."
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingExchange}
                        className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingExchange ? 'Submitting Request...' : 'Submit Exchange Request'}
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="text-[11px] text-slate-500">
                        Need a replacement or different size?
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowExchangeForm(true)}
                        className="text-purple-700 hover:text-purple-900 font-bold underline decoration-dotted flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Request Product Exchange
                      </button>
                    </div>
                  )}

                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setExchangePolicyModalOpen(true)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                    >
                      View SolveSpace India Exchange Policy (Exchange Only)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center text-xs text-rose-800">
                No orders found matching "{query}". Please check your order reference number or mobile number.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
