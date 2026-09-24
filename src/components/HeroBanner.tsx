import React from 'react';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones, Sparkles, CheckCircle2, ChevronRight, Package, Flame } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeroBannerProps {
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  const { setTrackOrderModalOpen, setExchangePolicyModalOpen, setSelectedCategory } = useStore();

  return (
    <section className="w-full bg-[#F8FAFC] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-6">
        {/* Split Hero Grid (Screenshot 2 style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Main Large Hero Card (Left 8 cols on desktop) */}
          <div className="lg:col-span-8 bg-gradient-to-br from-slate-100 via-white to-slate-50 rounded-3xl border border-slate-200/80 p-6 sm:p-10 md:p-12 relative overflow-hidden shadow-xs flex flex-col justify-between min-h-[380px] sm:min-h-[440px]">
            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-md space-y-4">
              {/* Category Pill Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[#FF5A36] text-xs font-black uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Workspace Gear</span>
              </div>

              {/* Bold Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
                Your One-Stop Tech & Workspace Market
              </h1>

              {/* Subtext */}
              <p className="text-slate-600 text-xs sm:text-sm sm:leading-relaxed font-normal">
                Welcome to SolveSpace India, a curated space where you can elevate your workstation setup every day. Engineered aerospace aluminum stands, GaN chargers, and clean desk tech.
              </p>

              {/* Coral Shop Now Pill Button (Screenshot 2 CTA) */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={onExploreClick}
                  className="px-8 py-3.5 bg-[#FF5A36] hover:bg-[#E04826] text-white rounded-full font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setTrackOrderModalOpen(true)}
                  className="px-5 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-slate-500" />
                  <span>Track Order</span>
                </button>
              </div>
            </div>

            {/* Desk Workspace Imagery (Screenshot 2 featured desk layout visual) */}
            <div className="absolute right-0 bottom-0 w-1/2 sm:w-5/12 h-full hidden sm:flex items-end justify-end pointer-events-none pr-4 pb-2">
              <img
                src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80"
                alt="Modern Desk Setup"
                className="w-full max-h-[360px] object-cover object-bottom rounded-2xl shadow-xl border-4 border-white rotate-1 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Side Stacked Promo Cards (Screenshot 2 style) */}
          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
            {/* Card 1: Free Shipping Card */}
            <div className="flex-1 bg-gradient-to-br from-amber-50 to-orange-50/80 rounded-3xl border border-amber-200/70 p-5 sm:p-6 flex items-center justify-between shadow-xs">
              <div className="space-y-1.5 max-w-[65%]">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-200/50 px-2 py-0.5 rounded-full inline-block">
                  Express Hubs
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  Free Shipping Everywhere!
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600">
                  Special for all orders over ₹999 across India.
                </p>
                <button
                  onClick={onExploreClick}
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-[#FF5A36] hover:underline pt-1 cursor-pointer"
                >
                  <span>Explore Now</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Delivery Icon Box */}
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-amber-200 flex items-center justify-center text-[#FF5A36] shrink-0">
                <Package className="w-8 h-8 stroke-[1.5]" />
              </div>
            </div>

            {/* Card 2: Festive Clearance Card */}
            <div className="flex-1 bg-slate-900 text-white rounded-3xl p-5 sm:p-6 flex items-center justify-between shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5A36]/20 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-1.5 max-w-[65%] relative z-10">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-white/10 px-2 py-0.5 rounded-full inline-block">
                  Festive Deals
                </span>
                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  Up to 60% Clearance Promo
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  Top-tier stands, GaN chargers & desk air solutions.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('Desk & Workspace');
                    onExploreClick();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A36] text-white text-xs font-bold shadow-xs hover:bg-[#E04826] transition-colors mt-1 cursor-pointer"
                >
                  <span>Shop Deals</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Tech Visual Render */}
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
                <Flame className="w-8 h-8 text-[#FF5A36]" />
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges Strip (Screenshot 2 style: 4 columns with linear icons) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-2xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* 1. SS AI Intelligence */}
            <div className="flex items-center gap-3.5 pt-2 sm:pt-0 sm:px-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 flex items-center justify-center text-[#FF5A36] shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <div className="text-xs sm:text-sm font-black text-slate-900">SS AI Intelligence</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Gemini Ergonomic Concierge</div>
              </div>
            </div>

            {/* 2. Secure */}
            <div className="flex items-center gap-3.5 pt-2 sm:pt-0 sm:px-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <div className="text-xs sm:text-sm font-black text-slate-900">Secure & Certified</div>
                <div className="text-[11px] text-slate-500 mt-0.5">100% BIS Quality Verified</div>
              </div>
            </div>

            {/* 3. Fast Shipping */}
            <div className="flex items-center gap-3.5 pt-2 sm:pt-0 sm:px-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <div className="text-xs sm:text-sm font-black text-slate-900">Express Delivery</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Fast & Reliable Across India</div>
              </div>
            </div>

            {/* 4. Transparent Exchange Only Policy */}
            <button
              onClick={() => setExchangePolicyModalOpen(true)}
              className="flex items-center gap-3.5 pt-2 sm:pt-0 sm:px-3 text-left hover:opacity-85 transition-opacity cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 group-hover:scale-105 transition-transform">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <div className="text-xs sm:text-sm font-black text-slate-900 underline decoration-dotted underline-offset-2">
                  Product Exchange Only
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">5-Day Doorstep Replacement</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
