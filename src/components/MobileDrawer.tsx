import React from 'react';
import {
  X,
  Truck,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Compass,
  Zap,
  ShoppingBag,
  ExternalLink,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { SolveSpaceLogo } from './SolveSpaceLogo';

interface MobileDrawerProps {
  onOpenAuth: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ onOpenAuth }) => {
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    selectedCategory,
    setSelectedCategory,
    setSetupBuilderOpen,
    setTrackOrderModalOpen,
    setCartDrawerOpen,
    setExchangePolicyModalOpen,
    cartCount,
  } = useStore();

  const { user, logout } = useAuth();

  if (!mobileMenuOpen) return null;

  const categories = [
    { name: 'All', icon: Compass },
    { name: 'Desk & Workspace', icon: Zap },
    { name: 'Tech & Mobility', icon: Zap },
    { name: 'Home & Wellness', icon: Zap },
  ];

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setMobileMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-[340px] w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <SolveSpaceLogo variant="main" size="sm" />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center w-12 h-12 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content list with 48px touch targets */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Categories */}
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
              Browse Categories
            </span>
            <div className="mt-2 space-y-1">
              {categories.map((c) => {
                const isSelected = selectedCategory === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => handleCategorySelect(c.name)}
                    className={`w-full min-h-[48px] px-3 py-3 rounded-xl flex items-center justify-between text-left font-semibold text-sm transition-colors active:scale-98 ${
                      isSelected
                        ? 'bg-[#0B2545] text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{c.name}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#F58220]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-slate-100 pt-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
              Shopping & Tracking
            </span>
            <div className="mt-2 space-y-1">
              {/* Cart Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCartDrawerOpen(true);
                }}
                className="w-full min-h-[48px] px-3 py-3 rounded-xl flex items-center gap-3 text-slate-700 hover:bg-slate-100 font-semibold text-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span>Shopping Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-[#F58220] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {cartCount} items
                    </span>
                  )}
                </div>
              </button>

              {/* Track Order */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setTrackOrderModalOpen(true);
                }}
                className="w-full min-h-[48px] px-3 py-3 rounded-xl flex items-center gap-3 text-slate-700 hover:bg-slate-100 font-semibold text-sm cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Truck className="w-4 h-4" />
                </div>
                <span>Track My Indian Shipment</span>
              </button>

              {/* 5-Day Product Exchange Policy */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setExchangePolicyModalOpen(true);
                }}
                className="w-full min-h-[48px] px-3 py-3 rounded-xl flex items-center gap-3 text-slate-700 hover:bg-slate-100 font-semibold text-sm cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <span>Product Exchange Policy</span>
                  <span className="text-[10px] text-amber-700 font-bold block">Exchange Only • No Cash Returns</span>
                </div>
              </button>

              {/* Workspace Studio Builder Trigger */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSetupBuilderOpen(true);
                }}
                className="w-full min-h-[48px] px-3 py-3 rounded-xl flex items-center gap-3 text-slate-700 hover:bg-slate-100 font-semibold text-sm cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF5A36]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span>Custom Workspace Builder</span>
                  <span className="text-[10px] bg-orange-100 text-orange-800 font-extrabold px-1.5 py-0.5 rounded-sm">
                    15% OFF
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* User Account / Profile */}
          <div className="border-t border-slate-100 pt-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
              Account
            </span>
            <div className="mt-2">
              {user ? (
                <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="User"
                        className="w-10 h-10 rounded-full border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#0B2545] text-white flex items-center justify-center font-bold">
                        {user.displayName?.[0] || user.email?.[0] || 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.displayName || 'Customer'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="w-full min-h-[44px] text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg py-2 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full min-h-[48px] px-3 py-3 rounded-xl flex items-center justify-center gap-2 bg-[#0B2545] text-white font-bold text-sm shadow-xs active:scale-98"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Sign In / Create Account</span>
                </button>
              )}
            </div>
          </div>

          {/* Official Brand Identity Kit Trigger */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              window.dispatchEvent(new CustomEvent('open-brand-kit'));
            }}
            className="w-full p-3 bg-gradient-to-r from-slate-50 to-orange-50/50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-800 hover:border-[#F58220]/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0B2545] flex items-center justify-center text-white">
                <SolveSpaceLogo variant="icon" size="xs" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-900">Brand Kit & Official Logos</span>
                <span className="block text-[10px] text-slate-500 font-normal">Vectors, Color Palette & Packaging</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F58220] text-white">
              Guide
            </span>
          </button>

          {/* Trust Guarantees */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SolveSpace India Promise</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              5-Day Product Exchange Guarantee (Only Product Exchange Accepted - No Cash Returns), 1-Year Pan-India Replacement Warranty, Free Express Courier over ₹999, and verified Cash on Delivery.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>₹ INR (Indian Rupee)</span>
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span>SS AI Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
};
