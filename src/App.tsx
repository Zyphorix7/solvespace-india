import React, { useState, useRef } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { MobileDrawer } from './components/MobileDrawer';
import { CartDrawer } from './components/CartDrawer';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAuthPortal } from './components/AdminAuthPortal';
import { DeskSetupBuilderModal } from './components/DeskSetupBuilderModal';
import { RecentlyViewedShelf } from './components/RecentlyViewedShelf';
import { LiveSalesTicker } from './components/LiveSalesTicker';
import { GeminiChatbot } from './components/GeminiChatbot';
import { TrackOrderModal } from './components/TrackOrderModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { SolveSpaceLogo } from './components/SolveSpaceLogo';
import { ExchangePolicyModal } from './components/ExchangePolicyModal';
import { BrandKitModal } from './components/BrandKitModal';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  MapPin,
  Lock,
  Package,
  Layers,
  Zap,
  Palette,
  ArrowRight,
} from 'lucide-react';
import { Product } from './types';

const StoreContent: React.FC = () => {
  const {
    products,
    isLoadingProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedProduct,
    setSelectedProduct,
    seedCatalog,
    exchangePolicyModalOpen,
    setExchangePolicyModalOpen,
    setTrackOrderModalOpen,
    setupBuilderOpen,
    setSetupBuilderOpen,
    adminOpen,
    isAdminAuthenticated,
    loginAdmin,
    closeAdmin,
  } = useStore();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [brandKitOpen, setBrandKitOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOpenBrandKit = () => setBrandKitOpen(true);
    window.addEventListener('open-brand-kit', handleOpenBrandKit);
    return () => window.removeEventListener('open-brand-kit', handleOpenBrandKit);
  }, []);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#FF5A36] selection:text-white">
      {/* Universal Header with SolveSpace Branding & Cart Counter */}
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Hero Showcase Banner */}
      <HeroBanner onExploreClick={scrollToProducts} />

      {/* Main Content Area */}
      <main ref={productsRef} className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        
        {/* Workspace Builder Interactive Banner (Unique Feature) */}
        <section className="relative overflow-hidden bg-linear-to-r from-[#0B2545] via-[#133E68] to-[#0B2545] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#FF5A36]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#FF5A36] text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Studio Configurator</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight">
                Design Your Complete Dream Desk Setup
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Combine the CNC Aluminum Riser, 100W GaN Charging Hub, Dual ScreenBar, and HEPA Purifier. Instant 15% Workspace Bundle Discount automatically applied.
              </p>
            </div>
            <button
              onClick={() => setSetupBuilderOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF5A36] hover:bg-[#E04826] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-500/30 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <span>Launch Setup Builder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Category Navigation Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Engineered Workstation Solutions</span>
              <span className="text-xs font-bold text-slate-400 font-mono">
                ({filteredProducts.length})
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tested for Indian 230V surges, dust, and compact metropolitan spaces.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['All', 'Desk & Workspace', 'Tech & Mobility', 'Home & Wellness'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#0B2545] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* Products Grid */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-4"
              >
                <div className="aspect-square bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          /* Empty Search / Catalog State */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {searchQuery ? 'No Solutions Matched Your Query' : 'SolveSpace India Catalog Ready'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {searchQuery
                  ? 'Try searching with different keywords like "organizer", "charger", or "purifier".'
                  : 'The application is initialized clean. You can reload 5 curated SolveSpace products below.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="min-h-[48px] px-6 py-2.5 bg-[#0B2545] text-white text-xs font-bold rounded-xl active:scale-95 cursor-pointer"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={seedCatalog}
                  className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 cursor-pointer"
                >
                  Seed 5 SolveSpace Products
                </button>
              )}
            </div>
          </div>
        )}

        {/* Recently Viewed Shelf (Shopify / Plusbase Style) */}
        <RecentlyViewedShelf />

        {/* Brand Engineering Story & Quality Section */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#FF5A36] uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                <span>The SolveSpace Standard</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Crafted for India’s Ambition & Workplace Demands.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Generic imports fail under Indian electrical fluctuations and tropical humidity. SolveSpace India re-engineers every desk accessory with BIS surge protection, medical-grade H13 HEPA seals, and aerospace aluminum alloys for lifelong durability.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-black text-[#0B2545]">100%</div>
                  <div className="text-xs text-slate-600 font-semibold">BIS Safety Compliant</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-black text-[#0B2545]">1-Year</div>
                  <div className="text-xs text-slate-600 font-semibold">Pan-India Replacement</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80"
                alt="SolveSpace Precision Workspace"
                className="w-full h-80 object-cover rounded-2xl shadow-lg border border-slate-200"
              />
              <div className="absolute -bottom-4 -left-4 bg-[#0B2545] text-white p-4 rounded-2xl shadow-xl max-w-xs border border-white/10 hidden sm:block">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Guaranteed Quality
                </div>
                <div className="text-xs text-slate-200 mt-1">
                  100% Genuine Materials. Direct from Bengaluru & Mumbai logistics hubs.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Trust Badges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0B2545] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Express Pan-India</div>
              <div className="text-[11px] text-slate-500">Free delivery on ₹999+</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF5A36] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">1-Year Warranty</div>
              <div className="text-[11px] text-slate-500">Direct replacement guarantee</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">5-Day Exchange</div>
              <div className="text-[11px] text-slate-500">Exchanges only • No cash returns</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Secure Payments</div>
              <div className="text-[11px] text-slate-500">UPI, Cards & NetBanking</div>
            </div>
          </div>
        </section>

      </main>

      {/* Universal Store Footer */}
      <footer className="bg-[#0B2545] text-white pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <SolveSpaceLogo variant="main" textColor="#FFFFFF" subtextColor="#CBD5E1" size="md" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Premium ergonomic workspace essentials engineered for modern Indian professionals.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-[#FF5A36]" />
                <span>Bengaluru & Mumbai, India</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Categories
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li
                  onClick={() => setSelectedCategory('Desk & Workspace')}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  Desk Organizers & Aluminum Risers
                </li>
                <li
                  onClick={() => setSelectedCategory('Tech & Mobility')}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  GaN Chargers & ScreenBar Lamps
                </li>
                <li
                  onClick={() => setSelectedCategory('Home & Wellness')}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  H13 HEPA Air Purifiers & Ergonomics
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Customer Care
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li
                  onClick={() => setTrackOrderModalOpen(true)}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  Track Delhivery Order
                </li>
                <li
                  onClick={() => setExchangePolicyModalOpen(true)}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  Product Exchange Policy
                </li>
                <li className="hover:text-white transition-colors">
                  Warranty & BIS Certification
                </li>
                <li className="hover:text-white transition-colors">
                  support@solvespace.in
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Guaranteed Dispatch
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Orders verified with Instant UPI or COD are dispatched within 24 hours via Delhivery & Blue Dart Express.
              </p>
              <div className="pt-1">
                <span className="inline-block bg-white/10 px-2.5 py-1 rounded-md text-[11px] font-bold text-amber-300">
                  GST Registered • Made for India
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 SolveSpace India. All rights reserved. Precision Workspace Solutions.
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setBrandKitOpen(true)}
                className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Palette className="w-3 h-3 text-[#FF5A36]" />
                <span>Brand Kit</span>
              </button>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <button
                type="button"
                onClick={() => setExchangePolicyModalOpen(true)}
                className="hover:text-white underline cursor-pointer"
              >
                Exchange Policy
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Plusbase Social Proof Live Sales Ticker */}
      <LiveSalesTicker />

      {/* Interactive Desk Setup Builder Modal */}
      <DeskSetupBuilderModal
        isOpen={setupBuilderOpen}
        onClose={() => setSetupBuilderOpen(false)}
      />

      {/* Slide-over & Modal Overlays */}
      <CartDrawer />
      <MobileDrawer onOpenAuth={() => setAuthModalOpen(true)} />
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <CheckoutModal />

      {/* ADMIN SECURITY PORTAL & DASHBOARD */}
      {/* Admin Dashboard is strictly gated: only accessible at /admin with password "Solvespace1@%!" */}
      {adminOpen && !isAdminAuthenticated && (
        <AdminAuthPortal
          onAuthenticate={loginAdmin}
          onCancel={closeAdmin}
        />
      )}

      {adminOpen && isAdminAuthenticated && <AdminDashboard />}

      <TrackOrderModal />
      <ExchangePolicyModal
        isOpen={exchangePolicyModalOpen}
        onClose={() => setExchangePolicyModalOpen(false)}
        onOpenTrackOrder={() => setTrackOrderModalOpen(true)}
      />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <BrandKitModal isOpen={brandKitOpen} onClose={() => setBrandKitOpen(false)} />
      <GeminiChatbot />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <StoreContent />
      </StoreProvider>
    </AuthProvider>
  );
}
