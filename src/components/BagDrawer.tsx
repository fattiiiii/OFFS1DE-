import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, CreditCard, Plus, Minus, Trash2, ShoppingBag, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CartItem, Currency, OrderLine, toStudioImage, getOriginalImageUrl } from '../types';
import { PHONE_NUMBERS } from '../utils/geolocation';

gsap.registerPlugin(useGSAP);

interface BagDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  onUpdateQuantity: (cartItemId: string, change: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCardCheckout: (customPrint: string, orderLine: OrderLine) => void;
  onWhatsAppCheckout: (customPrint: string, orderLine: OrderLine) => void;
}

export const BagDrawer: React.FC<BagDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onCardCheckout,
  onWhatsAppCheckout,
}) => {
  const [orderLine, setOrderLine] = useState<OrderLine>(currency === 'INR' ? 'india' : 'uae');
  const [customPrint, setCustomPrint] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Sync orderLine default when currency changes
  useEffect(() => {
    setOrderLine(currency === 'INR' ? 'india' : 'uae');
  }, [currency]);

  // Handle Escape key to close cart
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

  // GSAP Cart Drawer Animation
  useGSAP(
    () => {
      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Kill running tweens before starting a new animation so rapid clicks do not glitch
      if (containerRef.current) {
        gsap.killTweensOf([
          containerRef.current,
          overlayRef.current,
          panelRef.current,
          '.cart-item',
        ]);
      }

      if (isOpen) {
        // Lock body scroll while cart is open
        document.body.style.overflow = 'hidden';

        // Reveal container and reset transforms
        gsap.set(containerRef.current, {
          display: 'flex',
          visibility: 'visible',
          pointerEvents: 'auto',
        });

        const tl = gsap.timeline();

        // 1. Overlay fades from opacity 0 to 1 (0.3s, power2.out)
        tl.fromTo(
          overlayRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: isReducedMotion ? 0.01 : 0.3,
            ease: 'power2.out',
          }
        );

        // 2. Panel slides in from the right with xPercent 100 to 0 (0.5s, power3.out)
        tl.fromTo(
          panelRef.current,
          { xPercent: 100 },
          {
            xPercent: 0,
            duration: isReducedMotion ? 0.01 : 0.5,
            ease: 'power3.out',
          },
          '<'
        );

        // 3. Cart items inside stagger in with y:20 and opacity:0 to visible (0.4s, stagger 0.08, small delay)
        const cartItemEls = containerRef.current?.querySelectorAll('.cart-item');
        if (cartItemEls && cartItemEls.length > 0) {
          tl.fromTo(
            cartItemEls,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: isReducedMotion ? 0.01 : 0.4,
              stagger: isReducedMotion ? 0 : 0.08,
              ease: 'power2.out',
            },
            '-=0.25'
          );
        }
      } else {
        // Restore body scroll when closed
        document.body.style.overflow = '';

        // If closed on initial mount, hide immediately without animating to prevent any flash
        if (isInitialMount.current) {
          isInitialMount.current = false;
          gsap.set(containerRef.current, {
            display: 'none',
            visibility: 'hidden',
            pointerEvents: 'none',
          });
          gsap.set(panelRef.current, { xPercent: 100 });
          gsap.set(overlayRef.current, { opacity: 0 });
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

        // Panel slides back to xPercent 100 (0.4s, power3.in)
        tl.to(panelRef.current, {
          xPercent: 100,
          duration: isReducedMotion ? 0.01 : 0.4,
          ease: 'power3.in',
        });

        // Overlay fades out (0.3s, power2.in)
        tl.to(
          overlayRef.current,
          {
            opacity: 0,
            duration: isReducedMotion ? 0.01 : 0.3,
            ease: 'power2.in',
          },
          '<'
        );
      }
    },
    { dependencies: [isOpen], scope: containerRef }
  );

  const totalAED = items.reduce((sum, item) => sum + item.priceAED * item.quantity, 0);
  const totalINR = items.reduce((sum, item) => sum + item.priceINR * item.quantity, 0);

  return (
    <div
      ref={containerRef}
      style={{ display: 'none', visibility: 'hidden' }}
      className="fixed inset-0 z-50 overflow-hidden flex justify-end pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
    >
      {/* Dark Blur Overlay (fades from opacity 0 to 1) */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer opacity-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel (slides from xPercent 100 to 0) */}
      <aside
        ref={panelRef}
        style={{ transform: 'translateX(100%)' }}
        className="relative w-full max-w-[440px] sm:w-[420px] md:w-[440px] bg-white h-full shadow-[ -12px_0_36px_rgba(0,0,0,0.22)] z-10 flex flex-col justify-between overflow-hidden border-l border-gray-200 pointer-events-auto"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-start justify-between bg-white sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
              <h2 className="text-xs sm:text-sm font-bold tracking-[0.16em] uppercase text-[#111215] font-serif">
                WHATSAPP ORDER BAG
              </h2>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Instant dispatch & archive concierge desk
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer rounded-full"
            aria-label="Close Bag"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#f5f4f0] flex items-center justify-center text-gray-400 mb-3 border border-gray-200">
                <ShoppingBag size={24} />
              </div>
              <h3 className="font-serif font-bold text-sm text-[#111215] mb-1">
                Your archive bag is empty
              </h3>
              <p className="text-xs text-gray-500 mb-5 max-w-[220px]">
                Explore retro grails and select your sleeve style to order.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#111215] hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
              >
                EXPLORE RELEASES
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.cartItemId || index}
                className="cart-item py-3.5 first:pt-0 last:pb-0 flex gap-3.5 items-center overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="w-16 h-20 bg-[#F1EFE9] shrink-0 border border-gray-200 overflow-hidden rounded-xs flex items-center justify-center p-1">
                  <img
                    src={toStudioImage(item.imageUrl)}
                    alt={item.productName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const original = getOriginalImageUrl(item.imageUrl);
                      if (e.currentTarget.src !== original) {
                        console.warn('[OFFS1DE] Bag drawer thumbnail studio image failed to load, falling back to original:', e.currentTarget.src);
                        e.currentTarget.src = original;
                      }
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs font-bold text-[#111215] leading-snug truncate">
                      {item.productName}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="text-gray-300 hover:text-red-600 transition-colors p-1 cursor-pointer"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 my-1.5">
                    <span className="text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 bg-[#f5f4f0] text-gray-700 rounded-xs">
                      {item.sleeve}
                    </span>
                    <span className="text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 bg-[#f5f4f0] text-gray-700 rounded-xs">
                      Size {item.size}
                    </span>
                    {item.customPrint && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#d4af37]/15 text-[#856404] rounded-xs border border-[#d4af37]/30">
                        Print: {item.customPrint}
                      </span>
                    )}
                  </div>

                  {/* Price & Quantity Controls */}
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="text-xs font-serif font-bold text-[#111215]">
                      {currency === 'AED' ? (
                        <>
                          AED {item.priceAED * item.quantity}{' '}
                          <span className="font-sans font-normal text-[10.5px] text-gray-500">
                            / ₹{item.priceINR * item.quantity}
                          </span>
                        </>
                      ) : (
                        <>
                          ₹{item.priceINR * item.quantity}{' '}
                          <span className="font-sans font-normal text-[10.5px] text-gray-500">
                            / AED {item.priceAED * item.quantity}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center border border-gray-300 bg-white rounded-xs">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="px-2 text-xs font-bold text-[#111215] font-mono min-w-[18px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Configuration & Checkout Section */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-200 bg-[#faf9f5]">
            {/* Fulfillment Desk Selector */}
            <div className="mb-3">
              <label className="block text-[9.5px] uppercase font-bold tracking-[0.16em] text-gray-600 mb-1.5">
                SELECT FULFILLMENT DESK:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderLine('uae')}
                  className={`p-2 text-left border rounded-xs transition-all cursor-pointer ${
                    orderLine === 'uae'
                      ? 'border-black bg-white ring-1 ring-black shadow-xs'
                      : 'border-gray-200 bg-white/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div
                      className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                        orderLine === 'uae' ? 'border-black' : 'border-gray-400'
                      }`}
                    >
                      {orderLine === 'uae' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                    <span className="text-[11px] font-bold text-[#111215]">UAE & Global</span>
                  </div>
                  <span className="text-[9.5px] font-mono text-gray-500 block pl-4.5">
                    {PHONE_NUMBERS.uae.display}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderLine('india')}
                  className={`p-2 text-left border rounded-xs transition-all cursor-pointer ${
                    orderLine === 'india'
                      ? 'border-black bg-white ring-1 ring-black shadow-xs'
                      : 'border-gray-200 bg-white/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div
                      className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                        orderLine === 'india' ? 'border-black' : 'border-gray-400'
                      }`}
                    >
                      {orderLine === 'india' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                    <span className="text-[11px] font-bold text-[#111215]">India Desk</span>
                  </div>
                  <span className="text-[9.5px] font-mono text-gray-500 block pl-4.5">
                    {PHONE_NUMBERS.india.display}
                  </span>
                </button>
              </div>
            </div>

            {/* Optional Custom Printing */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Optional Name / Number Print (e.g. HENRY 14)"
                value={customPrint}
                onChange={(e) => setCustomPrint(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-gray-200 text-xs text-[#111215] placeholder-gray-400 focus:outline-none focus:border-black rounded-xs transition-colors"
              />
            </div>

            {/* Total Estimated Price with Primary / Secondary Currency Flip */}
            <div className="flex items-baseline justify-between py-2.5 border-t border-b border-gray-200 mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-600">
                BAG TOTAL:
              </span>
              <div className="text-sm sm:text-base font-serif font-bold text-[#111215]">
                {currency === 'AED' ? (
                  <>
                    AED {totalAED}{' '}
                    <span className="font-sans font-normal text-xs text-gray-500">
                      / ₹{totalINR}
                    </span>
                  </>
                ) : (
                  <>
                    ₹{totalINR}{' '}
                    <span className="font-sans font-normal text-xs text-gray-500">
                      / AED {totalAED}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Checkout Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => onWhatsAppCheckout(customPrint, orderLine)}
                className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white font-bold text-[11px] uppercase tracking-[0.12em] flex items-center justify-center gap-2 rounded-xs shadow-xs transition-all cursor-pointer hover:shadow-md"
              >
                <MessageCircle size={15} className="fill-current" />
                <span>SEND ORDER ON WHATSAPP</span>
              </button>

              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => onCardCheckout(customPrint, orderLine)}
                className="w-full py-2.5 bg-[#111215] hover:bg-black disabled:opacity-50 text-white font-bold text-[11px] uppercase tracking-[0.12em] flex items-center justify-center gap-2 rounded-xs shadow-xs transition-all cursor-pointer hover:shadow-md"
              >
                <CreditCard size={14} />
                <span>INSTANT CARD PAYMENT</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[9.5px] text-gray-500">
              <ShieldCheck size={12} className="text-[#059669]" />
              <span>Direct concierge fulfillment • Nothing charged here</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
