import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  Sparkles,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { calculateDeliveryEstimate } from '../utils/delivery';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    freeShippingProgress,
    amountNeededForFreeShipping,
    discountCode,
    applyDiscountCode,
    removeDiscountCode,
    setCheckoutModalOpen,
    formatCurrency,
    setExchangePolicyModalOpen,
  } = useStore();

  const [inputCode, setInputCode] = useState('');
  const deliveryEstimate = calculateDeliveryEstimate(false);

  if (!cartDrawerOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    applyDiscountCode(inputCode);
    setInputCode('');
  };

  const handleProceedToCheckout = () => {
    setCartDrawerOpen(false);
    setCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setCartDrawerOpen(false)}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#0B2545]" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Your Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={() => setCartDrawerOpen(false)}
            className="flex items-center justify-center w-12 h-12 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-transform"
            aria-label="Close cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200/60">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#F58220]" />
              {amountNeededForFreeShipping === 0 ? (
                <span className="text-emerald-700 font-bold">
                  🎉 Unlocked: FREE Express Shipping across India!
                </span>
              ) : (
                <span>
                  Add <strong className="text-slate-900">{formatCurrency(amountNeededForFreeShipping)}</strong> more for <strong>FREE Express Delivery</strong>
                </span>
              )}
            </span>
            <span className="text-slate-500 font-bold">{freeShippingProgress}%</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                freeShippingProgress === 100
                  ? 'bg-emerald-500'
                  : 'bg-linear-to-r from-amber-400 to-[#F58220]'
              }`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Your bag is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Explore our curated high-performance workspace and lifestyle solutions.
                </p>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="mt-2 min-h-[48px] px-6 py-2.5 bg-[#0B2545] text-white text-sm font-bold rounded-xl shadow-xs hover:bg-slate-800 active:scale-95 transition-transform"
              >
                Discover Solutions
              </button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={`${item.product.id}-${item.variant?.id || 'std'}`}
                className="flex gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors"
              >
                {/* Product Image */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                  <img
                    src={item.variant?.image || item.product.images[0] || '/products/Screenshot_20260901_134903_Meesho.jpg'}
                    alt={item.product.title}
                    className="w-full h-full object-contain p-1"
                    loading="lazy"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                        {item.product.title}
                      </h4>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-rose-500 transition-colors -mr-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.variant && (
                      <span className="inline-block mt-0.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.variant.name}
                      </span>
                    )}

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-sm font-extrabold text-[#0B2545]">
                        {formatCurrency(item.selectedPrice)}
                      </span>
                      {item.product.compareAtPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatCurrency(item.product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper (Thumb Friendly 48px Target) */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateCartQuantity(index, item.quantity - 1)}
                        className="flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-200 active:scale-95 transition-transform"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(index, item.quantity + 1)}
                        className="flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-200 active:scale-95 transition-transform"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-slate-700">
                      {formatCurrency(item.selectedPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Area */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/70 space-y-3.5">
            {/* Promo Code Input */}
            <div>
              {discountCode ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Discount Applied (-{formatCurrency(discountAmount)})</span>
                  </div>
                  <button
                    onClick={removeDiscountCode}
                    className="text-emerald-700 hover:text-emerald-900 font-extrabold text-xs ml-2 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter discount code"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#0B2545] uppercase tracking-wider font-semibold placeholder:normal-case placeholder:font-normal"
                  />
                  <button
                    type="submit"
                    className="min-h-[40px] px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-[#0B2545] active:scale-95 transition-transform cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping (All India)</span>
                <span className="font-semibold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 uppercase font-bold text-[11px]">
                      FREE
                    </span>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Estimated Delivery</span>
                <span className="font-bold text-emerald-700">
                  {deliveryEstimate.estimatedDate}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm">
                <span className="font-extrabold text-slate-900">Total (Taxes Incl.)</span>
                <span className="text-base font-extrabold text-[#0B2545]">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Primary High-Contrast Checkout Button (48px min height) */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full min-h-[50px] bg-[#FF5A36] hover:bg-[#E04826] active:scale-98 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-amber-200" />
              <span>Checkout • {formatCurrency(grandTotal)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Encrypted
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={() => setExchangePolicyModalOpen(true)}
                className="flex items-center gap-1 text-blue-700 hover:text-blue-900 underline decoration-dotted cursor-pointer font-medium"
              >
                <RotateCcw className="w-3 h-3 text-blue-600" />
                Product Exchange Only
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
