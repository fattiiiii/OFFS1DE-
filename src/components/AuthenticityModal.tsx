import React from 'react';
import { X, ShieldCheck, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthenticityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthenticityModal: React.FC<AuthenticityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white border border-[#111215] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-black"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={18} className="text-[#10b981]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c8275]">
            PROVENANCE & CRAFT
          </span>
        </div>

        <h2 className="font-serif text-2xl font-bold text-[#111215] mb-3">
          The OFFS1DE Authenticity Protocol
        </h2>

        <p className="text-xs text-[#46464b] leading-relaxed mb-6">
          Every kit in the OFFS1DE archive undergoes rigorous triple-stage verification by our vintage matchwear specialists before receiving archive certification.
        </p>

        <div className="space-y-4 text-xs text-[#46464b]">
          <div className="p-4 bg-[#faf9f5] border border-gray-200">
            <div className="flex items-center gap-2 font-bold text-[#111215] uppercase tracking-wider text-[11px] mb-1">
              <CheckCircle2 size={16} className="text-[#10b981]" />
              1. Fabric & GSM Density Audit
            </div>
            <p className="text-gray-600 pl-6 leading-relaxed">
              We verify yarn weight, jacquard weave patterns, collar elasticity, and breathable micro-mesh integrity to guarantee true 90s weight (240–280 GSM).
            </p>
          </div>

          <div className="p-4 bg-[#faf9f5] border border-gray-200">
            <div className="flex items-center gap-2 font-bold text-[#111215] uppercase tracking-wider text-[11px] mb-1">
              <CheckCircle2 size={16} className="text-[#10b981]" />
              2. Crest & Flocking Precision
            </div>
            <p className="text-gray-600 pl-6 leading-relaxed">
              Silicone badges, embroidered shields, and archival felt sponsor transfers are inspected for period-accurate fonts, heat adhesion, and color vibrancy.
            </p>
          </div>

          <div className="p-4 bg-[#faf9f5] border border-gray-200">
            <div className="flex items-center gap-2 font-bold text-[#111215] uppercase tracking-wider text-[11px] mb-1">
              <CheckCircle2 size={16} className="text-[#10b981]" />
              3. Serial Registration & Tagging
            </div>
            <p className="text-gray-600 pl-6 leading-relaxed">
              Each piece is individually recorded with a unique archive serial number and dispatched in a protective archival garment sleeve.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-[#111215] text-white text-xs font-bold uppercase tracking-wider"
        >
          Return to Archive Collection
        </button>
      </div>
    </div>
  );
};
