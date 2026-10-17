import React, { useState } from 'react';
import { X, MessageCircle, CreditCard, Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem, Currency, OrderLine, toStudioImage, getOriginalImageUrl } from '../types';
import { PHONE_NUMBERS } from '../utils/geolocation';

interface BagPanelProps {
  items: CartItem[];
  currency: Currency;
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, change: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCardCheckout: (customPrint: string, orderLine: OrderLine) => void;
  onWhatsAppCheckout: (customPrint: string, orderLine: OrderLine) => void;
}

export const BagPanel: React.FC<BagPanelProps> = ({
  items,
  currency,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCardCheckout,
  onWhatsAppCheckout,
}) => {
  const [orderLine, setOrderLine] = useState<OrderLine>(currency === 'INR' ? 'india' : 'uae');
  const [customPrint, setCustomPrint] = useState('');

  const totalAED = items.reduce((sum, item) => sum + item.priceAED * item.quantity, 0);
  const totalINR = items.reduce((sum, item) => sum + item.priceINR * item.quantity, 0);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white text-[#111215]">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-gray-200 flex items-start justify-between bg-white sticky top-0 z-10">
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
          className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer rounded-full"
          aria-label="Close Bag"
        >
          <X size={17} />
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto divide-y divide-gray-100">
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-gray-400 mb-3">Your order bag is currently empty.</p>
            <span className="text-[11px] font-mono text-gray-400">Select any kit to configure & add</span>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.cartItemId} className="py-3.5 first:pt-0 last:pb-0 flex gap-3 items-center">
              {/* Thumbnail */}
              <div className="w-14 h-16 bg-[#F1EFE9] shrink-0 border border-gray-200 overflow-hidden flex items-center justify-center p-1">
                <img
                  src={toStudioImage(item.imageUrl)}
                  alt={item.productName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const original = getOriginalImageUrl(item.imageUrl);
                    if (e.currentTarget.src !== original) {
                      console.warn('[OFFS1DE] Bag panel thumbnail studio image failed to load, falling back to original:', e.currentTarget.src);
                      e.currentTarget.src = original;
                    }
                  }}
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="text-xs font-bold text-[#111215] leading-tight truncate">
                    {item.productName}
                  </h4>
                  <button
                    onClick={() => onRemoveItem(item.cartItemId)}
                    className="text-gray-300 hover:text-red-600 transition-colors p-0.5 ml-1 cursor-pointer"
                    title="Remove item"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 my-1">
                  <span className="text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 bg-[#f5f4f0] text-gray-700 rounded-xs">
                    {item.sleeve}
                  </span>
                  <span className="text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 bg-[#f5f4f0] text-gray-700 rounded-xs">
                    Size {item.size}
                  </span>
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
                      className="px-1.5 py-0.5 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="px-1.5 text-xs font-bold text-[#111215] font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                      className="px-1.5 py-0.5 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
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
      <div className="p-4 sm:p-5 border-t border-gray-200 bg-[#faf9f5]">
        {/* Order Line Selector */}
        <div className="mb-3.5">
          <label className="block text-[9.5px] uppercase font-bold tracking-[0.16em] text-gray-600 mb-1.5">
            SELECT FULFILLMENT DESK:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOrderLine('uae')}
              className={`p-2 text-left border rounded-xs transition-all cursor-pointer ${
                orderLine === 'uae'
                  ? 'border-black bg-white ring-1 ring-black'
                  : 'border-gray-200 bg-white/60 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                  orderLine === 'uae' ? 'border-black' : 'border-gray-400'
                }`}>
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
                  ? 'border-black bg-white ring-1 ring-black'
                  : 'border-gray-200 bg-white/60 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                  orderLine === 'india' ? 'border-black' : 'border-gray-400'
                }`}>
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
            className="w-full px-3 py-1.5 bg-white border border-gray-200 text-xs text-[#111215] placeholder-gray-400 focus:outline-none focus:border-black rounded-xs"
          />
        </div>

        {/* Total Estimated Price with Primary / Secondary flip */}
        <div className="flex items-baseline justify-between py-2.5 border-t border-b border-gray-200 mb-3">
          <span className="text-xs uppercase font-bold tracking-wider text-gray-600">
            TOTAL:
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

        {/* Checkout Buttons */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => onWhatsAppCheckout(customPrint, orderLine)}
            className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white font-bold text-[11px] uppercase tracking-[0.12em] flex items-center justify-center gap-2 rounded-xs shadow-xs transition-all cursor-pointer"
          >
            <MessageCircle size={15} className="fill-current" />
            <span>SEND ORDER ON WHATSAPP</span>
          </button>

          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => onCardCheckout(customPrint, orderLine)}
            className="w-full py-2.5 bg-[#111215] hover:bg-black disabled:opacity-50 text-white font-bold text-[11px] uppercase tracking-[0.12em] flex items-center justify-center gap-2 rounded-xs shadow-xs transition-all cursor-pointer"
          >
            <CreditCard size={14} />
            <span>INSTANT CARD PAYMENT</span>
          </button>
        </div>

        <p className="text-[9.5px] text-center text-gray-500 mt-2.5">
          Opens WhatsApp with items pre-filled. Nothing charged here.
        </p>
      </div>
    </div>
  );
};
