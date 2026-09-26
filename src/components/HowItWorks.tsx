import React from 'react';
import { Shirt, MessageSquare, QrCode, ArrowRight, ShieldCheck } from 'lucide-react';
import { Currency } from '../types';

interface HowItWorksProps {
  currency?: Currency;
  onOpenConcierge?: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  currency = 'AED',
  onOpenConcierge,
}) => {
  return (
    <section id="how-it-works" className="py-16 px-4 sm:px-8 bg-[#0d0e11] text-white border-y border-neutral-800">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-[#d4af37]/30 text-[#d4af37] text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
            <ShieldCheck size={13} />
            <span>SEAMLESS ARCHIVE ORDERING</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#e8e3d8] mb-3">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-[#8c8275] leading-relaxed">
            Acquire deadstock football & sports archive grails in three effortless steps via direct concierge.
          </p>
        </div>

        {/* 3-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="p-6 bg-neutral-900/80 border border-neutral-800 hover:border-[#d4af37]/50 transition-all rounded-xs flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-3xl font-bold text-[#d4af37]/80 group-hover:text-[#d4af37] transition-colors">
                  01
                </span>
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-[#d4af37]">
                  <Shirt size={18} />
                </div>
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                Pick Jersey & Sleeve Style
              </h3>
              <p className="text-xs text-[#8c8275] leading-relaxed mb-4">
                Select your preferred archive drop and choose between Half-sleeve ({currency === 'AED' ? 'AED 35' : '₹650'}) or Full-sleeve ({currency === 'AED' ? 'AED 40' : '₹720'}) locked rates.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-800/80 text-[10px] font-mono text-[#d4af37] uppercase">
              Fixed Rates • Never Converted
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-neutral-900/80 border border-neutral-800 hover:border-[#d4af37]/50 transition-all rounded-xs flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-3xl font-bold text-[#d4af37]/80 group-hover:text-[#d4af37] transition-colors">
                  02
                </span>
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-[#10b981]">
                  <MessageSquare size={18} />
                </div>
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                Click WhatsApp or Instagram
              </h3>
              <p className="text-xs text-[#8c8275] leading-relaxed mb-4">
                Instantly opens a chat with our UAE or India Concierge desk with your exact kit specification, size, and rate pre-filled.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-800/80 text-[10px] font-mono text-[#10b981] uppercase">
              Pre-filled Message • Zero Fees
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-neutral-900/80 border border-neutral-800 hover:border-[#d4af37]/50 transition-all rounded-xs flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-3xl font-bold text-[#d4af37]/80 group-hover:text-[#d4af37] transition-colors">
                  03
                </span>
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-[#d4af37]">
                  <QrCode size={18} />
                </div>
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                Confirm & Courier Dispatch
              </h3>
              <p className="text-xs text-[#8c8275] leading-relaxed mb-4">
                Confirm your fit with our stylist, send payment QR / bank screenshot, and receive your live express tracking invoice.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-800/80 text-[10px] font-mono text-[#d4af37] uppercase">
              Express Air Courier • Tracked
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
