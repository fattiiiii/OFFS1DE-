import React from 'react';
import { ShieldCheck, Package, MessageCircle, Truck } from 'lucide-react';

export const TrustRibbon: React.FC = () => {
  return (
    <div className="w-full bg-[#f5f4f0] border-t border-b border-[#111215]/10 py-6 px-4 sm:px-8">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[#111215] shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111215]">
              Authenticity Verified
            </h4>
            <p className="text-[11px] text-[#46464b]">
              Triple-stage matchwear inspection
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[#111215] shrink-0">
            <Package size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111215]">
              Boxy 90s Cut
            </h4>
            <p className="text-[11px] text-[#46464b]">
              Heavyweight drop-shoulder drape
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[#111215] shrink-0">
            <MessageCircle size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111215]">
              WhatsApp Direct Desk
            </h4>
            <p className="text-[11px] text-[#46464b]">
              Priority personal stylist concierge
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[#111215] shrink-0">
            <Truck size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111215]">
              UAE & India Express
            </h4>
            <p className="text-[11px] text-[#46464b]">
              Insured courier with live tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
