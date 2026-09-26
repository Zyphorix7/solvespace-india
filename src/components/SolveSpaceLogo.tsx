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
  textColor = '#003B5C',
  subtextColor,
  onClick,
}) => {
  const isWhite = textColor === '#FFFFFF' || textColor?.toLowerCase() === 'white';

  // Responsive height map for logo rendering
  const heightClassMap = {
    xs: 'h-6 sm:h-7',
    sm: 'h-7 sm:h-8',
    md: 'h-9 sm:h-10',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
    '2xl': 'h-24 sm:h-28',
  };

  const iconPxMap = {
    xs: 24,
    sm: 30,
    md: 38,
    lg: 52,
    xl: 72,
    '2xl': 96,
  };

  const px = iconPxMap[size] || 38;

  // Custom Logo URL override if specified in Store settings
  if (customLogoUrl) {
    return (
      <img
        src={customLogoUrl}
        alt="SolveSpace India"
        onClick={onClick}
        referrerPolicy="no-referrer"
        className={`object-contain cursor-pointer ${heightClassMap[size] || 'h-9'} ${className}`}
      />
    );
  }

  // Exact Official SolveSpace Logomark Vector (Matching IMG_20260901_125608_344.jpg)
  const ExactLogomark = ({
    navyColor = '#003B5C',
    orangeColor = '#F58220',
    customSize = px,
  }: {
    navyColor?: string;
    orangeColor?: string;
    customSize?: number;
  }) => (
    <svg
      width={customSize}
      height={customSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
    >
      <g transform="translate(6, 2)">
        {/* 1. Left Hexagon Outer Shell & Bulb Shoulder (Navy) */}
        <path
          d="M38 78L26 66L20 54V32L46 16L58 23"
          stroke={navyColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 2. Orange Bulb Body & Right Hexagon Wall */}
        <path
          d="M62 25L72 32V54L66 66L54 78"
          stroke={orangeColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3. Inner Orange Bulb Contour */}
        <path
          d="M66 52C66 40 58 34 50 34"
          stroke={orangeColor}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* 4. Breakthrough Zigzag Growth Trend Line (Navy) */}
        <path
          d="M23 48L33 58L45 44L56 56L82 20"
          stroke={navyColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 5. Upward Arrowhead (Navy) */}
        <path
          d="M64 20H82V38"
          stroke={navyColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 6. Bulb Socket Base (Navy) */}
        <path
          d="M38 86H54"
          stroke={navyColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M42 93H50"
          stroke={navyColor}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );

  // Exact Flowing Indian Tricolor Wave Flag Ribbon
  const ExactTricolorWave = ({ height = 14 }: { height?: number }) => (
    <svg
      height={height}
      viewBox="0 0 46 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-xs"
    >
      <path
        d="M2 5C10 2 18 8 28 6C34 4.5 40 3 45 2.5C41 6 35 7.5 28 9C18 11 10 5 2 8Z"
        fill="#FF671F"
      />
      <path
        d="M2 8.5C10 5.5 18 11.5 28 9.5C34 8 40 6.5 45 6C41 9.5 35 11 28 12.5C18 14.5 10 8.5 2 11.5Z"
        fill="#FFFFFF"
        stroke="#CBD5E1"
        strokeWidth="0.3"
      />
      <path
        d="M2 12C10 9 18 15 28 13C34 11.5 40 10 45 9.5C41 13 35 14.5 28 16C18 18 10 12 2 15Z"
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
        <ExactLogomark
          navyColor={isWhite ? '#FFFFFF' : '#003B5C'}
          orangeColor="#F58220"
        />
      </div>
    );
  }

  // 2. Profile Picture Logo (App Icon squircle with drop shadow, as on sheet)
  if (variant === 'app-icon') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center bg-white rounded-3xl p-3 sm:p-4 shadow-[0_12px_32px_rgba(0,59,92,0.12)] border border-slate-100 hover:shadow-[0_16px_40px_rgba(0,59,92,0.18)] transition-all cursor-pointer ${className}`}
      >
        <ExactLogomark customSize={px * 1.25} />
      </div>
    );
  }

  // 3. Simplified Single-Tone Navy Logomark (as on bottom center of sheet)
  if (variant === 'simplified') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center cursor-pointer ${className}`}
      >
        <ExactLogomark
          navyColor="#003B5C"
          orangeColor="#003B5C"
        />
      </div>
    );
  }

  // 4. Inverted White Logomark on Navy Square Tile (as on bottom center-right of sheet)
  if (variant === 'inverted') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center bg-[#003B5C] rounded-2xl p-3 shadow-md hover:opacity-95 transition-all cursor-pointer ${className}`}
      >
        <ExactLogomark
          navyColor="#FFFFFF"
          orangeColor="#FFFFFF"
        />
      </div>
    );
  }

  // 5. Watermark / Transparent Packaging Logo (as seen on the box packaging on sheet)
  if (variant === 'watermark') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 opacity-45 hover:opacity-75 transition-opacity select-none ${className}`}
      >
        <ExactLogomark
          navyColor="#475569"
          orangeColor="#475569"
        />
        <div className="flex flex-col leading-none">
          <span className="font-black tracking-tight text-slate-700 text-lg uppercase font-sans">
            SOLVESPACE
          </span>
          <span className="text-[10px] font-extrabold tracking-[0.25em] text-slate-500 uppercase mt-0.5 font-sans">
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
        <ExactLogomark
          customSize={px * 1.15}
          navyColor={isWhite ? '#FFFFFF' : '#003B5C'}
        />
        <div className="mt-2 flex flex-col items-center">
          <span
            className="block font-black tracking-tight text-xl sm:text-2xl font-sans"
            style={{
              color: textColor,
              letterSpacing: '-0.02em',
            }}
          >
            SOLVESPACE
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span
              className="text-xs sm:text-sm font-extrabold tracking-[0.24em] font-sans"
              style={{
                color: subtextColor || (isWhite ? '#CBD5E1' : '#003B5C'),
              }}
            >
              INDIA
            </span>
            <ExactTricolorWave height={12} />
          </div>
        </div>
      </div>
    );
  }

  // 7. Horizontal Logo (Icon + SOLVESPACE only, as in sheet middle)
  if (variant === 'horizontal') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group ${className}`}
      >
        <ExactLogomark
          navyColor={isWhite ? '#FFFFFF' : '#003B5C'}
        />
        <span
          className={`font-black tracking-tight font-sans ${
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
            letterSpacing: '-0.02em',
          }}
        >
          SOLVESPACE
        </span>
      </div>
    );
  }

  // 8. Main Logo (Official exact brand logo from top-center of brand sheet)
  // Renders the exact SVG asset directly
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center cursor-pointer select-none group ${heightClassMap[size] || 'h-9'} ${className}`}
    >
      <img
        src={isWhite ? '/solvespace-logo-white.svg' : '/solvespace-logo.svg'}
        alt="SolveSpace India"
        referrerPolicy="no-referrer"
        className="h-full w-auto object-contain shrink-0"
      />
    </div>
  );
};
