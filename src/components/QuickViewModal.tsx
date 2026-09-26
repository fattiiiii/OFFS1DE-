import React, { useState } from 'react';
import { X, Heart, ShieldCheck, Sparkles, MessageCircle, ShoppingBag } from 'lucide-react';
import { Product, Currency, SleeveOption, JerseySize, getLockedPrice } from '../types';

interface QuickViewModalProps {
  product: Product | null;
  currency: Currency;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product, sleeve: SleeveOption, size: JerseySize, customPrint?: string) => void;
  onOrderViaWhatsApp: (product: Product, sleeve: SleeveOption, size: JerseySize, customPrint?: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  currency,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onOrderViaWhatsApp,
}) => {
  if (!product) return null;

  const [selectedSleeve, setSelectedSleeve] = useState<SleeveOption>(product.defaultSleeve);
  const [selectedSize, setSelectedSize] = useState<JerseySize>(product.defaultSize);
  const [activeImg, setActiveImg] = useState<string>(product.imageUrl);

  const sizes: JerseySize[] = ['S', 'M', 'L', 'XL', 'XXL'];
  const lockedPrice = getLockedPrice(selectedSleeve);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-[#111215] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-700 hover:text-black hover:bg-white shadow-xs"
        >
          <X size={18} />
        </button>

        {/* Left: Gallery & Mockup Preview */}
        <div className="md:w-1/2 bg-[#f5f4f0] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200">
          <div className="relative aspect-[4/4.5] w-full overflow-hidden bg-white/60 border border-gray-200">
            <img
              src={activeImg}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />

            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <span className="bg-[#111215] text-white text-[10px] font-bold tracking-[0.16em] uppercase px-2.5 py-1">
                {product.badge}
              </span>
            </div>
          </div>

          {/* Thumbnail row if secondary image exists */}
          {product.secondaryImage && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setActiveImg(product.imageUrl)}
                className={`w-14 h-14 border cursor-pointer overflow-hidden ${
                  activeImg === product.imageUrl ? 'border-[#111215] ring-1 ring-black' : 'border-gray-300 opacity-70'
                }`}
              >
                <img src={product.imageUrl} alt="Flatlay" className="w-full h-full object-cover" />
              </button>
              <button
                onClick={() => setActiveImg(product.secondaryImage!)}
                className={`w-14 h-14 border cursor-pointer overflow-hidden ${
                  activeImg === product.secondaryImage ? 'border-[#111215] ring-1 ring-black' : 'border-gray-300 opacity-70'
                }`}
              >
                <img src={product.secondaryImage} alt="Streetwear Fit" className="w-full h-full object-cover" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Technical Specs & Configurator */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c8275]">
                {product.silhouetteTag}
              </span>
              <button
                onClick={() => onToggleWishlist(product.id)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600"
              >
                <Heart size={15} className={isWishlisted ? 'fill-red-600 text-red-600' : ''} />
                <span>{isWishlisted ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111215] mb-2 leading-tight">
              {product.name}
            </h2>

            {/* Locked Price Row with Primary / Secondary Currency Flip */}
            <div className="flex items-baseline gap-2 pb-4 mb-4 border-b border-gray-200">
              {currency === 'AED' ? (
                <>
                  <span className="font-serif font-bold text-2xl text-[#111215]">
                    AED {lockedPrice.aed}
                  </span>
                  <span className="text-sm font-mono text-gray-500">
                    / ₹{lockedPrice.inr}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-serif font-bold text-2xl text-[#111215]">
                    ₹{lockedPrice.inr}
                  </span>
                  <span className="text-sm font-mono text-gray-500">
                    / AED {lockedPrice.aed}
                  </span>
                </>
              )}
              <span className="ml-auto text-[10px] uppercase font-bold tracking-wider text-[#059669] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                In Stock & Hand-Inspected
              </span>
            </div>

            {/* Description & Fabric Specs */}
            <p className="text-xs text-[#46464b] leading-relaxed mb-4">
              {product.description}
            </p>

            <div className="bg-[#faf9f5] border border-gray-200 p-3 mb-5 text-[11px] space-y-1">
              <div className="font-bold text-[#111215] uppercase tracking-wider text-[10px]">
                Archive Specifications:
              </div>
              <div className="text-gray-600"><b>Composition:</b> {product.fabricDetails}</div>
              <div className="text-gray-600"><b>Chest / Pit-to-Pit:</b> {product.measurements.chest} | <b>Length:</b> {product.measurements.length}</div>
            </div>

            {/* Sleeve Selector - Updates Locked Price */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#46464b] mb-1.5">
                <span>Sleeve Style:</span>
                <span className="text-[#111215]">{selectedSleeve}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSleeve('Half-sleeve')}
                  className={`py-2 text-xs font-bold uppercase tracking-wider border cursor-pointer ${
                    selectedSleeve === 'Half-sleeve'
                      ? 'bg-[#111215] text-white border-[#111215]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                  }`}
                >
                  Half-sleeve (AED 35 / ₹650)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSleeve('Full-sleeve')}
                  className={`py-2 text-xs font-bold uppercase tracking-wider border cursor-pointer ${
                    selectedSleeve === 'Full-sleeve'
                      ? 'bg-[#111215] text-white border-[#111215]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                  }`}
                >
                  Full-sleeve (AED 40 / ₹720)
                </button>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#46464b] mb-1.5">
                <span>Size:</span>
                <span className="text-[#111215]">{selectedSize}</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`py-2 text-xs font-bold uppercase tracking-wider border cursor-pointer ${
                      selectedSize === s
                        ? 'bg-[#111215] text-white border-[#111215]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                onAddToCart(product, selectedSleeve, selectedSize);
                onClose();
              }}
              className="py-3 bg-[#faf9f5] hover:bg-[#edebe4] border border-gray-300 text-[#111215] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag size={15} />
              <span>+ ADD TO BAG</span>
            </button>

            <button
              onClick={() => {
                onOrderViaWhatsApp(product, selectedSleeve, selectedSize);
                onClose();
              }}
              className="py-3 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MessageCircle size={15} className="fill-current" />
              <span>ORDER VIA WA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

