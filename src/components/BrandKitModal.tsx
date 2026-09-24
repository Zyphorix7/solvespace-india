import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  Package,
  Layers,
  Palette,
  ExternalLink,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import { SolveSpaceLogo, LogoVariant } from './SolveSpaceLogo';

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandKitModal: React.FC<BrandKitModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [backgroundTheme, setBackgroundTheme] = useState<'light' | 'dark' | 'transparent'>('light');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const brandColors = [
    {
      name: 'SolveSpace Deep Navy',
      hex: '#0B2545',
      rgb: 'rgb(11, 37, 69)',
      role: 'Primary Brand, Shell, Arrow & Typography',
      textColor: 'text-white',
    },
    {
      name: 'SolveSpace Amber Orange',
      hex: '#F58220',
      rgb: 'rgb(245, 130, 32)',
      role: 'Filament, Energy & Secondary Contour',
      textColor: 'text-white',
    },
    {
      name: 'Tricolor Saffron',
      hex: '#FF671F',
      rgb: 'rgb(255, 103, 31)',
      role: 'India Flag Ribbon Top Wave',
      textColor: 'text-white',
    },
    {
      name: 'Tricolor India Green',
      hex: '#046A38',
      rgb: 'rgb(4, 106, 56)',
      role: 'India Flag Ribbon Bottom Wave',
      textColor: 'text-white',
    },
  ];

  const brandAssets: {
    title: string;
    description: string;
    variant: LogoVariant;
    key: string;
    previewSize: 'sm' | 'md' | 'lg';
  }[] = [
    {
      title: 'Main Logo',
      description: 'Official primary brand logo with Indian Tricolor wave ribbon',
      variant: 'main',
      key: 'main',
      previewSize: 'md',
    },
    {
      title: 'Horizontal Logo',
      description: 'Compact horizontal wordmark for navbars and tight spaces',
      variant: 'horizontal',
      key: 'horizontal',
      previewSize: 'md',
    },
    {
      title: 'Stacked Logo',
      description: 'Centered emblem for packaging, apparel, and hero titles',
      variant: 'stacked',
      key: 'stacked',
      previewSize: 'lg',
    },
    {
      title: 'Profile Picture Logo (App Icon)',
      description: 'Squircle iOS/Android app icon with soft elevation shadow',
      variant: 'app-icon',
      key: 'app-icon',
      previewSize: 'md',
    },
    {
      title: 'Logomark (Standalone)',
      description: 'Dual-tone navy & orange hexagon-bulb breakthrough mark',
      variant: 'icon',
      key: 'icon',
      previewSize: 'lg',
    },
    {
      title: 'Simplified Logomark',
      description: 'Single-color solid navy silhouette for monochrome prints',
      variant: 'simplified',
      key: 'simplified',
      previewSize: 'md',
    },
    {
      title: 'Inverted Logomark',
      description: 'High-contrast white emblem on deep navy architectural tile',
      variant: 'inverted',
      key: 'inverted',
      previewSize: 'md',
    },
    {
      title: 'Watermark / Packaging Logo',
      description: 'Semi-transparent watermark for cardboard boxes & warranty seals',
      variant: 'watermark',
      key: 'watermark',
      previewSize: 'md',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0B2545] via-[#102F54] to-[#0B2545] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
              <SolveSpaceLogo variant="icon" size="sm" textColor="#FFFFFF" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  SolveSpace India Brand Kit
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F58220] text-white">
                  Official Standards
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Authentic identity guide, logos, vector marks & packaging assets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Brand Kit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Background switcher toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Layers className="w-4 h-4 text-[#F58220]" />
              <span>Canvas Preview Background:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setBackgroundTheme('light')}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  backgroundTheme === 'light'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Light Canvas
              </button>
              <button
                onClick={() => setBackgroundTheme('dark')}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  backgroundTheme === 'dark'
                    ? 'bg-[#0B2545] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Deep Navy Canvas
              </button>
              <button
                onClick={() => setBackgroundTheme('transparent')}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  backgroundTheme === 'transparent'
                    ? 'bg-slate-200 text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Checkerboard
              </button>
            </div>
          </div>

          {/* Grid of Brand Assets matching IMG_20260901_125608_344.jpg */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {brandAssets.map((asset) => {
              const isDark = backgroundTheme === 'dark';
              const isTransparent = backgroundTheme === 'transparent';

              return (
                <div
                  key={asset.key}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{asset.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{asset.description}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                      {asset.variant}
                    </span>
                  </div>

                  {/* Canvas Preview Area */}
                  <div
                    className={`flex-1 p-6 sm:p-8 flex items-center justify-center min-h-[160px] transition-colors ${
                      isDark
                        ? 'bg-[#0B2545]'
                        : isTransparent
                        ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-50'
                        : 'bg-white'
                    }`}
                  >
                    <SolveSpaceLogo
                      variant={asset.variant}
                      size={asset.previewSize}
                      textColor={isDark ? '#FFFFFF' : '#0B2545'}
                    />
                  </div>

                  {/* Actions */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Vector SVG • Infinite Scaling
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `<SolveSpaceLogo variant="${asset.variant}" size="md" />`,
                          asset.key
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey === asset.key ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied Tag!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Component</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Packaging Box Watermark Preview Section (Matches Kraft Box in Brand Guide) */}
          <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-slate-50 border border-amber-200/80 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300/60 flex items-center justify-center text-amber-800 shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Eco-Kraft Packaging Watermark Standard
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    As featured in the brand guide: every SolveSpace India parcel box is sealed with
                    the signature laser-etched watermark.
                  </p>
                </div>
              </div>

              {/* Sample Stamped Box Replica */}
              <div className="w-full sm:w-auto px-5 py-3.5 bg-[#E8D8C3] border-2 border-[#C9B194] rounded-xl shadow-inner flex items-center justify-center">
                <SolveSpaceLogo variant="watermark" size="sm" />
              </div>
            </div>
          </div>

          {/* Official Brand Palette */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-[#F58220]" />
              <h4 className="text-sm font-extrabold text-slate-900">
                Official Color Hierarchy & Tokens
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {brandColors.map((color) => (
                <div
                  key={color.hex}
                  className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs"
                >
                  <div
                    className={`h-16 p-3 flex flex-col justify-end ${color.textColor}`}
                    style={{ backgroundColor: color.hex }}
                  >
                    <span className="font-mono text-xs font-bold tracking-wider">{color.hex}</span>
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {color.name}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-normal">
                      {color.role}
                    </div>
                    <button
                      onClick={() => copyToClipboard(color.hex, color.hex)}
                      className="mt-2 text-[10px] font-bold text-[#0B2545] hover:text-[#F58220] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedKey === color.hex ? (
                        <span className="text-emerald-600">Copied!</span>
                      ) : (
                        <span>Copy Hex Code</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography Standards */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F58220]">
                Brand Typography
              </span>
              <h5
                className="text-lg font-black text-slate-900 mt-0.5"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Space Grotesk (Primary Wordmark) & Plus Jakarta Sans (Body)
              </h5>
              <p className="text-xs text-slate-500 mt-1">
                Engineered for maximum legibility, high-tech authority, and crisp mobile reading.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/favicon.svg"
                download="solvespace-india-favicon.svg"
                className="px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Favicon SVG</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
