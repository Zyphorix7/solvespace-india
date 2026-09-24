import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShoppingBag,
  Check,
  Layers,
  Zap,
  Sun,
  Wind,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

export const DeskSetupBuilderModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { products, addToCart, formatCurrency, showToast } = useStore();

  // Find relevant products or fallbacks
  const organizerProd =
    products.find((p) => p.category === 'Desk & Workspace' || p.title.toLowerCase().includes('organizer')) ||
    products[0];
  const chargerProd =
    products.find((p) => p.title.toLowerCase().includes('charger') || p.category === 'Tech & Mobility') ||
    products[1] ||
    products[0];
  const lightProd =
    products.find((p) => p.title.toLowerCase().includes('screenbar') || p.title.toLowerCase().includes('light')) ||
    products[2] ||
    products[0];
  const purifierProd =
    products.find((p) => p.title.toLowerCase().includes('purifier') || p.category === 'Home & Wellness') ||
    products[3] ||
    products[0];

  // Options configuration
  const [selectedOrganizer, setSelectedOrganizer] = useState<{ id: string; name: string; finish: string; price: number }>({
    id: 'org_grey',
    name: 'UltraDesk CNC Aluminum Stand',
    finish: 'Space Grey Anodized',
    price: organizerProd ? organizerProd.price : 2499,
  });

  const [selectedCharger, setSelectedCharger] = useState<{ id: string; name: string; power: string; price: number }>({
    id: 'chg_100w',
    name: 'GaN 100W Multi-Port Hub',
    power: '100W 4-Port Fast Charge',
    price: chargerProd ? chargerProd.price : 2999,
  });

  const [selectedLight, setSelectedLight] = useState<{ id: string; name: string; type: string; price: number; included: boolean }>({
    id: 'light_pro',
    name: 'ScreenBar Halo Eye-Care Lamp',
    type: 'Dual-Source Ambient Dial',
    price: lightProd ? lightProd.price : 3499,
    included: true,
  });

  const [selectedPurifier, setSelectedPurifier] = useState<{ id: string; name: string; type: string; price: number; included: boolean }>({
    id: 'pur_h13',
    name: 'AeroClean Desktop H13 Purifier',
    type: 'Medical-Grade Ion HEPA',
    price: purifierProd ? purifierProd.price : 4499,
    included: true,
  });

  if (!isOpen) return null;

  // Calculate prices
  const rawTotal =
    selectedOrganizer.price +
    selectedCharger.price +
    (selectedLight.included ? selectedLight.price : 0) +
    (selectedPurifier.included ? selectedPurifier.price : 0);

  // Bundle discount: 15% off full workspace package
  const bundleDiscount = Math.round(rawTotal * 0.15);
  const finalBundlePrice = rawTotal - bundleDiscount;

  const handleAddBundleToCart = () => {
    // Add organizer
    if (organizerProd) addToCart(organizerProd, undefined, 1);
    // Add charger
    if (chargerProd) addToCart(chargerProd, undefined, 1);
    // Add light if included
    if (selectedLight.included && lightProd) addToCart(lightProd, undefined, 1);
    // Add purifier if included
    if (selectedPurifier.included && purifierProd) addToCart(purifierProd, undefined, 1);

    showToast('🎉 Complete SolveSpace Workspace Setup added to bag with 15% Bundle Discount!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200 animate-in fade-in-50 zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0B2545] text-white p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5A36] text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  SolveSpace Studio Workspace Builder
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  15% Bundle Savings
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Design your custom high-performance ergonomic setup. Guaranteed BIS safety & 1-Year Pan-India Warranty.
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

        {/* Content Layout: 2 Columns on PC, Stacked on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto max-h-[75vh]">
          
          {/* Left Visual Preview Column */}
          <div className="lg:col-span-5 bg-slate-900 p-6 flex flex-col justify-between text-white relative overflow-hidden">
            {/* Ambient desk glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                <span>Live Setup Visualizer</span>
              </div>
              <h3 className="text-xl font-black">Your Personalized Setup</h3>
              <p className="text-xs text-slate-400">
                Synchronized aesthetic with precision space-grade aluminum finishes.
              </p>
            </div>

            {/* Stylized Visual Desk Representation */}
            <div className="my-8 relative z-10 flex flex-col items-center">
              {/* ScreenBar Lamp Representation */}
              {selectedLight.included && (
                <div className="w-48 h-3 bg-linear-to-r from-amber-200 via-amber-100 to-amber-200 rounded-full shadow-[0_0_25px_rgba(251,191,36,0.6)] mb-2 animate-pulse" />
              )}

              {/* Monitor Screen Frame */}
              <div className="w-64 h-36 bg-slate-800 border-2 border-slate-700 rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden">
                <div className="text-center p-3">
                  <div className="text-[10px] font-extrabold text-[#FF5A36] tracking-widest uppercase">
                    SOLVESPACE INDIA
                  </div>
                  <div className="text-xs font-bold text-slate-300 mt-1">
                    Focused Work Environment
                  </div>
                </div>
                {/* Screen reflection */}
                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
              </div>

              {/* Monitor Stand */}
              <div className="w-10 h-6 bg-slate-700" />

              {/* Desk Surface with Selected Gear */}
              <div className="w-full max-w-sm h-24 bg-linear-to-b from-slate-800 to-slate-900 border-t-2 border-slate-600 rounded-t-xl p-3 flex items-center justify-around shadow-inner">
                {/* Organizer */}
                <div className="text-center">
                  <div className="w-16 h-8 bg-slate-700 border border-slate-500 rounded-md flex items-center justify-center text-[10px] font-bold text-slate-300 shadow-sm">
                    {selectedOrganizer.finish.includes('Wood') ? '🪵 Wood' : '🩶 CNC'}
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">Riser</span>
                </div>

                {/* GaN Charger */}
                <div className="text-center">
                  <div className="w-10 h-8 bg-[#0B2545] border border-blue-400 rounded-md flex items-center justify-center text-[10px] font-bold text-blue-300 shadow-sm">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">{selectedCharger.power.split(' ')[0]}</span>
                </div>

                {/* Purifier */}
                {selectedPurifier.included && (
                  <div className="text-center">
                    <div className="w-12 h-10 bg-slate-700 border border-emerald-400 rounded-t-lg flex items-center justify-center text-[10px] font-bold text-emerald-300 shadow-sm">
                      <Wind className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1">H13 HEPA</span>
                  </div>
                )}
              </div>
            </div>

            {/* Guarantees Box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1.5 text-xs text-slate-300 relative z-10">
              <div className="flex items-center gap-2 text-white font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1-Year Pan-India Direct Replacement</span>
              </div>
              <p className="text-[11px] text-slate-400">
                All components are BIS certified and packed in heavy-duty eco foam.
              </p>
            </div>
          </div>

          {/* Right Configuration Options Column */}
          <div className="lg:col-span-7 p-4 sm:p-8 space-y-6">
            
            {/* Step 1: Desk Organizer / Riser */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#FF5A36]" />
                  <span>1. Choose Desk Ergonomics & Finish</span>
                </span>
                <span className="font-bold text-slate-500">{selectedOrganizer.finish}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'org_grey', name: 'UltraDesk Space Grey', finish: 'Space Grey Anodized', price: organizerProd?.price || 2499 },
                  { id: 'org_wood', name: 'UltraDesk Walnut Oak', finish: 'Natural Walnut Hardwood', price: (organizerProd?.price || 2499) + 400 },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOrganizer(opt)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedOrganizer.id === opt.id
                        ? 'border-[#0B2545] bg-[#0B2545]/5 ring-2 ring-[#0B2545]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{opt.name}</div>
                      <div className="text-[11px] text-slate-500">{opt.finish}</div>
                    </div>
                    <div className="text-xs font-black text-slate-800">
                      {formatCurrency(opt.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: GaN Power Hub */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>2. Choose GaN Power Architecture</span>
                </span>
                <span className="font-bold text-slate-500">{selectedCharger.power}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'chg_65w', name: 'GaN 65W Ultra-Compact', power: '65W Dual USB-C + USB-A', price: 1999 },
                  { id: 'chg_100w', name: 'GaN 100W Multi-Port Hub', power: '100W 4-Port Fast Charge', price: chargerProd?.price || 2999 },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedCharger(opt)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedCharger.id === opt.id
                        ? 'border-[#0B2545] bg-[#0B2545]/5 ring-2 ring-[#0B2545]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{opt.name}</div>
                      <div className="text-[11px] text-slate-500">{opt.power}</div>
                    </div>
                    <div className="text-xs font-black text-slate-800">
                      {formatCurrency(opt.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Monitor ScreenBar */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>3. Add ScreenBar Eye-Care Lamp</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedLight((prev) => ({ ...prev, included: !prev.included }))}
                  className={`text-xs font-bold px-2 py-0.5 rounded cursor-pointer ${
                    selectedLight.included ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                  }`}
                >
                  {selectedLight.included ? 'Included ✓' : '+ Add to Setup'}
                </button>
              </div>
              <div
                onClick={() => setSelectedLight((prev) => ({ ...prev, included: !prev.included }))}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedLight.included
                    ? 'border-slate-900 bg-slate-50 shadow-xs'
                    : 'border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      selectedLight.included ? 'bg-[#0B2545] text-white' : 'border border-slate-300 text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{selectedLight.name}</div>
                    <div className="text-[11px] text-slate-500">{selectedLight.type} • Reduces 90% eye strain</div>
                  </div>
                </div>
                <div className="text-xs font-black text-slate-900">
                  {formatCurrency(selectedLight.price)}
                </div>
              </div>
            </div>

            {/* Step 4: HEPA Air Purifier */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-emerald-600" />
                  <span>4. Add Medical H13 Air Purifier</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPurifier((prev) => ({ ...prev, included: !prev.included }))}
                  className={`text-xs font-bold px-2 py-0.5 rounded cursor-pointer ${
                    selectedPurifier.included ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                  }`}
                >
                  {selectedPurifier.included ? 'Included ✓' : '+ Add to Setup'}
                </button>
              </div>
              <div
                onClick={() => setSelectedPurifier((prev) => ({ ...prev, included: !prev.included }))}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedPurifier.included
                    ? 'border-slate-900 bg-slate-50 shadow-xs'
                    : 'border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      selectedPurifier.included ? 'bg-[#0B2545] text-white' : 'border border-slate-300 text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{selectedPurifier.name}</div>
                    <div className="text-[11px] text-slate-500">True PM2.5 Medical-Grade Filtration for Indian air</div>
                  </div>
                </div>
                <div className="text-xs font-black text-slate-900">
                  {formatCurrency(selectedPurifier.price)}
                </div>
              </div>
            </div>

            {/* Total Pricing & Action Bar */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-900">
                    Workspace Bundle Discount (15% OFF)
                  </div>
                  <div className="text-[11px] text-amber-700">
                    Applied automatically to all configured items
                  </div>
                </div>
                <div className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Save {formatCurrency(bundleDiscount)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] text-slate-500">Total Bundle Value:</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      {formatCurrency(finalBundlePrice)}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      {formatCurrency(rawTotal)}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                      Inclusive of GST
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddBundleToCart}
                  className="min-h-[48px] px-6 py-3 bg-[#FF5A36] hover:bg-[#E04826] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Workspace Setup to Bag</span>
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
