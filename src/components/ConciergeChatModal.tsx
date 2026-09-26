import React, { useState } from 'react';
import { X, MessageCircle, Send, CheckCheck, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { OrderLine } from '../types';

interface ConciergeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDesk?: OrderLine;
  prefilledMessage?: string;
}

export const ConciergeChatModal: React.FC<ConciergeChatModalProps> = ({
  isOpen,
  onClose,
  initialDesk = 'uae',
  prefilledMessage = '',
}) => {
  const [activeDesk, setActiveDesk] = useState<OrderLine>(initialDesk);
  const [inputText, setInputText] = useState(prefilledMessage || '');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'concierge'; text: string; time: string }>>([
    {
      sender: 'concierge',
      text: initialDesk === 'uae'
        ? "Salam & Welcome to OFFS1DE UAE Concierge! I'm Tariq at our Dubai archive hub. Looking for a specific retro kit, sizing advice, or urgent courier dispatch across Emirates?"
        : "Namaste & Welcome to OFFS1DE India Concierge! I'm Kabir at the Mumbai archive desk. Need help with sizing or verifying stock for your vintage piece?",
      time: 'Just now'
    }
  ]);

  if (!isOpen) return null;

  const deskNumber = activeDesk === 'uae' ? '+971 52 390 1820' : '+91 70193 07816';
  const cleanDeskNumber = activeDesk === 'uae' ? '971523901820' : '917019307816';

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg = inputText.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: 'Now' }]);
    setInputText('');

    setTimeout(() => {
      let reply = "Confirmed! That piece is in deadstock condition in our temperature-controlled archive and ready for priority dispatch!";
      if (userMsg.toLowerCase().includes('size') || userMsg.toLowerCase().includes('fit')) {
        reply = "Our jerseys feature authentic 90s boxy silhouettes with dropped shoulders. For a tailored contemporary look, choose your true size; for a relaxed vintage streetwear drape, go 1 size up.";
      } else if (userMsg.toLowerCase().includes('auth') || userMsg.toLowerCase().includes('legit')) {
        reply = "Every piece in the OFFS1DE vault is rigorously verified for authentic badges, era-accurate necktags, fabric weave, and stitch integrity before listing.";
      } else if (userMsg.toLowerCase().includes('delivery') || userMsg.toLowerCase().includes('ship')) {
        reply = activeDesk === 'uae'
          ? "Dubai & Abu Dhabi: Same-day / Next-day express courier. Rest of UAE: 24-48 hours with full live SMS & WhatsApp tracking."
          : "Mumbai: Same-day priority. Pan-India metro express: 2 to 3 days via premium air courier.";
      }

      setMessages((prev) => [...prev, { sender: 'concierge', text: reply, time: 'Now' }]);
    }, 800);
  };

  const handleWhatsAppRedirect = () => {
    const textToSend = inputText.trim() || "Hi OFFS1DE Concierge! I'm browsing your archive drops and would like assistance with an order.";
    const url = `https://wa.me/${cleanDeskNumber}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-[#111215] shadow-2xl flex flex-col h-[580px] max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#111215] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#10b981] flex items-center justify-center text-white">
              <MessageCircle size={18} className="fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider">
                  OFFS1DE Concierge Desk
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] animate-ping"></span>
              </div>
              <span className="text-[10px] text-gray-300 font-mono">
                {deskNumber}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Desk Selector Bar */}
        <div className="grid grid-cols-2 bg-[#faf9f5] border-b border-gray-200 text-xs font-semibold">
          <button
            onClick={() => setActiveDesk('uae')}
            className={`py-2 px-3 text-center border-b-2 transition-all cursor-pointer ${
              activeDesk === 'uae'
                ? 'border-[#111215] text-[#111215] bg-white font-bold'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            🇦🇪 UAE & Global Desk
          </button>
          <button
            onClick={() => setActiveDesk('india')}
            className={`py-2 px-3 text-center border-b-2 transition-all cursor-pointer ${
              activeDesk === 'india'
                ? 'border-[#111215] text-[#111215] bg-white font-bold'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            🇮🇳 India Regional Desk
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f5f4f0]/60">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[82%] px-3.5 py-2.5 text-xs rounded-none shadow-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#111215] text-white'
                    : 'bg-white text-[#111215] border border-gray-200'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-gray-400 mt-1 px-1">
                {msg.time}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-3 py-2 bg-white border-t border-gray-200 flex gap-1.5 overflow-x-auto text-[10px]">
          <button
            onClick={() => setInputText("What is the boxy fit recommendation for size L?")}
            className="whitespace-nowrap px-2.5 py-1 bg-[#faf9f5] border border-gray-200 text-gray-700 hover:border-black"
          >
            Fit & Sizing?
          </button>
          <button
            onClick={() => setInputText("How do you authenticate deadstock vintage kits?")}
            className="whitespace-nowrap px-2.5 py-1 bg-[#faf9f5] border border-gray-200 text-gray-700 hover:border-black"
          >
            Authenticity?
          </button>
          <button
            onClick={() => setInputText("How soon can this reach Dubai / Mumbai?")}
            className="whitespace-nowrap px-2.5 py-1 bg-[#faf9f5] border border-gray-200 text-gray-700 hover:border-black"
          >
            Dispatch Speed?
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your archive inquiry or order request..."
            className="flex-1 text-xs px-3 py-2.5 border border-gray-300 focus:outline-none focus:border-black"
          />
          <button
            onClick={handleSend}
            className="p-2.5 bg-[#111215] hover:bg-black text-white cursor-pointer"
            title="Send in-app message"
          >
            <Send size={15} />
          </button>
          <button
            onClick={handleWhatsAppRedirect}
            className="px-3 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            title="Launch in WhatsApp"
          >
            <MessageCircle size={15} className="fill-current" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
