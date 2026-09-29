import React from 'react';
import logoImg from '../../assets/genesis-logo.jpg';

interface GenesisLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'gold';
  showSubtitle?: boolean;
  className?: string;
  imageOnly?: boolean;
}

export const GenesisLogo: React.FC<GenesisLogoProps> = ({
  size = 'md',
  variant = 'dark',
  showSubtitle = true,
  className = '',
  imageOnly = false,
}) => {
  const sizeMap = {
    sm: { emblem: 'w-7 h-7', title: 'text-base', sub: 'text-[9px]' },
    md: { emblem: 'w-9 h-9', title: 'text-lg', sub: 'text-[10px]' },
    lg: { emblem: 'w-11 h-11', title: 'text-xl', sub: 'text-xs' },
    xl: { emblem: 'w-16 h-16', title: 'text-2xl', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  const titleColor = variant === 'light' ? 'text-white' : 'text-neutral-900';
  const subColor = variant === 'light' ? 'text-amber-300' : 'text-amber-700';

  if (imageOnly) {
    return (
      <img
        src={logoImg}
        alt="Genesis Logo"
        className={`${currentSize.emblem} object-contain select-none ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Brand Emblem */}
      <div
        className={`${currentSize.emblem} rounded-xl bg-white border border-neutral-200/80 p-0.5 flex items-center justify-center shadow-xs overflow-hidden flex-shrink-0`}
      >
        <img
          src={logoImg}
          alt="Genesis Official Emblem"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-tight">
        <span className={`font-extrabold tracking-wider ${titleColor} ${currentSize.title}`}>
          GENESIS
        </span>
        {showSubtitle && (
          <span className={`font-semibold tracking-[0.2em] uppercase ${subColor} ${currentSize.sub}`}>
            Training & Placement
          </span>
        )}
      </div>
    </div>
  );
};
