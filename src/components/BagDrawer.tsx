import React, { useState } from 'react';
import { X, MessageCircle, CreditCard, Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem, Currency, OrderLine } from '../types';

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
  const [orderLine, setOrderLine] = useState<OrderLine>('uae');

  const totalAED = items.reduce((sum, item) => sum + item.priceAED * item.quantity, 0);
  const totalINR = items.reduce((sum, item) => sum + item.priceINR * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto border-l border-[#111215]/15 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-[#111215]/10 flex items-start justify-between bg-white sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
              <h2 className="text-sm font-bold tracking-[0.16em] uppercase text-[#111215]">
                WHATSAPP ORDER BAG
              </h2>
            </div>
            <p className="text-[11px] text-[#46464b] mt-0.5">
              Instant dispatch & archive concierge desk
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
            aria-label="Close Bag"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-5 overflow-y-auto divide-y divide-[#111215]/10">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-500 mb-4">Your archive bag is currently empty.</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#111215] text-white text-xs font-bold uppercase tracking-wider"
              >
                Explore Grails
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartItemId} className="py-4 first:pt-0 last:pb-0 flex gap-3.5 items-start">
                {/* Thumbnail */}
                <div className="w-16 h-20 bg-[#f5f4f0] shrink-0 border border-gray-200 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover object-center"
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
                      className="text-gray-400 hover:text-red-600 transition-colors p-0.5"
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Badges / Options */}
                  <div className="flex flex-wrap gap-1.5 my-1.5">
                    <span className="text-[9.5px] uppercase font-semibold tracking-wider px-1.5 py-0.5 bg-[#f5f4f0] border border-gray-200 text-[#46464b]">
                      {item.sleeve}
                    </span>
                    <span className="text-[9.5px] uppercase font-semibold tracking-wider px-1.5 py-0.5 bg-[#f5f4f0] border border-gray-200 text-[#46464b]">
                      Size {item.size}
                    </span>
                  </div>

                  {/* Price & Quantity Controls */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs font-serif font-bold text-[#111215]">
                      AED {item.priceAED * item.quantity} <span className="font-sans font-normal text-[11px] text-gray-500">/ ₹{item.priceINR * item.quantity}</span>
                    </div>

                    <div className="flex items-center border border-gray-300 bg-white">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="px-2 text-xs font-bold text-[#111215] font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={11} />
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
          <div className="p-5 border-t border-[#111215]/10 bg-[#faf9f5]">
            {/* Order Line Selector */}
            <div className="mb-4">
              <label className="block text-[10px] uppercase font-bold tracking-[0.16em] text-[#46464b] mb-1.5">
                SELECT ORDER LINE:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderLine('uae')}
                  className={`p-2 text-left border transition-all cursor-pointer ${
                    orderLine === 'uae'
                      ? 'border-[#111215] bg-white ring-1 ring-[#111215]'
                      : 'border-gray-200 bg-white/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                      orderLine === 'uae' ? 'border-[#111215]' : 'border-gray-400'
                    }`}>
                      {orderLine === 'uae' && <div className="w-1.5 h-1.5 rounded-full bg-[#111215]" />}
                    </div>
                    <span className="text-[11px] font-bold text-[#111215]">UAE & Global</span>
                  </div>
                  <span className="text-[9.5px] font-mono text-gray-600 block pl-4.5">
                    +971 52 390 1820
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderLine('india')}
                  className={`p-2 text-left border transition-all cursor-pointer ${
                    orderLine === 'india'
                      ? 'border-[#111215] bg-white ring-1 ring-[#111215]'
                      : 'border-gray-200 bg-white/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                      orderLine === 'india' ? 'border-[#111215]' : 'border-gray-400'
                    }`}>
                      {orderLine === 'india' && <div className="w-1.5 h-1.5 rounded-full bg-[#111215]" />}
                    </div>
                    <span className="text-[11px] font-bold text-[#111215]">India Desk</span>
                  </div>
                  <span className="text-[9.5px] font-mono text-gray-600 block pl-4.5">
                    +91 70193 07816
                  </span>
                </button>
              </div>
            </div>

            {/* Total Estimated Price */}
            <div className="flex items-baseline justify-between py-3 border-t border-b border-[#111215]/10 mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-[#46464b]">
                ESTIMATED BAG TOTAL:
              </span>
              <div className="text-base font-serif font-bold text-[#111215]">
                AED {totalAED} <span className="font-sans font-normal text-xs text-gray-500">/ ₹{totalINR}</span>
              </div>
            </div>

            {/* Checkout Buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onWhatsAppCheckout('', orderLine)}
                className="w-full py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs uppercase tracking-[0.14em] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle size={16} className="fill-current" />
                <span>CHECKOUT VIA WHATSAPP CONCIERGE</span>
              </button>

              <button
                type="button"
                onClick={() => onCardCheckout('', orderLine)}
                className="w-full py-3 bg-[#111215] hover:bg-black text-white font-bold text-xs uppercase tracking-[0.14em] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <CreditCard size={15} />
                <span>INSTANT CARD PAYMENT</span>
              </button>
            </div>

            <p className="text-[10px] text-center text-[#76777b] mt-3">
              Doorstep tracking & instant personal invoice provided upon order dispatch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
