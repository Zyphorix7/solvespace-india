import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShoppingBag,
  Check,
  Layers,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Utensils,
  Plus,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

export const DeskSetupBuilderModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { products, addToCart, formatCurrency, showToast, setCartDrawerOpen } = useStore();

  const chopperProd = products[0] || {
    id: 'chopper_main_prod',
    title: 'Wireless Electric Mini Food Chopper & Garlic Mincer',
    price: 899,
    compareAtPrice: 1499,
    images: ['/products/Screenshot_20260901_134903_Meesho.jpg'],
  };

  // Bundle Add-on Options
  const [includeSpareBlades, setIncludeSpareBlades] = useState(true);
  const [includeLargeBowl, setIncludeLargeBowl] = useState(true);
  const [includeScraperSet, setIncludeScraperSet] = useState(false);

  if (!isOpen) return null;

  const basePrice = chopperProd.price;
  const spareBladesPrice = 249;
  const largeBowlPrice = 299;
  const scraperSetPrice = 149;

  // Calculate prices
  const rawTotal =
    basePrice +
    (includeSpareBlades ? spareBladesPrice : 0) +
    (includeLargeBowl ? largeBowlPrice : 0) +
    (includeScraperSet ? scraperSetPrice : 0);

  // Bundle discount: 15% off full kitchen package
  const bundleDiscount = Math.round(rawTotal * 0.15);
  const finalBundlePrice = rawTotal - bundleDiscount;

  const handleAddBundleToCart = () => {
    if (chopperProd) {
      addToCart(chopperProd as Product, undefined, 1);
    }
    showToast('🎉 Kitchen Prep Master Combo added to cart with 15% Combo Savings!', 'success');
    onClose();
    setCartDrawerOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200 animate-in fade-in-50 zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0B2545] text-white p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5A36] text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Kitchen Prep Combo Builder
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  15% Combo Savings
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Customize your Wireless Electric Mini Chopper with genuine replacement blades and accessories.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto max-h-[75vh]">
          
          {/* Left Visual Preview Column */}
          <div className="lg:col-span-5 bg-slate-900 p-6 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                <Utensils className="w-3.5 h-3.5" />
                <span>Selected Master Package</span>
              </div>
              <h3 className="text-xl font-black">All-in-One Daily Prep Set</h3>
              <p className="text-xs text-slate-400">
                Everything required for effortless 10-second mincing of garlic, ginger, chilies, onions, and gravies.
              </p>
            </div>

            {/* Visual Representation */}
            <div className="my-6 relative z-10 flex flex-col items-center">
              <div className="w-48 h-48 bg-slate-800/80 rounded-2xl border border-slate-700 p-3 flex items-center justify-center shadow-xl">
                <img
                  src="/products/Screenshot_20260901_134903_Meesho.jpg"
                  alt="Mini Food Chopper"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Combo Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="text-[10px] font-bold bg-[#FF5A36] text-white px-2.5 py-1 rounded-full">
                  Chopper Unit
                </span>
                {includeSpareBlades && (
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full">
                    + 304 Triple Blades
                  </span>
                )}
                {includeLargeBowl && (
                  <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded-full">
                    + 350ml Cup
                  </span>
                )}
                {includeScraperSet && (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                    + Food Scraper & Cable
                  </span>
                )}
              </div>
            </div>

            {/* Guarantees Box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1 text-xs text-slate-300 relative z-10">
              <div className="flex items-center gap-2 text-white font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>5-Day Doorstep Replacement Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-400">
                100% food-grade BPA-free materials with high-torque 30W motor.
              </p>
            </div>
          </div>

          {/* Right Configuration Options Column */}
          <div className="lg:col-span-7 p-4 sm:p-8 space-y-5">
            
            {/* Base Product Item */}
            <div className="p-3.5 rounded-2xl border-2 border-[#0B2545] bg-[#0B2545]/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center shrink-0">
                  <img
                    src="/products/Screenshot_20260901_134903_Meesho.jpg"
                    alt="Wireless Chopper"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">
                    Wireless Electric Mini Food Chopper (250ml)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Base Cordless Motor Head + 304 Blade Column + USB Cable
                  </div>
                </div>
              </div>
              <div className="text-xs font-black text-slate-900 shrink-0">
                {formatCurrency(basePrice)}
              </div>
            </div>

            {/* Addon 1: Spare 304 Blades */}
            <div
              onClick={() => setIncludeSpareBlades((prev) => !prev)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                includeSpareBlades
                  ? 'border-slate-900 bg-slate-50 shadow-xs ring-1 ring-slate-900'
                  : 'border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    includeSpareBlades ? 'bg-[#0B2545] text-white' : 'border border-slate-300 text-transparent'
                  }`}
                >
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Extra 304 Stainless Steel Triple-Blade Unit
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Backup razor-sharp cyclone mincing column for raw vs cooked ingredients
                  </div>
                </div>
              </div>
              <div className="text-xs font-black text-slate-900">
                +{formatCurrency(spareBladesPrice)}
              </div>
            </div>

            {/* Addon 2: 350ml Expansion Bowl */}
            <div
              onClick={() => setIncludeLargeBowl((prev) => !prev)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                includeLargeBowl
                  ? 'border-slate-900 bg-slate-50 shadow-xs ring-1 ring-slate-900'
                  : 'border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    includeLargeBowl ? 'bg-[#0B2545] text-white' : 'border border-slate-300 text-transparent'
                  }`}
                >
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    350ml Family Prep Expansion Cup
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Larger BPA-free container for family gravies, batter & salads
                  </div>
                </div>
              </div>
              <div className="text-xs font-black text-slate-900">
                +{formatCurrency(largeBowlPrice)}
              </div>
            </div>

            {/* Addon 3: Scraper & Fast Braided Cable */}
            <div
              onClick={() => setIncludeScraperSet((prev) => !prev)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                includeScraperSet
                  ? 'border-slate-900 bg-slate-50 shadow-xs ring-1 ring-slate-900'
                  : 'border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    includeScraperSet ? 'bg-[#0B2545] text-white' : 'border border-slate-300 text-transparent'
                  }`}
                >
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Silicone Scraper & 1M Braided Fast USB-C Cable
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Extract 100% of garlic paste without residue + heavy-duty cable
                  </div>
                </div>
              </div>
              <div className="text-xs font-black text-slate-900">
                +{formatCurrency(scraperSetPrice)}
              </div>
            </div>

            {/* Total Pricing & Action Bar */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-900">
                    Combo Bundle Savings (15% OFF)
                  </div>
                  <div className="text-[11px] text-amber-700">
                    Instant discount applied automatically
                  </div>
                </div>
                <div className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Save {formatCurrency(bundleDiscount)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] text-slate-500">Combo Total:</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      {formatCurrency(finalBundlePrice)}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      {formatCurrency(rawTotal)}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                      Free Shipping Unlocked
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddBundleToCart}
                  className="min-h-[48px] px-6 py-3 bg-[#FF5A36] hover:bg-[#E04826] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Combo to Cart</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
