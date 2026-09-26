import React from 'react';
import { ArrowUpRight, Camera, ShieldCheck, Lock } from 'lucide-react';
import { Logo } from './Logo';
import { PHONE_NUMBERS, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../utils/geolocation';

interface FooterProps {
  onOpenConcierge: (desk?: 'uae' | 'india') => void;
  onOpenSizeGuide: () => void;
  onOpenAuthenticity: () => void;
  onSelectCategory?: (cat: any) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenConcierge,
  onOpenSizeGuide,
  onOpenAuthenticity,
  onSelectCategory,
  onOpenAdmin,
}) => {
  const scrollToNewArrivals = () => {
    const el = document.getElementById('new-arrivals');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0a0a0a] text-[#e8e3d8] pt-14 pb-8 px-4 sm:px-8 border-t border-neutral-900">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-neutral-800">
        {/* Col 1: Brand Info */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="mb-5">
              <Logo variant="light" size="md" />
            </div>

            {/* Tagline */}
            <p className="font-serif italic text-sm sm:text-base text-gray-200 mb-3">
              “Every Team. Every Sport. One Drop.”
            </p>

            {/* Blurb */}
            <p className="text-xs text-[#8c8275] leading-relaxed max-w-sm mb-4">
              Curated retro grails, boxy silhouettes, and bespoke archive jerseys engineered for high-fashion streetwear. Direct WhatsApp concierge ordering with expedited global delivery.
            </p>

            {/* Brand Value Pillars */}
            <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider text-[#d4af37]">
              <span className="px-2 py-1 bg-neutral-900 border border-neutral-800">Fixed Archive Rates</span>
              <span className="px-2 py-1 bg-neutral-900 border border-neutral-800">IP Geolocation</span>
              <span className="px-2 py-1 bg-neutral-900 border border-neutral-800">Direct Concierge</span>
            </div>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="md:col-span-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c8275] mb-4">
            QUICK LINKS
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs tracking-wider">
            <li>
              <button
                onClick={scrollToNewArrivals}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                • New Arrivals
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  if (onSelectCategory) onSelectCategory('ALL');
                  scrollToNewArrivals();
                }}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                • Shop All
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenConcierge('uae')}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                • How to Order via WhatsApp
              </button>
            </li>
            <li>
              <button
                onClick={onOpenSizeGuide}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                • Streetwear Size Guide
              </button>
            </li>
            <li>
              <button
                onClick={onOpenAuthenticity}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                • Authenticity Protocol
              </button>
            </li>
            {onOpenAdmin && (
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-[#d4af37] hover:underline transition-colors cursor-pointer flex items-center gap-1 mt-1"
                >
                  <Lock size={12} />
                  <span>• Admin Operations Console</span>
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Col 3: Direct Concierge & Social */}
        <div className="md:col-span-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c8275] mb-1.5">
            DIRECT CONCIERGE & SOCIAL
          </h4>
          <p className="text-[11px] text-[#8c8275] mb-4">
            Connect directly with our stylists for archive inquiries, sizing recommendations, or order placement via WhatsApp and Instagram.
          </p>

          <div className="flex flex-col gap-2">
            {/* WhatsApp UAE Card */}
            <button
              onClick={() => onOpenConcierge('uae')}
              className="w-full flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 hover:border-[#d4af37]/60 transition-all text-left cursor-pointer group rounded-xs"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  <span className="text-xs font-bold tracking-wide text-white">
                    WhatsApp (UAE & Global Desk)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 block pl-3">
                  {PHONE_NUMBERS.uae.display}
                </span>
              </div>
              <ArrowUpRight size={13} className="text-gray-500 group-hover:text-[#d4af37] transition-colors" />
            </button>

            {/* WhatsApp India Card */}
            <button
              onClick={() => onOpenConcierge('india')}
              className="w-full flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 hover:border-[#d4af37]/60 transition-all text-left cursor-pointer group rounded-xs"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  <span className="text-xs font-bold tracking-wide text-white">
                    WhatsApp (India Domestic Desk)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 block pl-3">
                  {PHONE_NUMBERS.india.display}
                </span>
              </div>
              <ArrowUpRight size={13} className="text-gray-500 group-hover:text-[#d4af37] transition-colors" />
            </button>

            {/* Instagram Card */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 hover:border-[#d4af37]/60 transition-all text-left group rounded-xs"
            >
              <div className="flex items-center gap-2">
                <Camera size={13} className="text-[#d4af37]" />
                <div>
                  <span className="text-xs font-bold tracking-wide text-white block">
                    Instagram
                  </span>
                  <span className="text-[10px] text-gray-400">@{INSTAGRAM_HANDLE}</span>
                </div>
              </div>
              <ArrowUpRight size={13} className="text-gray-500 group-hover:text-[#d4af37] transition-colors" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Legal */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[9.5px] tracking-wider text-[#8c8275]">
        <div>
          © 2026 OFFS1DE | Privacy | Terms
        </div>
        <div className="flex items-center gap-2 uppercase font-semibold">
          <span>AUTHENTICITY VERIFIED</span>
          <span>•</span>
          <span>EXPRESS SHIPPING</span>
          <span>•</span>
          <span>CONCIERGE COMMERCE</span>
        </div>
      </div>
    </footer>
  );
};
