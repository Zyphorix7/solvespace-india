import React from 'react';
import { ShoppingBag, Zap } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useStore } from '../context/StoreContext';

interface StickyMobileBuyBarProps {
  product: Product;
  selectedVariant?: ProductVariant;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isOutOfStock: boolean;
}

export const StickyMobileBuyBar: React.FC<StickyMobileBuyBarProps> = ({
  product,
  selectedVariant,
  onAddToCart,
  onBuyNow,
  isOutOfStock,
}) => {
  const { formatCurrency } = useStore();
  const currentPrice = selectedVariant?.price ?? product.price;

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2.5 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-between gap-3">
        {/* Price & Variant Indicator */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-[#0B2545] leading-none">
              {formatCurrency(currentPrice)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
          <div className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
            {selectedVariant ? selectedVariant.name : 'Standard Edition'}
          </div>
        </div>

        {/* High-Contrast Buy Actions (Thumb-Friendly 48px Min Target) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className={`min-h-[48px] px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold border border-slate-300 bg-slate-50 text-slate-900 active:scale-95 transition-transform ${
              isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-slate-700" />
            <span>Add</span>
          </button>

          <button
            onClick={onBuyNow}
            disabled={isOutOfStock}
            className={`min-h-[48px] px-5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-extrabold bg-[#0B2545] text-white shadow-md active:scale-95 transition-transform ${
              isOutOfStock ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'hover:bg-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
