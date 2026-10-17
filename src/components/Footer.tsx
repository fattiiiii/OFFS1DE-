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
    <footer className="bg-white text-[#111215] pt-14 pb-8 px-4 sm:px-8 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-gray-200">
        {/* Col 1: Brand Info */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="mb-5">
              <Logo variant="dark" size="md" />
            </div>

            {/* Tagline */}
            <p className="font-serif italic text-sm sm:text-base text-[#111215] mb-3">
              “Every Team. Every Sport. One Drop.”
            </p>

            {/* Blurb */}
            <p className="text-xs text-gray-600 leading-relaxed max-w-sm mb-4">
              Curated retro grails, boxy silhouettes, and bespoke archive jerseys engineered for high-fashion streetwear. Direct WhatsApp concierge ordering with expedited global delivery.
            </p>

            {/* Brand Value Pillars */}
            <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider text-[#111215]">
              <span className="px-2 py-1 bg-[#F1EFE9] border border-gray-200 rounded-xs">Fixed Archive Rates</span>
              <span className="px-2 py-1 bg-[#F1EFE9] border border-gray-200 rounded-xs">IP Geolocation</span>
              <span className="px-2 py-1 bg-[#F1EFE9] border border-gray-200 rounded-xs">Direct Concierge</span>
            </div>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="md:col-span-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">
            QUICK LINKS
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs tracking-wider">
            <li>
              <button
                onClick={scrollToNewArrivals}
                className="text-gray-600 hover:text-black transition-colors cursor-pointer"
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
                className="text-gray-600 hover:text-black transition-colors cursor-pointer"
              >
                • Shop All
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenConcierge('uae')}
                className="text-gray-600 hover:text-black transition-colors cursor-pointer"
              >
                • How to Order via WhatsApp
              </button>
            </li>
            <li>
              <button
                onClick={onOpenSizeGuide}
                className="text-gray-600 hover:text-black transition-colors cursor-pointer"
              >
                • Streetwear Size Guide
              </button>
            </li>
            <li>
              <button
                onClick={onOpenAuthenticity}
                className="text-gray-600 hover:text-black transition-colors cursor-pointer"
              >
                • Authenticity Protocol
              </button>
            </li>
            {onOpenAdmin && (
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-[#d4af37] hover:underline transition-colors cursor-pointer flex items-center gap-1 mt-1 font-semibold"
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
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1.5">
            DIRECT CONCIERGE & SOCIAL
          </h4>
          <p className="text-[11px] text-gray-600 mb-4">
            Connect directly with our stylists for archive inquiries, sizing recommendations, or order placement via WhatsApp and Instagram.
          </p>

          <div className="flex flex-col gap-2">
            {/* WhatsApp UAE Card */}
            <button
              onClick={() => onOpenConcierge('uae')}
              className="w-full flex items-center justify-between p-3 bg-[#F1EFE9] border border-gray-200 hover:border-black/50 transition-all text-left cursor-pointer group rounded-xs"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  <span className="text-xs font-bold tracking-wide text-[#111215]">
                    WhatsApp (UAE & Global Desk)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-600 block pl-3">
                  {PHONE_NUMBERS.uae.display}
                </span>
              </div>
              <ArrowUpRight size={13} className="text-gray-400 group-hover:text-black transition-colors" />
            </button>

            {/* WhatsApp India Card */}
            <button
              onClick={() => onOpenConcierge('india')}
              className="w-full flex items-center justify-between p-3 bg-[#F1EFE9] border border-gray-200 hover:border-black/50 transition-all text-left cursor-pointer group rounded-xs"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  <span className="text-xs font-bold tracking-wide text-[#111215]">
                    WhatsApp (India Domestic Desk)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-600 block pl-3">
                  {PHONE_NUMBERS.india.display}
                </span>
              </div>
              <ArrowUpRight size={13} className="text-gray-400 group-hover:text-black transition-colors" />
            </button>

            {/* Instagram Card */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-3 bg-[#F1EFE9] border border-gray-200 hover:border-black/50 transition-all text-left group rounded-xs"
            >
              <div className="flex items-center gap-2">
                <Camera size={13} className="text-[#d4af37]" />
                <div>
                  <span className="text-xs font-bold tracking-wide text-[#111215] block">
                    Instagram
                  </span>
                  <span className="text-[10px] text-gray-600">@{INSTAGRAM_HANDLE}</span>
                </div>
              </div>
              <ArrowUpRight size={13} className="text-gray-400 group-hover:text-black transition-colors" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Legal */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[9.5px] tracking-wider text-gray-500">
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
