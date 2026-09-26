import React from 'react';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

interface HeroProps {
  onShopClick: () => void;
  onWhatsAppOrder: (country: 'uae' | 'india') => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick, onWhatsAppOrder }) => {
  return (
    <section className="relative w-full min-h-[580px] lg:min-h-[660px] flex items-center bg-[#0d0e11] overflow-hidden">
      {/* Background Image: Model wearing OFFS1DE jersey and baggy plain black pants standing in the UAE */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/offs1de_uae_plain_pants_1790412305506.jpg"
          alt="Streetwear model in sunglasses wearing oversized black OFFS1DE jersey and baggy plain black pants in UAE setting"
          className="w-full h-full object-cover object-[78%_center] sm:object-[85%_center] md:object-[90%_center] opacity-95 contrast-105 brightness-100 filter"
        />

        {/* Cinematic Gradient Overlay: Dark on left for text legibility, clear on right for model */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e11] via-[#0d0e11]/85 sm:via-[#0d0e11]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e11]/60 via-transparent to-black/20" />
      </div>

      {/* Content Container (Left-aligned) */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 py-16 lg:py-24 w-full">
        <div className="max-w-xl lg:max-w-2xl">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-white/90">
              RETRO GRAILS • OVERSIZED KITS • ARCHIVE DROPS • STREETWEAR
            </span>
          </div>

          {/* Large Editorial Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tight leading-[1.08] mb-6">
            Every Team. Every<br />
            Sport. One Drop.
          </h1>

          {/* Subtext with UAE & India Delivery */}
          <p className="text-xs sm:text-sm text-gray-200 font-normal leading-relaxed mb-8 max-w-lg drop-shadow-xs">
            Curated retro grails, boxy silhouettes & deadstock archive drops engineered for modern streetwear. Order seamlessly via WhatsApp with priority delivery across UAE & India.
          </p>

          {/* CTA Buttons: 'EXPLORE ARCHIVE' & WhatsApp CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              onClick={onShopClick}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-[#111215] font-bold text-xs sm:text-sm uppercase tracking-[0.14em] hover:bg-neutral-100 transition-all shadow-md group cursor-pointer"
            >
              <span>EXPLORE ARCHIVE</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onWhatsAppOrder('uae')}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm uppercase tracking-[0.14em] transition-all shadow-md cursor-pointer"
            >
              <MessageCircle size={17} className="fill-current" />
              <span>ORDER VIA WHATSAPP (UAE)</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
