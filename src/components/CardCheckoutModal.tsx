import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { CartItem, Currency, OrderLine } from '../types';

interface CardCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  customPrint: string;
  orderLine: OrderLine;
  onSuccess: () => void;
}

export const CardCheckoutModal: React.FC<CardCheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  customPrint,
  orderLine,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: 'Fatima N.',
    email: 'fatimanagarmat@gmail.com',
    phone: orderLine === 'uae' ? '+971 52 390 1820' : '+91 70193 07816',
    address: 'Downtown Boulevard, Residence Tower 4, Apt 1802',
    city: orderLine === 'uae' ? 'Dubai' : 'Mumbai',
    country: orderLine === 'uae' ? 'United Arab Emirates' : 'India',
    cardNumber: '•••• •••• •••• 4242',
    exp: '08/28',
    cvc: '888',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [orderRef, setOrderRef] = useState('');

  const totalAED = items.reduce((sum, item) => sum + item.priceAED * item.quantity, 0);
  const totalINR = items.reduce((sum, item) => sum + item.priceINR * item.quantity, 0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      const randomRef = `OFF-${Math.floor(100000 + Math.random() * 900000)}-${orderLine === 'uae' ? 'DXB' : 'BOM'}`;
      setOrderRef(randomRef);
      onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-[#111215] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-[#faf9f5]">
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-[#111215]" />
            <h3 className="font-bold text-xs uppercase tracking-[0.16em] text-[#111215]">
              Instant Secure Checkout
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isCompleted ? (
          <div className="p-6 sm:p-8 text-center flex-1 flex flex-col items-center justify-center">
            <CheckCircle2 size={48} className="text-[#10b981] mb-4" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8c8275] mb-1">
              Order Confirmed
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#111215] mb-2">
              Payment Authorized
            </h2>
            <div className="bg-[#faf9f5] border border-gray-200 p-3 my-4 w-full text-center">
              <span className="text-[10px] text-gray-500 uppercase font-mono block">Order Reference:</span>
              <span className="text-base font-bold font-mono text-[#111215]">{orderRef}</span>
            </div>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Your pieces have been allocated from the archive. Personal WhatsApp dispatch tracking and digital invoice are being sent to <b>{formData.phone}</b>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <a
                href={`https://wa.me/${orderLine === 'uae' ? '971523901820' : '917019307816'}?text=${encodeURIComponent(
                  `Hi OFFS1DE Concierge! I just completed order ${orderRef}. Could you please send my dispatch status?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold uppercase tracking-wider text-center"
              >
                Track via WhatsApp
              </a>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#111215] text-white text-xs font-bold uppercase tracking-wider"
              >
                Return to Archive
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {/* Order Review Snippet */}
            <div className="bg-[#faf9f5] p-3 border border-gray-200 text-xs">
              <div className="flex justify-between items-center mb-1 font-bold text-[#111215]">
                <span>{items.length} Archive Item(s)</span>
                <span>AED {totalAED} / ₹{totalINR}</span>
              </div>
              {customPrint && (
                <div className="text-[11px] text-[#46464b] border-t border-gray-200 pt-1 mt-1 font-mono">
                  Custom Flocking: <b>{customPrint}</b>
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#46464b] mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 focus:outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#46464b] mb-1">
                  WhatsApp / Phone
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-300 focus:outline-none focus:border-black font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#46464b] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#46464b] mb-1">
                Delivery Address
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 focus:outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#46464b] mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#46464b] mb-1">
                  Country
                </label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Mock Card Details */}
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#46464b] mb-2 flex items-center justify-between">
                <span>Payment Card</span>
                <span className="flex items-center gap-1 text-[9px] text-[#059669]">
                  <ShieldCheck size={11} /> 256-Bit Encrypted
                </span>
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-300 font-mono tracking-wider pl-9 focus:outline-none focus:border-black"
                  />
                  <CreditCard size={15} className="absolute left-3 top-3 text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={formData.exp}
                    onChange={(e) => setFormData({ ...formData, exp: e.target.value })}
                    className="text-xs p-2.5 border border-gray-300 font-mono text-center focus:outline-none focus:border-black"
                    placeholder="MM/YY"
                  />
                  <input
                    type="text"
                    required
                    value={formData.cvc}
                    onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
                    className="text-xs p-2.5 border border-gray-300 font-mono text-center focus:outline-none focus:border-black"
                    placeholder="CVC"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-[#111215] hover:bg-black text-white text-xs font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {isProcessing ? (
                <span>Authorizing Payment...</span>
              ) : (
                <>
                  <span>Pay AED {totalAED} (₹{totalINR})</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
