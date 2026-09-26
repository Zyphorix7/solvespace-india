import React, { useState } from 'react';
import { Star, ShoppingBag, Eye, Heart, Truck, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { calculateDeliveryEstimate } from '../utils/delivery';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart, formatCurrency, showToast } = useStore();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  const deliveryEstimate = calculateDeliveryEstimate(false);

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const isLowStock = product.inventory > 0 && product.inventory <= 5;
  const isOutOfStock = product.inventory <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.variants && product.variants.length > 1) {
      onOpenDetails(product);
    } else {
      addToCart(product, product.variants?.[0], 1);
      setIsAddedAnimation(true);
      setTimeout(() => setIsAddedAnimation(false), 1200);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    showToast(isLiked ? 'Removed from wishlist' : 'Saved to wishlist!', 'info');
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.99]"
    >
      {/* Product Image Canvas (Screenshot 2: Clean white frame + floating badge & quick action icons) */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center p-4">
        {/* Main Product Image */}
        <img
          src={product.images[currentImageIdx] || product.images[0]}
          alt={product.title}
          className="w-full h-full object-contain object-center group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />

        {/* Secondary Image Switcher on Hover */}
        {product.images.length > 1 && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 bg-slate-50"
            onMouseEnter={() => setCurrentImageIdx(1)}
            onMouseLeave={() => setCurrentImageIdx(0)}
          >
            <img
              src={product.images[1]}
              alt={`${product.title} alternate angle`}
              className="w-full h-full object-contain object-center"
              loading="lazy"
            />
          </div>
        )}

        {/* Coral Discount Badge (Screenshot 2 style: round coral-orange badge #FF5A36) */}
        {discountPercent && (
          <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-[#FF5A36] text-white flex flex-col items-center justify-center font-black shadow-md shadow-orange-500/20 pointer-events-none">
            <span className="text-[11px] leading-none">{discountPercent}%</span>
            <span className="text-[7px] uppercase tracking-tighter opacity-90 leading-none">OFF</span>
          </div>
        )}

        {/* Low Stock Indicator Tag */}
        {isLowStock && (
          <div className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs pointer-events-none animate-pulse">
            Only {product.inventory} left
          </div>
        )}

        {/* Quick Action Buttons (Screenshot 2 style: floating hover buttons for Cart, Wishlist, Quick View) */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`w-9 h-9 rounded-full bg-white shadow-md border border-slate-200/80 flex items-center justify-center transition-colors active:scale-90 ${
              isLiked ? 'text-rose-500 fill-rose-500' : 'text-slate-600 hover:text-rose-500'
            }`}
            title="Add to Wishlist"
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="w-9 h-9 rounded-full bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors active:scale-90"
            title="Quick View Details"
            aria-label="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Quick Add to Cart Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center text-white active:scale-90 transition-all ${
              isAddedAnimation
                ? 'bg-emerald-600'
                : 'bg-[#FF5A36] hover:bg-[#E04826]'
            }`}
            title="Quick Add to Bag"
            aria-label="Add to Bag"
          >
            {isAddedAnimation ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Product Details Section (Screenshot 2: Category, Title, Star Rating, Price & Strikethrough) */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Category kicker */}
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {product.category}
          </span>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#FF5A36] transition-colors line-clamp-2 leading-snug mt-0.5">
            {product.title}
          </h3>

          {/* Rating Stars (Screenshot 2: Amber stars + count) */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : i < product.rating
                      ? 'fill-amber-200 text-amber-400'
                      : 'fill-slate-200 text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-slate-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Pricing & Delivery footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-black text-slate-900">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <Truck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Delivered by <strong>{deliveryEstimate.estimatedDate}</strong></span>
            </div>
          </div>

          {/* Direct Add Button for mobile / immediate purchase */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="sm:hidden px-3 py-1.5 rounded-full bg-[#FF5A36] text-white text-xs font-bold shadow-xs active:scale-95"
            aria-label="Add to cart"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
