import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  variant?: 'full' | 'badge' | 'text-only';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  variant = 'full',
}) => {
  const sizeMap = {
    sm: { icon: 34, title: 'text-base', sub: 'text-[9px]' },
    md: { icon: 42, title: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 54, title: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 80, title: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  // SVG representation matching the reference image badge
  const LogoBadge = (
     <img src="images/logo.jpeg" alt="Logo" style={{ height: 36 }} />
  );

  if (variant === 'badge') {
    return <div className={`inline-flex items-center ${className}`}>{LogoBadge}</div>;
  }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {LogoBadge}
      {variant === 'full' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-bold tracking-tight text-[#C8102E] ${currentSize.title}`}>
              Mimis
            </span>
            <span className={`font-bold tracking-wider text-[#1A1A1A] uppercase ${size === 'xl' ? 'text-2xl' : size === 'lg' ? 'text-lg' : 'text-sm'}`}>
              Restaurant
            </span>
          </div>
          {(showTagline || size === 'lg' || size === 'xl') && (
            <span className={`text-[#D4AF37] font-medium italic mt-0.5 tracking-wide ${currentSize.sub}`}>
              Not just by Name.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
