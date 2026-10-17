import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, ShoppingBag, Check } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Product, Currency, SleeveOption, JerseySize, getLockedPrice, getProductPrimaryImage, getAllProductImages, getOriginalImageUrl } from '../types';

gsap.registerPlugin(useGSAP);

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
  const [displayProduct, setDisplayProduct] = useState<Product | null>(product);
  const isOpen = product !== null;

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Keep displayProduct in sync while updating
  useEffect(() => {
    if (product) {
      setDisplayProduct(product);
    }
  }, [product]);

  const activeProduct = displayProduct;
  const primaryImg = activeProduct ? getProductPrimaryImage(activeProduct) : '';
  const allImages = activeProduct ? getAllProductImages(activeProduct) : [];

  const [selectedSleeve, setSelectedSleeve] = useState<SleeveOption>('Half-sleeve');
  const [selectedSize, setSelectedSize] = useState<JerseySize>('L');
  const [activeImg, setActiveImg] = useState<string>('');

  useEffect(() => {
    if (product) {
      setActiveImg(getProductPrimaryImage(product));
      setSelectedSleeve(product.defaultSleeve || 'Half-sleeve');
      setSelectedSize(product.defaultSize || 'L');
    }
  }, [product]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Restore body scroll on unmount cleanup
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // GSAP Entrance & Exit Animations
  useGSAP(
    () => {
      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (containerRef.current) {
        gsap.killTweensOf([containerRef.current, overlayRef.current, panelRef.current]);
      }

      if (isOpen) {
        // Lock body scroll while modal is open
        document.body.style.overflow = 'hidden';

        // Reveal container
        gsap.set(containerRef.current, {
          display: 'flex',
          visibility: 'visible',
          pointerEvents: 'auto',
        });

        if (isReducedMotion) {
          gsap.set(overlayRef.current, { opacity: 1 });
          gsap.set(panelRef.current, { opacity: 1, scale: 1, y: 0 });
          return;
        }

        const tl = gsap.timeline();

        // Overlay fades in
        tl.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );

        // Panel scales and slides up on open
        tl.fromTo(
          panelRef.current,
          { opacity: 0, scale: 0.94, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power3.out' },
          '<'
        );
      } else {
        // Restore body scroll when closed
        document.body.style.overflow = '';

        if (isInitialMount.current) {
          isInitialMount.current = false;
          gsap.set(containerRef.current, {
            display: 'none',
            visibility: 'hidden',
            pointerEvents: 'none',
          });
          gsap.set(overlayRef.current, { opacity: 0 });
          gsap.set(panelRef.current, { opacity: 0, scale: 0.94, y: 30 });
          return;
        }

        if (isReducedMotion) {
          gsap.set(containerRef.current, {
            display: 'none',
            visibility: 'hidden',
            pointerEvents: 'none',
          });
          return;
        }

        const tl = gsap.timeline({
          onComplete: () => {
            if (containerRef.current) {
              gsap.set(containerRef.current, {
                display: 'none',
                visibility: 'hidden',
                pointerEvents: 'none',
              });
            }
          },
        });

        tl.to(panelRef.current, {
          opacity: 0,
          scale: 0.94,
          y: 20,
          duration: 0.3,
          ease: 'power3.in',
        });

        tl.to(
          overlayRef.current,
          { opacity: 0, duration: 0.25, ease: 'power2.in' },
          '<'
        );
      }
    },
    { dependencies: [isOpen], scope: containerRef }
  );

  const sizes: JerseySize[] = ['S', 'M', 'L', 'XL', 'XXL'];
  const lockedPrice = getLockedPrice(selectedSleeve);

  return (
    <div
      ref={containerRef}
      style={{ display: 'none', visibility: 'hidden' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-hidden pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label={activeProduct?.name || 'Quick View'}
    >
      {/* Backdrop overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer opacity-0"
        aria-hidden="true"
      />

      {/* Modal Card Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-4xl bg-white border border-[#111215] shadow-2xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden max-h-[92dvh] sm:max-h-[90vh] rounded-xs pointer-events-auto"
      >
        {/* Close Button (Easy to tap on mobile >= 40px) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-10 h-10 min-h-[40px] rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-gray-700 hover:text-black hover:bg-white shadow-md active:scale-95 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Left: Gallery & Multiple Angles Preview */}
        <div className="w-full md:w-1/2 bg-[#F1EFE9] p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200">
          <div className="relative aspect-[4/4.5] w-full overflow-hidden bg-[#F1EFE9] border border-gray-200 rounded-xs flex items-center justify-center p-3">
            {(activeImg || primaryImg) ? (
              <img
                src={activeImg || primaryImg}
                alt={activeProduct?.name || 'Jersey Preview'}
                className="w-full h-full object-contain object-center transition-all duration-200"
                onError={(e) => {
                  const target = activeImg || primaryImg;
                  const original = getOriginalImageUrl(target);
                  if (e.currentTarget.src !== original) {
                    console.warn('[OFFS1DE] QuickView main studio image failed to load, falling back to original:', e.currentTarget.src);
                    e.currentTarget.src = original;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-[#F1EFE9]" />
            )}

            {/* Status Badge */}
            {activeProduct?.badge && (
              <div className="absolute top-3 left-3">
                <span className="bg-[#111215] text-white text-[9.5px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-xs">
                  {activeProduct.badge}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail switcher (tap to switch front, back, details) */}
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(img)}
                  className={`w-14 h-14 min-w-[56px] border cursor-pointer overflow-hidden rounded-xs shrink-0 transition-all bg-[#F1EFE9] p-1 ${
                    (activeImg || primaryImg) === img
                      ? 'border-[#111215] ring-2 ring-black scale-102'
                      : 'border-gray-300 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View angle ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`View ${idx + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const original = getOriginalImageUrl(img);
                      if (e.currentTarget.src !== original) {
                        console.warn('[OFFS1DE] QuickView thumbnail studio image failed to load, falling back to original:', e.currentTarget.src);
                        e.currentTarget.src = original;
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Technical Specs & Configurator */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              {activeProduct?.silhouetteTag && (
                <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c8275]">
                  {activeProduct.silhouetteTag}
                </span>
              )}
              {activeProduct && (
                <button
                  onClick={() => onToggleWishlist(String(activeProduct.id))}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 cursor-pointer p-1"
                >
                  <Heart size={15} className={isWishlisted ? 'fill-red-600 text-red-600' : ''} />
                  <span>{isWishlisted ? 'Saved' : 'Save'}</span>
                </button>
              )}
            </div>

            <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-[#111215] mb-2 leading-tight">
              {activeProduct?.name || 'Authentic Jersey Drop'}
            </h2>

            {/* Price Row with Primary / Secondary Currency Flip */}
            <div className="flex items-baseline gap-2 pb-3.5 mb-3.5 border-b border-gray-200">
              {currency === 'AED' ? (
                <>
                  <span className="font-serif font-bold text-xl sm:text-2xl text-[#111215]">
                    AED {lockedPrice.aed}
                  </span>
                  <span className="text-sm font-mono text-gray-500">
                    / ₹{lockedPrice.inr}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-serif font-bold text-xl sm:text-2xl text-[#111215]">
                    ₹{lockedPrice.inr}
                  </span>
                  <span className="text-sm font-mono text-gray-500">
                    / AED {lockedPrice.aed}
                  </span>
                </>
              )}
              <span className="ml-auto text-[9.5px] uppercase font-bold tracking-wider text-[#059669] flex items-center gap-1">
                <Check size={12} />
                In Stock & Hand-Inspected
              </span>
            </div>

            {/* Description & Specifications */}
            {activeProduct?.description && (
              <p className="text-xs text-[#46464b] leading-relaxed mb-4">
                {activeProduct.description}
              </p>
            )}

            {(activeProduct?.fabricDetails || activeProduct?.measurements) && (
              <div className="bg-[#faf9f5] border border-gray-200 p-3 mb-4 text-[10.5px] space-y-1 rounded-xs">
                <div className="font-bold text-[#111215] uppercase tracking-wider text-[9.5px]">
                  Archive Specifications:
                </div>
                {activeProduct?.fabricDetails && (
                  <div className="text-gray-600"><b>Composition:</b> {activeProduct.fabricDetails}</div>
                )}
                {activeProduct?.measurements && (
                  <div className="text-gray-600">
                    {activeProduct.measurements.chest && <><b>Chest:</b> {activeProduct.measurements.chest} </>}
                    {activeProduct.measurements.length && <>| <b>Length:</b> {activeProduct.measurements.length}</>}
                  </div>
                )}
              </div>
            )}

            {/* Sleeve Selector (Tappable >= 40px) */}
            <div className="mb-3.5">
              <div className="flex items-center justify-between text-[9.5px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                <span>Sleeve Style:</span>
                <span className="text-black">{selectedSleeve}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSleeve('Half-sleeve')}
                  className={`min-h-[40px] h-10 py-1.5 px-2 text-xs font-bold uppercase tracking-wider border cursor-pointer rounded-xs transition-colors flex items-center justify-center ${
                    selectedSleeve === 'Half-sleeve'
                      ? 'bg-[#111215] text-white border-[#111215]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-black active:bg-gray-100'
                  }`}
                >
                  Half-sleeve (AED 35 / ₹650)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSleeve('Full-sleeve')}
                  className={`min-h-[40px] h-10 py-1.5 px-2 text-xs font-bold uppercase tracking-wider border cursor-pointer rounded-xs transition-colors flex items-center justify-center ${
                    selectedSleeve === 'Full-sleeve'
                      ? 'bg-[#111215] text-white border-[#111215]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-black active:bg-gray-100'
                  }`}
                >
                  Full-sleeve (AED 40 / ₹720)
                </button>
              </div>
            </div>

            {/* Size Selector (Tappable >= 40px) */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[9.5px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                <span>Size:</span>
                <span className="text-black">{selectedSize}</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`min-h-[40px] h-10 py-1 text-xs font-bold uppercase tracking-wider border cursor-pointer rounded-xs transition-colors flex items-center justify-center ${
                      selectedSize === s
                        ? 'bg-[#111215] text-white border-[#111215]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-black active:bg-gray-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTAs (Tappable >= 44px) */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-gray-200 mt-2">
            <button
              onClick={() => {
                if (activeProduct) {
                  onAddToCart(activeProduct, selectedSleeve, selectedSize);
                  onClose();
                }
              }}
              className="min-h-[44px] h-11 py-2 px-3 bg-[#faf9f5] hover:bg-[#edebe4] border border-gray-300 text-[#111215] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer rounded-xs active:scale-98 transition-all"
            >
              <ShoppingBag size={15} />
              <span>+ ADD TO BAG</span>
            </button>

            <button
              onClick={() => {
                if (activeProduct) {
                  onOrderViaWhatsApp(activeProduct, selectedSleeve, selectedSize);
                  onClose();
                }
              }}
              className="min-h-[44px] h-11 py-2 px-3 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs rounded-xs active:scale-98 transition-all"
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
