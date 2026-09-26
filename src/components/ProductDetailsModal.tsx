import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  ChevronDown,
  ChevronUp,
  MapPin,
  Loader2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Product, ProductVariant, PincodeServiceability } from '../types';
import { useStore } from '../context/StoreContext';
import { StickyMobileBuyBar } from './StickyMobileBuyBar';
import { verifyIndianPincode } from '../data/pincodes';
import { calculateDeliveryEstimate } from '../utils/delivery';
import { ProductReviewsSection } from './ProductReviewsSection';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose }) => {
  const { addToCart, setCheckoutModalOpen, formatCurrency, setExchangePolicyModalOpen } = useStore();

  const defaultEstimate = calculateDeliveryEstimate(false);

  // Modal State
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [variantImageOverride, setVariantImageOverride] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants?.[0]
  );
  const [quantity, setQuantity] = useState(1);

  // Interactive Zoom-on-Hover State
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [zoomLevel, setZoomLevel] = useState<number>(2.4);

  // Instant Indian Pincode Verification State
  const [pincodeInput, setPincodeInput] = useState('');
  const [isCheckingPin, setIsCheckingPin] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<PincodeServiceability | null>(null);

  // Accordion toggles
  const [openAccordion, setOpenAccordion] = useState<string | null>('features');

  // DOM and Touch Refs
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Computed Gallery Data
  const galleryItems = useMemo(() => {
    if (!product || !product.images) return [];
    const detailsMap = new Map((product.imageDetails || []).map((d) => [d.url, d]));
    return product.images.map((url, idx) => {
      const detail = detailsMap.get(url);
      return {
        url,
        label: detail?.label || detail?.title || `Angle ${idx + 1}`,
        badge: detail?.badge || detail?.tag || (idx === 0 ? 'Flagship' : `Angle ${idx + 1}`),
        description: detail?.description || '',
        alt: detail?.alt || `${product.title} - View ${idx + 1}`,
      };
    });
  }, [product]);

  // Synchronize modal state on product changes
  useEffect(() => {
    if (product) {
      setActiveImageIdx(0);
      setVariantImageOverride(null);
      setSelectedVariant(product.variants?.[0]);
      setQuantity(1);
      setIsZoomed(false);
    }
  }, [product]);

  // Navigation Handlers
  const handlePrevImage = () => {
    if (!product || !product.images || product.images.length <= 1) return;
    setIsZoomed(false);
    setVariantImageOverride(null);
    setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
  };

  const handleNextImage = () => {
    if (!product || !product.images || product.images.length <= 1) return;
    setIsZoomed(false);
    setVariantImageOverride(null);
    setActiveImageIdx((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation for image gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, activeImageIdx, onClose]);

  // Handle Zoom mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomCoords({ x, y });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomCoords({ x, y });
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  // Touch device pan and swipe support
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isZoomed) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isZoomed || touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartXRef.current - touchEndX;
    const diffY = touchStartYRef.current - touchEndY;

    // Horizontal swipe threshold: 45px
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isZoomed || !e.touches[0]) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
    setZoomCoords({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  // Instant Pincode Verification Trigger
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincodeInput(val);

    if (val.length === 6) {
      setIsCheckingPin(true);
      // Trigger instantaneous verification
      setTimeout(() => {
        const res = verifyIndianPincode(val);
        setPincodeResult(res);
        setIsCheckingPin(false);
      }, 150);
    } else {
      setPincodeResult(null);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, selectedVariant, quantity);
    onClose();
    setCheckoutModalOpen(true);
  };

  if (!product) return null;

  const activeImage = galleryItems[activeImageIdx] || galleryItems[0];
  const currentImageUrl = variantImageOverride || activeImage?.url || product.images?.[0] || '';

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentCompareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const currentInventory = selectedVariant ? selectedVariant.inventory : product.inventory;
  const isOutOfStock = currentInventory <= 0;

  const discountPercent =
    currentCompareAtPrice && currentCompareAtPrice > currentPrice
      ? Math.round(((currentCompareAtPrice - currentPrice) / currentCompareAtPrice) * 100)
      : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-0 sm:p-4 text-center">
        {/* Modal Container */}
        <div className="w-full max-w-4xl bg-white sm:rounded-3xl shadow-2xl text-left overflow-hidden relative z-10 my-0 sm:my-8 animate-in fade-in-50 zoom-in-95 duration-200">
          {/* Close button (48px tap target) */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-slate-950 hover:bg-white shadow-md active:scale-95 transition-all"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery Column */}
            <div className="p-4 sm:p-8 bg-slate-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80">
              <div className="space-y-4">
                {/* Main Hero Image with Interactive Zoom-on-Hover */}
                <div
                  ref={imageContainerRef}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={toggleZoom}
                  className={`aspect-square w-full rounded-2xl bg-white overflow-hidden border border-slate-200 shadow-xs relative select-none group cursor-crosshair transition-shadow ${
                    isZoomed ? 'ring-2 ring-[#0B2545]/25 shadow-lg' : ''
                  }`}
                  style={{ touchAction: isZoomed ? 'none' : 'auto' }}
                  title={isZoomed ? 'Click to exit zoom' : 'Hover or tap to inspect material texture'}
                >
                  {/* Scaled Product Image */}
                  <img
                    src={variantImageOverride || product.images[activeImageIdx] || product.images[0]}
                    alt={
                      (product.imageDetails?.find((d) => d.url === (variantImageOverride || product.images[activeImageIdx]))?.label) ||
                      product.imageDetails?.[activeImageIdx]?.label ||
                      product.title
                    }
                    className="w-full h-full object-contain object-center pointer-events-none transition-transform duration-100 ease-out will-change-transform"
                    style={{
                      transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                      transform: isZoomed ? `scale(${zoomLevel})` : 'scale(1)',
                    }}
                  />

                  {/* High-Precision Lens Target Indicator (Visible on hover when zoomed) */}
                  {isZoomed && (
                    <div
                      className="pointer-events-none absolute w-16 h-16 rounded-full border-2 border-white/90 bg-white/10 shadow-lg -translate-x-1/2 -translate-y-1/2 backdrop-blur-[0.5px] hidden sm:block"
                      style={{
                        left: `${zoomCoords.x}%`,
                        top: `${zoomCoords.y}%`,
                      }}
                    />
                  )}

                  {/* Top-Left Image Badges (Index Counter, Feature Tag, and Discount) */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
                    <span className="bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                      {activeImageIdx + 1} / {product.images.length}
                    </span>
                    {(product.imageDetails?.[activeImageIdx]?.badge) && (
                      <span className="bg-[#0B2545]/90 backdrop-blur-md text-sky-200 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md border border-sky-400/20">
                        {product.imageDetails[activeImageIdx].badge}
                      </span>
                    )}
                    {discountPercent && (
                      <span className="bg-[#FF5A36] text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md shadow-orange-500/20">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Top-Right Direct Zoom Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleZoom();
                    }}
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-[#FF5A36] shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                    aria-label={isZoomed ? 'Exit Zoom' : 'Zoom Image'}
                    title={isZoomed ? 'Reset zoom' : 'Zoom into texture'}
                  >
                    {isZoomed ? (
                      <ZoomOut className="w-4 h-4 text-rose-600" />
                    ) : (
                      <ZoomIn className="w-4 h-4 text-[#FF5A36]" />
                    )}
                  </button>

                  {/* Bottom-Left Feature Detail Callout Pill */}
                  {product.imageDetails?.[activeImageIdx] && !isZoomed && (
                    <div className="absolute bottom-3 left-3 right-auto max-w-[calc(100%-80px)] z-10 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-md border border-white/10 pointer-events-none truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                      <span className="text-sky-300 font-bold shrink-0">Angle {activeImageIdx + 1}:</span>
                      <span className="truncate">{product.imageDetails[activeImageIdx].label}</span>
                    </div>
                  )}

                  {/* Bottom-Right Zoom Info Pill */}
                  <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md pointer-events-none transition-all">
                    {isZoomed ? (
                      <>
                        <ZoomOut className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span>{zoomLevel}x Zoom</span>
                      </>
                    ) : (
                      <>
                        <ZoomIn className="w-3.5 h-3.5 text-slate-300" />
                        <span className="hidden sm:inline">Inspect</span>
                      </>
                    )}
                  </div>

                  {/* Bottom-Left Zoom Level Selector (When zoomed) */}
                  {isZoomed && (
                    <div
                      className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[1.8, 2.4, 3.2].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setZoomLevel(lvl)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                            zoomLevel === lvl
                              ? 'bg-[#0B2545] text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {lvl}x
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Previous/Next Image Navigation Arrows (If multiple angles available) */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevImage();
                        }}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 shadow-md flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextImage();
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 shadow-md flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Mobile Dot Navigation */}
                {product.images.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 sm:hidden py-0.5">
                    {product.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveImageIdx(idx);
                          setVariantImageOverride(null);
                          setIsZoomed(false);
                        }}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          !variantImageOverride && activeImageIdx === idx
                            ? 'w-6 bg-[#0B2545]'
                            : 'w-2 bg-slate-300 hover:bg-slate-400'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Dynamic 5-Thumbnail Strip with Visual Badges */}
                {product.images.length > 1 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-0.5">
                      <span>Gallery ({product.images.length} Unique Angles)</span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">Use ← → keys to navigate</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 pb-1">
                      {product.images.map((img, idx) => {
                        const detail = product.imageDetails?.find((d) => d.url === img) || product.imageDetails?.[idx];
                        const isSelected = !variantImageOverride && activeImageIdx === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setActiveImageIdx(idx);
                              setVariantImageOverride(null);
                              setIsZoomed(false);
                            }}
                            className={`group relative flex flex-col rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white text-left ${
                              isSelected
                                ? 'border-[#0B2545] shadow-xs scale-102 ring-2 ring-[#0B2545]/20'
                                : 'border-slate-200 opacity-80 hover:opacity-100 hover:border-slate-400'
                            }`}
                            title={detail ? `${detail.label}: ${detail.description || ''}` : `Angle ${idx + 1}`}
                          >
                            <div className="aspect-square w-full relative bg-slate-50 flex items-center justify-center p-1">
                              <img
                                src={img}
                                alt={detail?.label || `Thumbnail ${idx + 1}`}
                                className="w-full h-full object-contain pointer-events-none"
                              />
                              <span
                                className={`absolute top-1 left-1 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'bg-[#0B2545] text-white'
                                    : 'bg-slate-900/60 text-white group-hover:bg-slate-900'
                                }`}
                              >
                                {idx + 1}
                              </span>
                            </div>
                            {detail?.label && (
                              <div className="px-1 py-1 border-t border-slate-100 bg-white hidden sm:block">
                                <p className={`text-[9px] font-bold leading-tight truncate ${isSelected ? 'text-[#0B2545]' : 'text-slate-600'}`}>
                                  {detail.label.split(' ')[0]} {detail.label.split(' ')[1] || ''}
                                </p>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Angle Spotlight Card */}
                    {(() => {
                      const currentDetail =
                        product.imageDetails?.find((d) => d.url === (variantImageOverride || product.images[activeImageIdx])) ||
                        product.imageDetails?.[activeImageIdx];
                      if (!currentDetail) return null;
                      return (
                        <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs mt-2 transition-all">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0B2545] text-white text-[10px] font-black shrink-0">
                                {activeImageIdx + 1}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {currentDetail.label}
                              </h4>
                              {currentDetail.badge && (
                                <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md hidden sm:inline-block">
                                  {currentDetail.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wide">
                              Angle {activeImageIdx + 1} of {product.images.length}
                            </span>
                          </div>
                          {currentDetail.description && (
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                              {currentDetail.description}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Guarantees Box */}
              <div className="hidden sm:grid grid-cols-2 gap-2 pt-6 mt-6 border-t border-slate-200 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#F58220]" />
                  <span>Express Courier Across India</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>1-Year Official Warranty</span>
                </div>
                <button
                  type="button"
                  onClick={() => setExchangePolicyModalOpen(true)}
                  className="flex items-center gap-2 text-left hover:text-blue-700 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="underline decoration-dotted underline-offset-2">Product Exchange Only (5-Day)</span>
                </button>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>100% Genuine BIS Quality</span>
                </div>
              </div>
            </div>

            {/* Details & Actions Column */}
            <div className="p-4 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Category & Rating */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 font-bold text-slate-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({product.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                    {product.title}
                  </h1>
                  {product.subtitle && (
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                      {product.subtitle}
                    </p>
                  )}
                </div>

                {/* Live Social Urgency & Stock Counter (Plusbase / Shopify style) */}
                <div className="flex flex-wrap items-center gap-2 py-1 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-800 font-bold border border-orange-200">
                    <Flame className="w-3.5 h-3.5 text-[#FF5A36] fill-[#FF5A36]" />
                    <span>14 people viewing now</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Order before 2 PM for Same-Day Dispatch</span>
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-2.5 py-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0B2545]">
                    {formatCurrency(currentPrice)}
                  </span>
                  {currentCompareAtPrice && (
                    <span className="text-sm sm:text-base text-slate-400 line-through">
                      {formatCurrency(currentCompareAtPrice)}
                    </span>
                  )}
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    Inclusive of GST
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>

                {/* Variant Selector (if available) */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        {product.variants.length === 1 ? 'Capacity / Variant:' : 'Select Edition / Variant:'}
                      </span>
                      <span className="text-slate-500 font-medium">{selectedVariant?.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setSelectedVariant(v);
                            if (v.image) {
                              setVariantImageOverride(v.image);
                            }
                            setIsZoomed(false);
                          }}
                          className={`min-h-[48px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-95 flex items-center gap-2 ${
                            selectedVariant?.id === v.id
                              ? 'border-[#0B2545] bg-[#0B2545] text-white shadow-xs'
                              : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                          <span>{v.name}</span>
                          <span className="ml-1 opacity-80 font-normal">({formatCurrency(v.price)})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Automatic Indian Pincode Delivery Check */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#F58220]" />
                      <span>Check Delivery & COD by Pincode:</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      Est. {defaultEstimate.estimatedDate}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={pincodeInput}
                      onChange={handlePincodeChange}
                      placeholder="Enter 6-digit Indian PIN (e.g. 110001, 560001)"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-[#0B2545] focus:outline-hidden font-mono tracking-wider"
                    />
                    {isCheckingPin && (
                      <Loader2 className="w-4 h-4 text-slate-400 absolute right-3 top-3 animate-spin" />
                    )}
                  </div>

                  {/* Instantaneous Response Banner */}
                  {pincodeResult ? (
                    <div
                      className={`p-2.5 rounded-xl text-xs flex items-start gap-2 animate-in fade-in-50 duration-200 ${
                        pincodeResult.serviceable
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {pincodeResult.serviceable ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold">
                          {pincodeResult.serviceable
                            ? `Delivery is available at pincode ${pincodeResult.pincode}`
                            : pincodeResult.message}
                        </div>
                        {pincodeResult.serviceable && (
                          <div className="text-[11px] text-emerald-700 mt-0.5">
                            ⚡ Guaranteed Delivery by: <strong>{pincodeResult.estimatedDeliveryDate || defaultEstimate.estimatedDate}</strong> • COD: <strong>{pincodeResult.codAvailable ? 'Available' : 'Unavailable'}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Standard delivery by <strong>{defaultEstimate.estimatedDate}</strong> (Free on orders ₹999+)</span>
                    </div>
                  )}
                </div>

                {/* Bundle & Save Volume Tier Discounts (Plusbase & Shopify style) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF5A36]" />
                      <span>Bundle & Save More:</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold">Automatic Discounts</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(1)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        quantity === 1
                          ? 'border-[#0B2545] bg-[#0B2545]/5 ring-2 ring-[#0B2545]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="text-xs font-black text-slate-900">Buy 1</div>
                      <div className="text-[10px] text-slate-500">Standard</div>
                      <div className="text-[11px] font-bold text-slate-700 mt-0.5">
                        {formatCurrency(currentPrice)}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuantity(2)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                        quantity === 2
                          ? 'border-[#0B2545] bg-[#0B2545]/5 ring-2 ring-[#0B2545]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#FF5A36] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                        POPULAR
                      </span>
                      <div className="text-xs font-black text-slate-900">Buy 2</div>
                      <div className="text-[10px] text-emerald-700 font-extrabold">Save 10%</div>
                      <div className="text-[11px] font-bold text-slate-700 mt-0.5">
                        {formatCurrency(Math.round(currentPrice * 0.9 * 2))}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuantity(3)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                        quantity >= 3
                          ? 'border-[#0B2545] bg-[#0B2545]/5 ring-2 ring-[#0B2545]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                        BEST VALUE
                      </span>
                      <div className="text-xs font-black text-slate-900">Buy 3+</div>
                      <div className="text-[10px] text-purple-700 font-extrabold">Save 15%</div>
                      <div className="text-[11px] font-bold text-slate-700 mt-0.5">
                        {formatCurrency(Math.round(currentPrice * 0.85 * 3))}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Quantity & Primary Action Buttons (Desktop / Tablet) */}
                <div className="hidden sm:block space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    {/* Quantity Picker (48px targets) */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-95 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-slate-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-95 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Add to Cart Button (48px height) */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className="flex-1 min-h-[48px] px-4 rounded-xl border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white active:scale-98 transition-colors font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </button>

                    {/* Buy Now Button (48px height) */}
                    <button
                      onClick={handleBuyNow}
                      disabled={isOutOfStock}
                      className="flex-1 min-h-[48px] px-4 rounded-xl bg-[#FF5A36] text-white hover:bg-[#E04826] active:scale-98 transition-colors font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Product Details Accordion */}
                <div className="border-t border-slate-200 pt-3 space-y-2">
                  {/* Features */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() =>
                        setOpenAccordion(openAccordion === 'features' ? null : 'features')
                      }
                      className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100"
                    >
                      <span>Key Features & Specifications</span>
                      {openAccordion === 'features' ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    {openAccordion === 'features' && (
                      <div className="p-3.5 bg-white text-xs text-slate-600 space-y-1.5 border-t border-slate-100">
                        {product.features && product.features.length > 0 ? (
                          product.features.map((feat, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-[#F58220] font-bold">•</span>
                              <span>{feat}</span>
                            </div>
                          ))
                        ) : (
                          <p>Engineered to the highest industry standards for modern workstations.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Shipping & COD Policy */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() =>
                        setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')
                      }
                      className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100"
                    >
                      <span>Pan-India Shipping & Cash on Delivery</span>
                      {openAccordion === 'shipping' ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    {openAccordion === 'shipping' && (
                      <div className="p-3.5 bg-white text-xs text-slate-600 space-y-1.5 border-t border-slate-100">
                        <p>
                          Orders dispatched within 24 hours from regional fulfillment centers. Delivery date is calculated automatically ({defaultEstimate.estimatedDate} standard). Cash on Delivery is available across all serviceable pincodes.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 5-Day Product Exchange Policy */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() =>
                        setOpenAccordion(openAccordion === 'exchange' ? null : 'exchange')
                      }
                      className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100"
                    >
                      <span className="flex items-center gap-1.5 text-blue-900">
                        <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                        <span>5-Day Product Exchange Policy (Exchanges Only)</span>
                      </span>
                      {openAccordion === 'exchange' ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    {openAccordion === 'exchange' && (
                      <div className="p-3.5 bg-white text-xs text-slate-600 space-y-2 border-t border-slate-100">
                        <div className="p-2.5 bg-amber-50 rounded-lg text-amber-900 text-[11px] leading-relaxed font-medium">
                          <strong>Product Exchange Only:</strong> We accept product exchanges and size replacements for damaged, defective, or incorrect fitting items. Monetary cash returns or refunds are not accepted.
                        </div>
                        <p className="text-[11px]">
                          Doorstep reverse pickup and replacement dispatch is arranged within 24-48 hours.
                        </p>
                        <button
                          type="button"
                          onClick={() => setExchangePolicyModalOpen(true)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                        >
                          Read Complete Exchange Policy →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews & UGC Section (Shopify / Plusbase Judge.me style) */}
          <div className="px-4 sm:px-8 pb-8">
            <ProductReviewsSection productId={product.id} productTitle={product.title} />
          </div>

          {/* Mobile Bottom Padding so sticky buy bar doesn't obscure content */}
          <div className="h-20 sm:hidden" />
        </div>
      </div>

      {/* Sticky Mobile Buy Bar (Mobile First Requirement) */}
      <StickyMobileBuyBar
        product={product}
        selectedVariant={selectedVariant}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isOutOfStock={isOutOfStock}
      />
    </div>
  );
};
