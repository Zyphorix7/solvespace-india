import React, { useState } from 'react';
import {
  Menu,
  Search,
  ShoppingBag,
  User as UserIcon,
  ShieldCheck,
  Truck,
  Sparkles,
  LayoutDashboard,
  X,
  MapPin,
  ChevronDown,
  Layers,
  Flame,
  Clock,
  RotateCcw,
  Palette,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { SolveSpaceLogo } from './SolveSpaceLogo';

interface HeaderProps {
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const {
    cartCount,
    subtotal,
    setCartDrawerOpen,
    setMobileMenuOpen,
    setSetupBuilderOpen,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    setTrackOrderModalOpen,
    setExchangePolicyModalOpen,
    formatCurrency,
    navigateToHome,
  } = useStore();

  const { user } = useAuth();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const categories = ['All', 'Kitchen & Home', 'Smart Gadgets', 'Accessories'];

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs font-sans">
      {/* 1. Top Utility Bar (Screenshot 2 style) */}
      <div className="bg-white border-b border-slate-100 text-slate-500 text-xs py-1.5 px-3 sm:px-6 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Location & Contact */}
          <div className="flex items-center gap-5 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>123 Innovation Way, Bengaluru, India</span>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-ss-ai'))}
              className="flex items-center gap-1.5 text-[#FF5A36] hover:text-[#E04826] font-bold cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>SS AI Studio</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-xs bg-[#FF5A36]/10 border border-[#FF5A36]/20 text-[#FF5A36]">v3.8</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-brand-kit'))}
              className="flex items-center gap-1 text-slate-600 hover:text-[#0B2545] font-semibold cursor-pointer transition-colors"
              title="Official Brand Guide & Logos"
            >
              <Palette className="w-3.5 h-3.5 text-[#F58220]" />
              <span>Brand Kit & Logos</span>
            </button>
          </div>

          {/* Right: Currency, Language & Quick Links */}
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setTrackOrderModalOpen(true)}
              className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>Track Order</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setExchangePolicyModalOpen(true)}
              className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Exchange Policy</span>
            </button>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 text-slate-700 font-semibold cursor-pointer">
              <span>₹ INR</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-center gap-1 text-slate-700 font-semibold cursor-pointer">
              <span>🇮🇳 English</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navbar Bar: Official SolveSpace India Logo - Big Centered Search - Cart & Account */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Mobile Menu Trigger & Official SolveSpace India Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden flex items-center justify-center w-10 h-10 text-slate-700 hover:text-slate-900 active:scale-95"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Official SolveSpace India Logo from Brand Identity Kit */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigateToHome();
            }}
            className="flex items-center group cursor-pointer"
          >
            <SolveSpaceLogo variant="main" size="md" />
          </a>
        </div>

        {/* Center: Search Bar (Screenshot 2 style with integrated search button) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4 relative items-center">
          <input
            type="text"
            placeholder="Search products, categories, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/15 focus:outline-hidden transition-all text-slate-800 placeholder-slate-400 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-12 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            className="absolute right-1.5 w-8 h-8 rounded-full bg-[#FF5A36] hover:bg-[#E04826] text-white flex items-center justify-center shadow-xs cursor-pointer transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Right Actions: Admin Button, Account & Cart */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className="md:hidden flex items-center justify-center w-10 h-10 text-slate-700 hover:text-slate-900"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Kitchen Combo Builder Trigger */}
          <button
            onClick={() => setSetupBuilderOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#0B2545] hover:bg-slate-900 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Configure Custom Kitchen Chopper Combo"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span>Combo Builder</span>
          </button>

          {/* User Account (Screenshot 2: User Icon + Text) */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
            aria-label="Account"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-slate-300 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <div className="hidden lg:flex flex-col text-left leading-tight text-xs">
              <span className="text-[10px] text-slate-400">Hello, {user ? (user.displayName || 'Member') : 'Sign In'}</span>
              <span className="font-bold text-slate-800">My Account</span>
            </div>
          </button>

          {/* Cart Icon & Price Display (Screenshot 2 style: Cart / $Amount) */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="relative flex items-center gap-2.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full active:scale-95 transition-all cursor-pointer"
            aria-label="View shopping cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#FF5A36] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight text-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Cart</span>
              <span className="font-extrabold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Vibrant Coral Sub-Navbar Bar (Signature Feature from Screenshot 2: #FF5A36) */}
      <div className="bg-[#FF5A36] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between text-xs sm:text-sm font-bold">
          {/* Left: All Categories Dropdown + Primary Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* All Categories Button */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="flex items-center gap-2 px-4 py-3 bg-[#E64A26] hover:bg-[#D43F1D] text-white transition-colors cursor-pointer select-none"
              >
                <Menu className="w-4 h-4" />
                <span className="font-extrabold uppercase tracking-wider text-xs">All Categories</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </button>

              {/* Category Dropdown Popover */}
              {showCategoryMenu && (
                <div className="absolute top-full left-0 w-60 bg-white text-slate-800 rounded-b-2xl shadow-2xl border border-slate-200/80 py-2 z-50 animate-in fade-in-50 duration-150">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCategoryMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between transition-colors hover:bg-slate-50 cursor-pointer ${
                        selectedCategory === cat ? 'text-[#FF5A36] bg-orange-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && <span className="w-2 h-2 rounded-full bg-[#FF5A36]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-nav Links from Screenshot 2 */}
            <nav className="hidden md:flex items-center">
              <button
                onClick={() => setSelectedCategory('All')}
                className="px-3.5 py-3 hover:bg-white/10 transition-colors text-white cursor-pointer"
              >
                Products
              </button>
              <button
                onClick={() => setExchangePolicyModalOpen(true)}
                className="px-3.5 py-3 hover:bg-white/10 transition-colors text-white cursor-pointer"
              >
                Exchange Policy
              </button>
              <button
                onClick={() => setTrackOrderModalOpen(true)}
                className="px-3.5 py-3 hover:bg-white/10 transition-colors text-white cursor-pointer"
              >
                Track Order
              </button>
              <button
                onClick={() => setSelectedCategory('Desk & Workspace')}
                className="px-3.5 py-3 hover:bg-white/10 transition-colors text-amber-200 flex items-center gap-1 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>LIMITED SALE</span>
              </button>
              <button
                onClick={() => setSelectedCategory('Tech & Mobility')}
                className="px-3.5 py-3 hover:bg-white/10 transition-colors text-white cursor-pointer"
              >
                Best Seller
              </button>
              <button
                onClick={() => setSelectedCategory('Home & Wellness')}
                className="px-3.5 py-3 hover:bg-white/10 transition-colors text-white cursor-pointer"
              >
                New Arrival
              </button>
            </nav>
          </div>

          {/* Right: Dispatch / Delivery Highlight */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-white/90">
            <Clock className="w-3.5 h-3.5 text-amber-200" />
            <span>Fast Pan-India Express Delivery • 1-Year Warranty</span>
          </div>
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {showSearchInput && (
        <div className="md:hidden px-4 pb-3 pt-2 border-t border-slate-100 bg-white">
          <div className="relative">
            <input
              type="text"
              placeholder="Search SolveSpace products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-full focus:outline-hidden focus:bg-white text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 p-1 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
