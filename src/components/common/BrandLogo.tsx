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
    <svg
      width={currentSize.icon}
      height={currentSize.icon}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-sm select-none"
    >
      {/* Outer circular gold frame */}
      <circle cx="50" cy="50" r="47" stroke="#D4AF37" strokeWidth="2.5" fill="#FFFFFF" />
      <path
        d="M20 70 A42 42 0 0 0 80 70"
        stroke="#D4AF37"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Chef Hat */}
      <path
        d="M34 32 C30 25 35 15 45 18 C48 12 55 12 58 17 C67 15 71 24 67 32 Z"
        fill="#FFFFFF"
        stroke="#1A1A1A"
        strokeWidth="2"
      />
      {/* Chef Hat Band */}
      <path d="M33 32 H68 V36 H33 Z" fill="#C8102E" rx="1" />

      {/* Fork and Spoon */}
      {/* Fork Left */}
      <path d="M22 25 L29 37 M20 22 L24 28 M24 20 L27 27" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" />
      {/* Spoon Right */}
      <ellipse cx="77" cy="24" rx="3.5" ry="5.5" transform="rotate(25 77 24)" fill="#1A1A1A" />
      <path d="M75 28 L69 38" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" />

      {/* Cloche Food Dish at bottom */}
      <path
        d="M32 66 C32 55 68 55 68 66 Z"
        fill="#1A1A1A"
      />
      <circle cx="50" cy="53" r="2.5" fill="#D4AF37" />
      <path d="M28 66 H72" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />

      {/* Cloche Golden steam accent */}
      <circle cx="43" cy="50" r="1" fill="#D4AF37" />
      <circle cx="50" cy="48" r="1.2" fill="#D4AF37" />
      <circle cx="57" cy="50" r="1" fill="#D4AF37" />

      {/* Text "Mimis" stylized in Red */}
      <text
        x="50"
        y="46"
        textAnchor="middle"
        fill="#C8102E"
        fontFamily="'Poppins', sans-serif"
        fontWeight="800"
        fontSize="17"
        fontStyle="italic"
        letterSpacing="-0.5"
      >
        Mimis
      </text>

      {/* Text "RESTAURANT" in Charcoal */}
      <text
        x="50"
        y="53"
        textAnchor="middle"
        fill="#1A1A1A"
        fontFamily="'Poppins', sans-serif"
        fontWeight="700"
        fontSize="5.5"
        letterSpacing="0.8"
      >
        RESTAURANT
      </text>

      {/* Tagline "Not just by Name." */}
      <path id="curve" d="M26 73 Q50 86 74 73" fill="none" stroke="none" />
      <text fill="#1A1A1A" fontSize="4.6" fontStyle="italic" fontWeight="600" fontFamily="'Poppins', sans-serif">
        <textPath href="#curve" startOffset="50%" textAnchor="middle">
          Not just by Name.
        </textPath>
      </text>
    </svg>
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
