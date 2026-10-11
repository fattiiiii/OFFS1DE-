import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Product, Currency, SleeveOption, JerseySize, getLockedPrice, getProductPrimaryImage, getProductSecondaryImage } from '../types';

interface ProductCardProps {
  product: Product;
  currency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, sleeve: SleeveOption, size: JerseySize) => void;
  onOrderViaWhatsApp: (product: Product, sleeve: SleeveOption, size: JerseySize) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onOrderViaWhatsApp,
  onQuickView,
}) => {
  const [selectedSleeve, setSelectedSleeve] = useState<SleeveOption>(product.defaultSleeve || 'Half-sleeve');
  const [selectedSize, setSelectedSize] = useState<JerseySize>(product.defaultSize || 'L');
  const [addedToast, setAddedToast] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);

  const sizes: JerseySize[] = ['S', 'M', 'L', 'XL', 'XXL'];
  const lockedPrice = getLockedPrice(selectedSleeve);
  const primaryImg = getProductPrimaryImage(product);
  const secondaryImg = getProductSecondaryImage(product);

  const handleAdd = () => {
    onAddToCart(product, selectedSleeve, selectedSize);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1200);
  };

  return (
    <div
      className="flex flex-col bg-white border border-gray-200 hover:border-gray-400 transition-all duration-150"
      onMouseEnter={() => setShowSecondary(true)}
      onMouseLeave={() => setShowSecondary(false)}
    >
      {/* Visual Frame - 4:5 Ratio */}
      <div
        className="relative aspect-[4/5] bg-[#f5f4f0] overflow-hidden cursor-pointer flex items-center justify-center p-3"
        onClick={() => onQuickView(product)}
      >
        {/* Top Left Badge */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-block bg-black text-white text-[9px] font-bold tracking-[0.14em] uppercase px-2 py-0.5 border border-white/10">
              {product.badge}
            </span>
          </div>
        )}

        {/* Top Right Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(String(product.id));
          }}
          aria-label="Add to wishlist"
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-gray-700 hover:text-black hover:scale-105 transition-all cursor-pointer shadow-xs"
        >
          <Heart
            size={14}
            className={isWishlisted ? 'fill-red-600 text-red-600' : 'text-gray-600'}
          />
        </button>

        {/* Garment Image / Male Model Lifestyle view on hover */}
        <img
          src={showSecondary && secondaryImg ? secondaryImg : primaryImg}
          alt={product.name}
          className="w-full h-full object-contain object-center transition-transform duration-300 hover:scale-103"
        />

        {secondaryImg && (
          <div className="absolute bottom-2 right-2 z-10 bg-black/80 backdrop-blur-xs text-[#e8e3d8] text-[8px] uppercase tracking-wider px-1.5 py-0.5 pointer-events-none">
            {showSecondary ? 'Streetwear Fit' : 'Archive Grail'}
          </div>
        )}
      </div>

      {/* Details Area */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Silhouette Tag */}
          {product.silhouetteTag && (
            <span className="block text-[9px] uppercase tracking-[0.15em] font-semibold text-[#8c8275] mb-1">
              {product.silhouetteTag}
            </span>
          )}

          {/* Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-serif font-bold text-xs sm:text-sm text-[#111215] line-clamp-1 hover:text-[#d4af37] transition-colors cursor-pointer mb-2"
          >
            {product.name}
          </h3>

          {/* Locked Exact Price with Primary/Secondary Flip & In Stock */}
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-1.5">
              {currency === 'AED' ? (
                <>
                  <span className="font-serif font-bold text-sm sm:text-base text-[#111215]">
                    AED {lockedPrice.aed}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    / ₹{lockedPrice.inr}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-serif font-bold text-sm sm:text-base text-[#111215]">
                    ₹{lockedPrice.inr}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    / AED {lockedPrice.aed}
                  </span>
                </>
              )}
            </div>

            {product.inStock ? (
              <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#059669]">
                IN STOCK
              </span>
            ) : (
              <span className="text-[9.5px] uppercase font-bold tracking-wider text-red-600">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Sleeve Style Row - Locked Price updates on toggle */}
          <div className="mb-2.5">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-gray-600 mb-1">
              <span>SLEEVE STYLE:</span>
              <span className="text-black">{selectedSleeve.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedSleeve('Half-sleeve')}
                className={`py-1 text-[11px] font-semibold tracking-wide transition-colors cursor-pointer border ${
                  selectedSleeve === 'Half-sleeve'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-black'
                }`}
              >
                Half-sleeve
              </button>
              <button
                type="button"
                onClick={() => setSelectedSleeve('Full-sleeve')}
                className={`py-1 text-[11px] font-semibold tracking-wide transition-colors cursor-pointer border ${
                  selectedSleeve === 'Full-sleeve'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-black'
                }`}
              >
                Full-sleeve
              </button>
            </div>
          </div>

          {/* Size Row */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-gray-600 mb-1">
              <span>SIZE:</span>
              <span className="text-black">{selectedSize}</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`py-1 text-[11px] font-semibold uppercase transition-colors cursor-pointer border ${
                    selectedSize === size
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-800 border-gray-300 hover:border-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons Matching security.md */}
        <div className="space-y-1.5 pt-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={handleAdd}
              className={`py-2 px-2 text-[10.5px] font-bold uppercase tracking-wider transition-all border cursor-pointer text-center rounded-xs ${
                addedToast
                  ? 'bg-[#10b981] text-white border-[#10b981]'
                  : 'bg-[#f5f4f0] hover:bg-[#eae8e2] text-black border-gray-200'
              }`}
            >
              {addedToast ? '✓ IN CART' : '+ ADD TO CART'}
            </button>

            <button
              type="button"
              onClick={() => onOrderViaWhatsApp(product, selectedSleeve, selectedSize)}
              className="py-2 px-2 bg-[#059669] hover:bg-[#047857] text-white text-[10.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer border border-[#059669] text-center rounded-xs"
            >
              ORDER VIA WA
            </button>
          </div>

          <a
            href={`https://instagram.com/Offs1de`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-1.5 px-2 bg-[#0a0a0a] hover:bg-neutral-800 text-[#e8e3d8] hover:text-[#d4af37] text-[10px] font-bold uppercase tracking-[0.14em] transition-colors border border-neutral-800 flex items-center justify-center gap-1.5 rounded-xs"
          >
            <span>ORDER VIA INSTAGRAM @Offs1de.</span>
          </a>
        </div>
      </div>
    </div>
  );
};
