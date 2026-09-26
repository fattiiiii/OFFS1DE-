import React from 'react';

interface BrandManifestoProps {
  onOpenConcierge: (desk: 'uae' | 'india') => void;
}

export const BrandManifesto: React.FC<BrandManifestoProps> = ({ onOpenConcierge }) => {
  return (
    <section id="manifesto" className="bg-[#0f1012] text-white py-14 sm:py-20 px-4 sm:px-8 border-t border-neutral-800">
      <div className="max-w-3xl">
        {/* Label */}
        <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-[#8c8275] mb-3">
          BEYOND ATHLETICS
        </span>

        {/* Heading */}
        <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mb-5 leading-[1.15]">
          Sourced for Collectors, Engineered for Streetwear.
        </h2>

        {/* Paragraph */}
        <p className="text-xs sm:text-sm text-[#dbdad6] font-normal leading-relaxed mb-8 max-w-2xl">
          OFFS1DE eliminates the gap between stadium nostalgia and runway aesthetics. Every jersey is hand-vetted for stitch authenticity, cloth density, and cultural prestige. Order through direct WhatsApp concierge for curated sizing guidance and priority delivery.
        </p>

        {/* Concierge Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => onOpenConcierge('uae')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-black hover:bg-neutral-200 transition-all font-bold text-xs uppercase tracking-[0.12em] cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            <span>UAE CONCIERGE (+971 52 390 1820)</span>
          </button>

          <button
            onClick={() => onOpenConcierge('india')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-black border border-white/40 text-white hover:border-white transition-all font-bold text-xs uppercase tracking-[0.12em] cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            <span>INDIA CONCIERGE (+91 70193 07816)</span>
          </button>
        </div>
      </div>
    </section>
  );
};
