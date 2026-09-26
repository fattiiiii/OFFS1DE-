import React from 'react';
import { Currency } from '../types';
import { GeoLocationState, PHONE_NUMBERS, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../utils/geolocation';
import { ShieldCheck, MapPin } from 'lucide-react';

interface TopBarProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onOpenConcierge: (country?: 'uae' | 'india') => void;
  geoState?: GeoLocationState;
  onOpenAdmin?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currency,
  onCurrencyChange,
  onOpenConcierge,
  geoState,
  onOpenAdmin,
}) => {
  return (
    <div className="w-full bg-[#0a0a0a] text-[#e8e3d8] border-b border-neutral-800 text-[10px] sm:text-[10.5px] font-medium py-1.5 px-4 sm:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Concierge Desk Numbers & Location Telemetry */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span className="uppercase font-bold tracking-wider text-[#8c8275] text-[9.5px]">
            DIRECT WHATSAPP CONCIERGE:
          </span>
          <button
            onClick={() => onOpenConcierge('uae')}
            className={`hover:text-[#d4af37] transition-all font-semibold cursor-pointer ${
              currency === 'AED' ? 'text-white underline decoration-[#d4af37]' : 'text-gray-400'
            }`}
          >
            UAE: {PHONE_NUMBERS.uae.display}
          </button>
          <span className="text-neutral-700">|</span>
          <button
            onClick={() => onOpenConcierge('india')}
            className={`hover:text-[#d4af37] transition-all font-semibold cursor-pointer ${
              currency === 'INR' ? 'text-white underline decoration-[#d4af37]' : 'text-gray-400'
            }`}
          >
            INDIA: {PHONE_NUMBERS.india.display}
          </button>

          {geoState && (
            <>
              <span className="text-neutral-700">|</span>
              <span className="inline-flex items-center gap-1 text-[9px] text-[#d4af37] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 font-mono">
                <MapPin size={10} />
                <span>{geoState.countryCode === 'AE' ? '🇦🇪 UAE' : geoState.countryCode === 'IN' ? '🇮🇳 India' : `🌐 ${geoState.countryCode}`}</span>
              </span>
            </>
          )}
        </div>

        {/* Right: Currency switch & Instagram & Admin */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center border border-neutral-700 rounded-xs p-0.5 bg-neutral-900">
            <button
              onClick={() => onCurrencyChange('AED')}
              className={`flex items-center gap-1 px-2 py-0.5 text-[9.5px] uppercase font-bold tracking-wider rounded-xs transition-colors cursor-pointer ${
                currency === 'AED'
                  ? 'bg-[#d4af37] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>🇦🇪</span>
              <span>AED</span>
            </button>
            <button
              onClick={() => onCurrencyChange('INR')}
              className={`flex items-center gap-1 px-2 py-0.5 text-[9.5px] uppercase font-bold tracking-wider rounded-xs transition-colors cursor-pointer ${
                currency === 'INR'
                  ? 'bg-[#d4af37] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>🇮🇳</span>
              <span>₹ INR</span>
            </button>
          </div>

          <span className="text-neutral-700">|</span>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10.5px] font-semibold text-gray-300 hover:text-[#d4af37] transition-colors"
          >
            IG: <span className="font-bold underline decoration-1">@{INSTAGRAM_HANDLE}</span>
          </a>

          {onOpenAdmin && (
            <>
              <span className="text-neutral-700">|</span>
              <button
                onClick={onOpenAdmin}
                className="text-[9px] text-[#8c8275] hover:text-[#d4af37] uppercase tracking-wider font-mono cursor-pointer"
                title="Admin Dashboard Portal"
              >
                ADMIN
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
