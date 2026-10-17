import React, { useState, useRef } from 'react';
import { Heart } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Product, Currency, SleeveOption, JerseySize, getLockedPrice, getProductPrimaryImage, getProductSecondaryImage, getOriginalImageUrl } from '../types';

gsap.registerPlugin(useGSAP);

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

  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const sizes: JerseySize[] = ['S', 'M', 'L', 'XL', 'XXL'];
  const lockedPrice = getLockedPrice(selectedSleeve);
  const primaryImg = getProductPrimaryImage(product);
  const secondaryImg = getProductSecondaryImage(product);

  const handleAdd = () => {
    onAddToCart(product, selectedSleeve, selectedSize);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1200);
  };

  // GSAP desktop-only hover animation via matchMedia
  useGSAP(
    () => {
      const card = cardRef.current;
      const img = imageRef.current;
      if (!card || !img) return;

      const mm = gsap.matchMedia();

      mm.add('(hover: hover)', () => {
        const onEnter = () => {
          gsap.to(card, {
            y: -5,
            boxShadow: '0 14px 28px -10px rgba(0,0,0,0.12), 0 2px 6px -2px rgba(0,0,0,0.06)',
            borderColor: '#9ca3af',
            duration: 0.35,
            ease: 'power2.out',
          });
          gsap.to(img, {
            scale: 1.04,
            duration: 0.4,
            ease: 'power2.out',
          });
        };

        const onLeave = () => {
          gsap.to(card, {
            y: 0,
            boxShadow: 'none',
            borderColor: '#e5e7eb',
            duration: 0.35,
            ease: 'power2.out',
          });
          gsap.to(img, {
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
          });
        };

        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mouseleave', onLeave);

        return () => {
          card.removeEventListener('mouseenter', onEnter);
          card.removeEventListener('mouseleave', onLeave);
        };
      });
    },
    { scope: cardRef }
  );

  return (
    <div
      ref={cardRef}
      className="product-card-wrapper flex flex-col bg-white border border-gray-200 transition-colors duration-150 rounded-xs overflow-hidden h-full select-none"
      onMouseEnter={() => setShowSecondary(true)}
      onMouseLeave={() => setShowSecondary(false)}
    >
      {/* Visual Frame - 4:5 Ratio Studio Off-White Background (#F1EFE9) */}
      <div
        className="relative aspect-[4/5] overflow-hidden cursor-pointer flex items-center justify-center bg-[#F1EFE9]"
        onClick={() => onQuickView(product)}
        title="Tap to preview high-res & views"
      >
        {/* Top Left Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-block bg-black/90 text-white text-[8px] sm:text-[9px] font-bold tracking-[0.14em] uppercase px-1.5 sm:px-2 py-0.5 border border-white/10 shadow-xs rounded-xs">
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
          className="absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/85 backdrop-blur-xs flex items-center justify-center text-gray-700 hover:text-black hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <Heart
            size={14}
            className={isWishlisted ? 'fill-red-600 text-red-600' : 'text-gray-600'}
          />
        </button>

        {/* Jersey photo with front/back swap on desktop hover */}
        <img
          ref={imageRef}
          src={showSecondary && secondaryImg ? secondaryImg : primaryImg}
          alt={product.name}
          className="w-full h-full object-contain p-2.5 object-center will-change-transform"
          loading="lazy"
          onError={(e) => {
            const current = showSecondary && secondaryImg ? secondaryImg : primaryImg;
            const original = getOriginalImageUrl(current);
            if (e.currentTarget.src !== original) {
              console.warn('[OFFS1DE] ProductCard studio image failed to load, falling back to original:', e.currentTarget.src);
              e.currentTarget.src = original;
            }
          }}
        />

        {secondaryImg && (
          <div className="hidden sm:block absolute bottom-2 right-2 z-10 bg-black/80 backdrop-blur-xs text-[#e8e3d8] text-[8px] uppercase tracking-wider px-1.5 py-0.5 pointer-events-none rounded-xs">
            {showSecondary ? 'Back View' : 'Front View'}
          </div>
        )}
      </div>

      {/* Details Area */}
      <div className="p-2.5 sm:p-3.5 md:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Silhouette Tag */}
          {product.silhouetteTag && (
            <span className="block text-[8px] sm:text-[9px] uppercase tracking-[0.15em] font-semibold text-[#8c8275] mb-0.5 truncate">
              {product.silhouetteTag}
            </span>
          )}

          {/* Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-serif font-bold text-[11px] sm:text-xs md:text-sm text-[#111215] line-clamp-1 hover:text-[#d4af37] transition-colors cursor-pointer mb-1.5"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Locked Exact Price with Primary/Secondary Flip */}
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1 truncate">
              {currency === 'AED' ? (
                <>
                  <span className="font-serif font-bold text-xs sm:text-sm md:text-base text-[#111215]">
                    AED {lockedPrice.aed}
                  </span>
                  <span className="text-[9.5px] sm:text-[10.5px] text-gray-500 font-mono">
                    / ₹{lockedPrice.inr}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-serif font-bold text-xs sm:text-sm md:text-base text-[#111215]">
                    ₹{lockedPrice.inr}
                  </span>
                  <span className="text-[9.5px] sm:text-[10.5px] text-gray-500 font-mono">
                    / AED {lockedPrice.aed}
                  </span>
                </>
              )}
            </div>

            {product.inStock ? (
              <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-[#059669] shrink-0">
                IN STOCK
              </span>
            ) : (
              <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-red-600 shrink-0">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Sleeve Style Row (Tappable >= 40px) */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              <span>SLEEVE:</span>
              <span className="text-[#111215]">{selectedSleeve}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedSleeve('Half-sleeve')}
                className={`min-h-[40px] h-10 px-1 text-[10px] sm:text-[11px] font-semibold tracking-tight transition-colors cursor-pointer border flex items-center justify-center rounded-xs ${
                  selectedSleeve === 'Half-sleeve'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-black active:bg-gray-100'
                }`}
              >
                Half-sleeve
              </button>
              <button
                type="button"
                onClick={() => setSelectedSleeve('Full-sleeve')}
                className={`min-h-[40px] h-10 px-1 text-[10px] sm:text-[11px] font-semibold tracking-tight transition-colors cursor-pointer border flex items-center justify-center rounded-xs ${
                  selectedSleeve === 'Full-sleeve'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-black active:bg-gray-100'
                }`}
              >
                Full-sleeve
              </button>
            </div>
          </div>

          {/* Size Row (Tappable >= 40px) */}
          <div className="mb-2.5">
            <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              <span>SIZE:</span>
              <span className="text-[#111215]">{selectedSize}</span>
            </div>
            <div className="grid grid-cols-5 gap-0.5 sm:gap-1">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-h-[40px] h-10 text-[10px] sm:text-[11px] font-bold uppercase transition-colors cursor-pointer border flex items-center justify-center rounded-xs ${
                    selectedSize === size
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-800 border-gray-300 hover:border-black active:bg-gray-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons (Tappable >= 40px) */}
        <div className="space-y-1 sm:space-y-1.5 pt-1">
          <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={handleAdd}
              className={`min-h-[40px] h-10 px-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all border cursor-pointer text-center rounded-xs flex items-center justify-center ${
                addedToast
                  ? 'bg-[#10b981] text-white border-[#10b981]'
                  : 'bg-[#f5f4f0] hover:bg-[#eae8e2] text-black border-gray-200 active:scale-98'
              }`}
            >
              {addedToast ? '✓ ADDED' : '+ ADD'}
            </button>

            <button
              type="button"
              onClick={() => onOrderViaWhatsApp(product, selectedSleeve, selectedSize)}
              className="min-h-[40px] h-10 px-1 bg-[#059669] hover:bg-[#047857] active:scale-98 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer border border-[#059669] text-center rounded-xs flex items-center justify-center truncate"
            >
              WA ORDER
            </button>
          </div>

          <a
            href="https://instagram.com/Offs1de"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[36px] py-1 px-1 bg-[#0a0a0a] hover:bg-neutral-800 text-[#e8e3d8] hover:text-[#d4af37] text-[8px] sm:text-[9.5px] font-bold uppercase tracking-[0.1em] transition-colors border border-neutral-800 flex items-center justify-center gap-1 rounded-xs truncate active:scale-98"
          >
            <span>ORDER VIA IG @Offs1de.</span>
          </a>
        </div>
      </div>
    </div>
  );
};
