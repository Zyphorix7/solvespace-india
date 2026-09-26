import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Sliders,
  Truck,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Copy,
  Check,
  LifeBuoy,
  ChevronRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SolveSpaceLogo } from './SolveSpaceLogo';
import { Product } from '../types';

interface NotFoundPageProps {
  onBackToHome?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onBackToHome }) => {
  const {
    products,
    setSearchQuery,
    setSelectedCategory,
    setSetupBuilderOpen,
    setTrackOrderModalOpen,
    setExchangePolicyModalOpen,
    setSelectedProduct,
    formatCurrency,
    showToast,
    navigateToHome,
  } = useStore();

  const [searchInput, setSearchInput] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const fullPath =
        window.location.pathname + window.location.search + window.location.hash;
      setCurrentUrl(fullPath || '/unknown-route');
    } catch {
      setCurrentUrl('/unknown-route');
    }
  }, []);

  const handleReturnHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      navigateToHome();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchQuery(searchInput.trim());
    handleReturnHome();
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    handleReturnHome();
  };

  const handleCopyUrl = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast('Path copied to clipboard', 'info');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Unable to copy URL', 'error');
    }
  };

  // Select up to 4 flagship products to show as recovery recommendations
  const recommendedProducts: Product[] = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#FF5A36] selection:text-white">
      {/* 1. Dedicated 404 Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleReturnHome}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#0B2545]" />
              <span className="hidden sm:inline">Storefront</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div onClick={handleReturnHome} className="cursor-pointer">
              <SolveSpaceLogo variant="main" size="sm" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSetupBuilderOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#0B2545] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>Combo Builder</span>
            </button>

            <button
              onClick={handleReturnHome}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0B2545] hover:bg-[#133E68] transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero 404 Diagnostic & Blueprint Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
            
            {/* Left Column: Context, Explanation & Recovery Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Unboxed Status Kicker with clean separator (Zero-Pill Compliance) */}
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF5A36] tracking-wide">
                <Compass className="w-4 h-4 text-[#FF5A36]" />
                <span>Error 404</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-600">Workstation Blueprint Not Found</span>
              </div>

              {/* Bold Refined Display Headline */}
              <div className="space-y-3">
                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B2545] tracking-tight leading-tight"
                  style={{ textWrap: 'balance' }}
                >
                  This workstation component has been relocated or retired.
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                  The link, parameter, or product blueprint you requested does not match an active coordinate in the SolveSpace India inventory.
                </p>
              </div>

              {/* Diagnostic Path Container */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Attempted Request Path</span>
                  <button
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1 text-[#0B2545] hover:text-[#FF5A36] text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-800 bg-white px-3 py-2 rounded-xl border border-slate-200/80 truncate">
                  {currentUrl}
                </div>
              </div>

              {/* Search Within Catalog */}
              <form onSubmit={handleSearchSubmit} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Search SolveSpace Workstation Catalog
                </label>
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search aluminum risers, GaN chargers, screenbars..."
                    className="w-full pl-10 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/15 focus:outline-hidden transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 px-3.5 py-1.5 bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Action Buttons Hub */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleReturnHome}
                  className="px-6 py-3 bg-[#0B2545] hover:bg-[#133E68] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Storefront</span>
                </button>

                <button
                  onClick={() => setSetupBuilderOpen(true)}
                  className="px-5 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <Sliders className="w-4 h-4 text-[#FF5A36]" />
                  <span>Launch Combo Builder</span>
                </button>

                <button
                  onClick={() => setTrackOrderModalOpen(true)}
                  className="px-4 py-3 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span>Track Delhivery Order</span>
                </button>
              </div>
            </div>

            {/* Right Column: Architectural Engineering Blueprint Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-[#0B2545] via-[#103058] to-[#08182B] rounded-3xl p-6 sm:p-8 text-white shadow-xl overflow-hidden border border-slate-700/50 flex flex-col justify-between">
                
                {/* Blueprint Grid Lines Background */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #ffffff 1px, transparent 1px),
                      linear-gradient(to bottom, #ffffff 1px, transparent 1px)
                    `,
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Ambient Radial Flare */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FF5A36]/20 rounded-full blur-3xl pointer-events-none" />

                {/* Top Blueprint Header Specs */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-b border-white/10 pb-3 font-mono">
                  <span>SPEC // DISCONNECTED</span>
                  <span className="text-[#FF5A36] font-bold">NODE: NULL</span>
                </div>

                {/* Center Vector Illustration: Isometric Desk Riser Outline with 404 Core */}
                <div className="relative z-10 my-auto py-6 flex flex-col items-center justify-center text-center">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    {/* Concentric Pulsing Radar Calibration Rings */}
                    <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-25" />
                    <div className="absolute inset-4 rounded-full border border-dashed border-[#FF5A36]/40" />
                    <div className="absolute inset-8 rounded-full border border-white/15" />

                    {/* Stylized Vector Workstation Frame */}
                    <svg
                      viewBox="0 0 160 160"
                      className="w-36 h-36 drop-shadow-[0_8px_24px_rgba(255,90,54,0.3)]"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Isometric Top Tray Surface */}
                      <path
                        d="M80 30L135 60L80 90L25 60L80 30Z"
                        stroke="#FF5A36"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        fill="rgba(255, 90, 54, 0.08)"
                      />
                      {/* Aluminum Riser Pillars */}
                      <path
                        d="M25 60V95M135 60V95M80 90V125"
                        stroke="#94A3B8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* Sub-tray Base Shelf */}
                      <path
                        d="M25 95L80 125L135 95"
                        stroke="#64748B"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      {/* Center Precision Target Crosshair */}
                      <circle cx="80" cy="60" r="5" fill="#FF5A36" />
                      <line x1="80" y1="46" x2="80" y2="74" stroke="#FFFFFF" strokeWidth="1.5" />
                      <line x1="66" y1="60" x2="94" y2="60" stroke="#FFFFFF" strokeWidth="1.5" />
                    </svg>
                  </div>

                  {/* 404 Large Space Grotesk Display Number */}
                  <div className="mt-2 space-y-1">
                    <div
                      className="text-5xl sm:text-6xl font-black tracking-tight text-white"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      404
                    </div>
                    <div className="text-xs text-slate-300 font-mono tracking-wider uppercase">
                      MISSING WORKSPACE ASSET
                    </div>
                  </div>
                </div>

                {/* Bottom Blueprint Technical Footnote */}
                <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-3 font-mono">
                  <span>LOG: BLR-HUB // SEC-01</span>
                  <span>CALIBRATION: 0.00MM</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Browse Workstation Categories Fast Route */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Explore Core Workstation Collections
              </h2>
              <p className="text-xs text-slate-500">
                Quickly redirect into verified, in-stock SolveSpace collections.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleCategoryClick('Desk & Workspace')}
              className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all group cursor-pointer shadow-2xs hover:border-[#0B2545]/40"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B2545] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Desk & Workspace</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0B2545] transition-colors" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                CNC Aluminum Risers, cable management trays & felt desk mats.
              </p>
            </button>

            <button
              onClick={() => handleCategoryClick('Tech & Mobility')}
              className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all group cursor-pointer shadow-2xs hover:border-[#0B2545]/40"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5A36] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Tech & Mobility</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF5A36] transition-colors" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                100W GaN desktop charging stations, ScreenBar monitor lamps & hubs.
              </p>
            </button>

            <button
              onClick={() => handleCategoryClick('Home & Wellness')}
              className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all group cursor-pointer shadow-2xs hover:border-[#0B2545]/40"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Home & Wellness</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Medical H13 HEPA desktop air purifiers & orthopedic lumbar supports.
              </p>
            </button>
          </div>
        </section>

        {/* 4. Curated Flagship Solutions Recommendations */}
        {recommendedProducts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Popular SolveSpace Solutions
                </h2>
                <p className="text-xs text-slate-500">
                  Engineered essentials frequently paired together by Indian developers and creators.
                </p>
              </div>
              <button
                onClick={handleReturnHome}
                className="text-xs font-bold text-[#FF5A36] hover:underline cursor-pointer hidden sm:block"
              >
                View Complete Catalog ({products.length})
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {recommendedProducts.map((product) => {
                const discount = product.compareAtPrice
                  ? Math.round(
                      ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
                    )
                  : null;

                return (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col group"
                  >
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      <img
                        src={product.images[0] || '/products/Screenshot_20260901_134903_Meesho.jpg'}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                      {discount && (
                        <div className="absolute top-2.5 left-2.5 bg-[#FF5A36] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                          {discount}% OFF
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {product.category}
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-[#0B2545] transition-colors">
                          {product.title}
                        </h3>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-xs sm:text-sm font-black text-[#0B2545] font-mono tabular-nums">
                            {formatCurrency(product.price)}
                          </div>
                          {product.compareAtPrice && (
                            <div className="text-[10px] text-slate-400 line-through font-mono tabular-nums">
                              {formatCurrency(product.compareAtPrice)}
                            </div>
                          )}
                        </div>

                        <span className="text-[11px] font-bold text-[#FF5A36] group-hover:underline">
                          View
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. Customer Care & Assistance Strip */}
        <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-[#FF5A36]">
              <LifeBuoy className="w-4 h-4" />
              <span>SolveSpace Customer Care</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold">
              Looking for an active order or delivery confirmation?
            </h3>
            <p className="text-xs text-slate-400">
              Our Bengaluru & Mumbai logistics desks handle pan-India dispatch and exchanges Monday–Saturday.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={() => setTrackOrderModalOpen(true)}
              className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Track Delhivery Order
            </button>
            <button
              onClick={() => setExchangePolicyModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Exchange Policy
            </button>
            <a
              href="mailto:support@solvespace.in"
              className="px-4 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-medium rounded-xl transition-colors"
            >
              support@solvespace.in
            </a>
          </div>
        </section>
      </main>

      {/* 6. Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 SolveSpace India. Precision Workspace Solutions.</span>
          <div className="flex items-center gap-4">
            <button onClick={handleReturnHome} className="hover:text-slate-900 cursor-pointer">
              Home
            </button>
            <span>·</span>
            <button onClick={() => setExchangePolicyModalOpen(true)} className="hover:text-slate-900 cursor-pointer">
              Exchange Policy
            </button>
            <span>·</span>
            <button onClick={() => setTrackOrderModalOpen(true)} className="hover:text-slate-900 cursor-pointer">
              Track Order
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
