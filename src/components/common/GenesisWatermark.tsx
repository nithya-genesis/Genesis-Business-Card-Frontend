import React from 'react';
import logoImg from '../../assets/genesis-logo.jpg';

interface GenesisWatermarkProps {
  text?: string;
  opacity?: number;
  rotation?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const GenesisWatermark: React.FC<GenesisWatermarkProps> = ({
  opacity = 0.04,
  rotation = 0,
  className = '',
  size = 'lg',
}) => {
  const sizeMap = {
    sm: 'w-48 h-48',
    md: 'w-72 h-72',
    lg: 'w-96 h-96 md:w-[480px] md:h-[480px]',
    xl: 'w-[600px] h-[600px]',
    full: 'w-full h-full max-w-[650px] max-h-[650px]',
  };

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none ${className}`}
      style={{ opacity }}
    >
      <img
        src={logoImg}
        alt="Genesis Brand Watermark"
        className={`${sizeMap[size]} object-contain transform`}
        style={{ transform: `rotate(${rotation}deg)` }}
      />
    </div>
  );
};
