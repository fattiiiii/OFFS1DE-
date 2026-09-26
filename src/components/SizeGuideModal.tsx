import React from 'react';
import { X, Ruler, CheckCircle } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
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
          <Ruler size={18} className="text-[#111215]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c8275]">
            FIT ARCHITECTURE
          </span>
        </div>

        <h2 className="font-serif text-2xl font-bold text-[#111215] mb-3">
          Streetwear & Boxy Cut Sizing Guide
        </h2>

        <p className="text-xs text-[#46464b] leading-relaxed mb-6">
          All OFFS1DE archive pieces are calibrated with authentic 90s proportions: dropped shoulder seams, broader chest dimensions, and relaxed draping designed for streetwear styling.
        </p>

        {/* Measurement Table */}
        <div className="border border-gray-200 mb-6 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#faf9f5] border-b border-gray-200 text-[#111215] font-bold text-[10.5px] uppercase tracking-wider">
              <tr>
                <th className="p-2.5">Size</th>
                <th className="p-2.5">Chest (Pit-to-Pit)</th>
                <th className="p-2.5">Body Length</th>
                <th className="p-2.5">Fit Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              <tr>
                <td className="p-2.5 font-bold text-[#111215]">S</td>
                <td className="p-2.5 font-mono">56 cm / 22.0 in</td>
                <td className="p-2.5 font-mono">72 cm / 28.3 in</td>
                <td className="p-2.5">Relaxed Slim (5'6" – 5'9")</td>
              </tr>
              <tr className="bg-neutral-50/50">
                <td className="p-2.5 font-bold text-[#111215]">M</td>
                <td className="p-2.5 font-mono">59 cm / 23.2 in</td>
                <td className="p-2.5 font-mono">74 cm / 29.1 in</td>
                <td className="p-2.5">Classic Streetwear (5'9" – 5'11")</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-[#111215]">L</td>
                <td className="p-2.5 font-mono">62 cm / 24.4 in</td>
                <td className="p-2.5 font-mono">76 cm / 29.9 in</td>
                <td className="p-2.5">Iconic Oversized (5'11" – 6'2")</td>
              </tr>
              <tr className="bg-neutral-50/50">
                <td className="p-2.5 font-bold text-[#111215]">XL</td>
                <td className="p-2.5 font-mono">65 cm / 25.6 in</td>
                <td className="p-2.5 font-mono">78 cm / 30.7 in</td>
                <td className="p-2.5">Heavyweight Baggy (6'1"+)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-[#111215]">XXL</td>
                <td className="p-2.5 font-mono">68 cm / 26.8 in</td>
                <td className="p-2.5 font-mono">81 cm / 31.9 in</td>
                <td className="p-2.5">Maximum Boxy Silhouette</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Styling Tips */}
        <div className="bg-[#faf9f5] border border-gray-200 p-4 space-y-2 text-xs text-[#46464b]">
          <div className="flex items-start gap-2">
            <CheckCircle size={15} className="text-[#10b981] shrink-0 mt-0.5" />
            <div>
              <b>Hoodie Layering:</b> If you plan to wear your kit over a heavyweight hoodie or crewneck, we recommend taking your true size or 1 size up.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={15} className="text-[#10b981] shrink-0 mt-0.5" />
            <div>
              <b>Concierge Sizing Check:</b> Unsure about your fit? Send your height and weight to our WhatsApp concierge for a personalized fitting confirmation.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-[#111215] text-white text-xs font-bold uppercase tracking-wider"
        >
          Got It, Continue Browsing
        </button>
      </div>
    </div>
  );
};
