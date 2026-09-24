import React from 'react';

export type LogoVariant =
  | 'main' // Icon + SOLVESPACE + INDIA with Tricolor wave (Default brand logo)
  | 'horizontal' // Icon + SOLVESPACE
  | 'stacked' // Icon on top, SOLVESPACE center, INDIA with Tricolor below
  | 'icon' // Standalone two-tone logomark
  | 'app-icon' // Squircle profile picture / mobile app icon on white background with shadow
  | 'simplified' // Single-tone solid navy
  | 'inverted' // White logomark on navy square tile
  | 'watermark'; // Monochromatic transparent packaging watermark

export interface SolveSpaceLogoProps {
  className?: string;
  variant?: LogoVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  customLogoUrl?: string | null;
  textColor?: string;
  subtextColor?: string;
  onClick?: () => void;
}

export const SolveSpaceLogo: React.FC<SolveSpaceLogoProps> = ({
  className = '',
  variant = 'main',
  size = 'md',
  customLogoUrl,
  textColor = '#0B2545',
  subtextColor,
  onClick,
}) => {
  if (customLogoUrl) {
    const heightMap = {
      xs: '20px',
      sm: '28px',
      md: '38px',
      lg: '52px',
      xl: '68px',
      '2xl': '88px',
    };
    return (
      <img
        src={customLogoUrl}
        alt="SolveSpace India"
        onClick={onClick}
        className={`object-contain cursor-pointer ${className}`}
        style={{ maxHeight: heightMap[size] || '38px' }}
      />
    );
  }

  // Exact vector icon dimensions
  const iconPxMap = {
    xs: 22,
    sm: 30,
    md: 40,
    lg: 54,
    xl: 72,
    '2xl': 96,
  };

  const px = iconPxMap[size] || 40;

  // The Official SolveSpace India Logomark SVG (Navy Hexagon-Bulb with Breakthrough Zigzag Arrow + Orange Filament & Wall)
  const LogomarkSVG = ({
    primaryColor = '#0B2545',
    secondaryColor = '#F58220',
    baseColor = '#0B2545',
    strokeWidth = 7.5,
    customPx = px,
  }: {
    primaryColor?: string;
    secondaryColor?: string;
    baseColor?: string;
    strokeWidth?: number;
    customPx?: number;
  }) => (
    <svg
      width={customPx}
      height={customPx}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
    >
      {/* 1. Left Hexagon Outer Shell & Bulb Shoulder (Navy) */}
      <path
        d="M44 86L28 72V42L54 20L66 30"
        stroke={primaryColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. Inner Lightning / Growth Zigzag Arrow (Navy) */}
      <path
        d="M34 64L48 52L60 64L98 26"
        stroke={primaryColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3. Arrow Head Pointing North-East (Navy) */}
      <path
        d="M74 24H100V50"
        stroke={primaryColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 4. Right Hexagon Wall (Orange) */}
      <path
        d="M76 86L92 72V46"
        stroke={secondaryColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 5. Orange Bulb Body & Glowing Filament Arch */}
      <path
        d="M76 86C76 72 86 64 86 50C86 42 80 36 72 36"
        stroke={secondaryColor}
        strokeWidth={strokeWidth - 0.5}
        strokeLinecap="round"
      />

      {/* 6. Bulb Base Contact Threads (Navy/Base) */}
      <path
        d="M46 96H74"
        stroke={baseColor}
        strokeWidth={strokeWidth - 0.5}
        strokeLinecap="round"
      />
      <path
        d="M53 105H67"
        stroke={baseColor}
        strokeWidth={strokeWidth - 1}
        strokeLinecap="round"
      />
    </svg>
  );

  // Flowing Indian Tricolor Wave Flag Ribbon
  const TricolorWave = ({ height = 13 }: { height?: number }) => (
    <svg
      height={height}
      viewBox="0 0 46 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-xs"
    >
      {/* Saffron Top Wave Ribbon */}
      <path
        d="M2 3.5C10 0.5 18 6.5 28 4.5C34 3 40 1.5 45 1C41 4.5 35 6 28 7.5C18 9.5 10 3.5 2 6.5Z"
        fill="#FF671F"
      />
      {/* White Middle Wave Ribbon */}
      <path
        d="M2 7C10 4 18 10 28 8C34 6.5 40 5 45 4.5C41 8 35 9.5 28 11C18 13 10 7 2 10Z"
        fill="#FFFFFF"
        stroke="#E2E8F0"
        strokeWidth="0.4"
      />
      {/* India Green Bottom Wave Ribbon */}
      <path
        d="M2 10.5C10 7.5 18 13.5 28 11.5C34 10 40 8.5 45 8C41 11.5 35 13 28 14.5C18 16.5 10 10.5 2 13.5Z"
        fill="#046A38"
      />
    </svg>
  );

  // 1. Icon Only
  if (variant === 'icon') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center cursor-pointer ${className}`}
      >
        <LogomarkSVG />
      </div>
    );
  }

  // 2. Profile Picture Logo (App Icon with white rounded squircle & shadow)
  if (variant === 'app-icon') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center bg-white rounded-3xl p-3 sm:p-4 shadow-[0_12px_32px_rgba(11,37,69,0.12)] border border-slate-100 hover:shadow-[0_16px_40px_rgba(11,37,69,0.18)] transition-all cursor-pointer ${className}`}
      >
        <LogomarkSVG customPx={px * 1.2} />
      </div>
    );
  }

  // 3. Simplified Single-Color Navy Logomark
  if (variant === 'simplified') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center cursor-pointer ${className}`}
      >
        <LogomarkSVG
          primaryColor="#0B2545"
          secondaryColor="#0B2545"
          baseColor="#0B2545"
        />
      </div>
    );
  }

  // 4. Inverted White Logomark on Navy Square Tile
  if (variant === 'inverted') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center bg-[#0B2545] rounded-2xl p-3 shadow-md hover:opacity-95 transition-all cursor-pointer ${className}`}
      >
        <LogomarkSVG
          primaryColor="#FFFFFF"
          secondaryColor="#FFFFFF"
          baseColor="#FFFFFF"
        />
      </div>
    );
  }

  // 5. Watermark / Transparent Packaging Logo (as seen on the box in the sheet)
  if (variant === 'watermark') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 opacity-40 hover:opacity-75 transition-opacity select-none ${className}`}
      >
        <LogomarkSVG
          primaryColor="#475569"
          secondaryColor="#475569"
          baseColor="#475569"
        />
        <div className="flex flex-col leading-none">
          <span
            className="font-extrabold tracking-tight text-slate-600 text-lg uppercase"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            SOLVESPACE
          </span>
          <span
            className="text-[10px] font-black tracking-[0.25em] text-slate-500 uppercase mt-0.5"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            INDIA
          </span>
        </div>
      </div>
    );
  }

  // 6. Stacked Logo (Icon centered on top, SOLVESPACE center, INDIA with Tricolor below)
  if (variant === 'stacked') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex flex-col items-center text-center cursor-pointer select-none group ${className}`}
      >
        <LogomarkSVG customPx={px * 1.1} />
        <div className="mt-2.5 flex flex-col items-center">
          <span
            className="block font-extrabold tracking-tight text-xl sm:text-2xl"
            style={{
              color: textColor,
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            SOLVESPACE
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span
              className="text-xs sm:text-sm font-black tracking-[0.28em]"
              style={{
                color: subtextColor || (textColor === '#FFFFFF' ? '#E2E8F0' : '#0B2545'),
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              INDIA
            </span>
            <TricolorWave height={11} />
          </div>
        </div>
      </div>
    );
  }

  // 7. Horizontal Logo (Icon + SOLVESPACE only)
  if (variant === 'horizontal') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group ${className}`}
      >
        <LogomarkSVG />
        <span
          className={`font-extrabold tracking-tight ${
            size === 'xs'
              ? 'text-sm'
              : size === 'sm'
              ? 'text-base'
              : size === 'md'
              ? 'text-lg sm:text-xl'
              : size === 'lg'
              ? 'text-2xl'
              : 'text-3xl'
          }`}
          style={{
            color: textColor,
            fontFamily: 'Space Grotesk, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          SOLVESPACE
        </span>
      </div>
    );
  }

  // 8. Main Logo (Official brand logo: Icon + SOLVESPACE + INDIA with flowing Tricolor Wave)
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none group ${className}`}
    >
      <LogomarkSVG />
      <div className="flex flex-col leading-none">
        <span
          className={`font-black tracking-tight ${
            size === 'xs'
              ? 'text-sm'
              : size === 'sm'
              ? 'text-base sm:text-lg'
              : size === 'md'
              ? 'text-lg sm:text-xl md:text-2xl'
              : size === 'lg'
              ? 'text-2xl sm:text-3xl'
              : 'text-4xl'
          }`}
          style={{
            color: textColor,
            fontFamily: 'Space Grotesk, sans-serif',
            letterSpacing: '-0.025em',
          }}
        >
          SOLVESPACE
        </span>
        <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5">
          <span
            className={`font-extrabold tracking-[0.28em] ${
              size === 'xs'
                ? 'text-[8px]'
                : size === 'sm'
                ? 'text-[10px]'
                : size === 'md'
                ? 'text-[11px] sm:text-xs'
                : 'text-sm'
            }`}
            style={{
              color: subtextColor || (textColor === '#FFFFFF' ? '#CBD5E1' : '#0B2545'),
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            INDIA
          </span>
          <TricolorWave
            height={size === 'xs' ? 9 : size === 'sm' ? 11 : size === 'md' ? 13 : 16}
          />
        </div>
      </div>
    </div>
  );
};
