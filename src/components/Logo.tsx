import React from 'react';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
}) => {
  const isDark = variant === 'dark';
  const textColor = isDark ? '#000000' : '#ffffff';
  const subtitleColor = isDark ? '#6b7280' : '#9ca3af';

  const badgeDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const titleSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  const subSize = {
    sm: 'text-[7px]',
    md: 'text-[8.5px]',
    lg: 'text-[9.5px]',
    xl: 'text-[11px]',
  }[size];

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 select-none group">
      {/* Official OFFS1DE Streetwear Circular Logo Badge (exact reference logo with '1' matching letter size) */}
      <div
        className={`${badgeDimensions} rounded-full overflow-hidden shrink-0 shadow-xs border ${
          isDark ? 'border-black/20' : 'border-white/20'
        } bg-black flex items-center justify-center transition-transform group-hover:scale-105`}
      >
        <img
          src="/src/assets/images/offs1de_exact_logo_1790411566844.jpg"
          alt="OFFS1DE Streetwear Logo Badge"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Brand Typographic Wordmark: All letters (OFFS1DE) are completely uniform in cap-height, size and weight */}
      <div className="flex flex-col justify-center text-left">
        <span
          className={`font-serif ${titleSize} font-bold tracking-tight leading-none [font-variant-numeric:lining-nums]`}
          style={{ color: textColor }}
        >
          OFFS1DE
        </span>
        {showSubtitle && (
          <span
            className={`font-sans ${subSize} font-bold uppercase tracking-[0.24em] mt-1 leading-none`}
            style={{ color: subtitleColor }}
          >
            STREETWEAR ARCHIVE
          </span>
        )}
      </div>
    </div>
  );
};

export const BubbleLogoGraphic: React.FC<{ color?: string; className?: string }> = ({
  className = 'w-full h-auto',
}) => {
  return (
    <img
      src="/src/assets/images/offs1de_exact_logo_1790411566844.jpg"
      alt="OFFS1DE Streetwear Logo"
      className={`${className} object-contain rounded-md`}
    />
  );
};
