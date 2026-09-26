import React, { useState } from 'react';
import { Camera, MessageCircle, ShoppingBag, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { Currency } from '../types';
import { PHONE_NUMBERS, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../utils/geolocation';

interface NavbarProps {
  cartCount: number;
  currency?: Currency;
  onToggleBag: () => void;
  onSelectCategory?: (category: any) => void;
  onOpenConcierge: (country?: 'uae' | 'india') => void;
  onOpenAuthenticity?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  currency = 'AED',
  onToggleBag,
  onOpenConcierge,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const activeDesk = currency === 'INR' ? 'india' : 'uae';
  const activePhone = currency === 'INR' ? PHONE_NUMBERS.india.display : PHONE_NUMBERS.uae.display;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="cursor-pointer"
        >
          <Logo variant="dark" size="md" />
        </button>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          <button
            onClick={() => scrollToSection('new-arrivals')}
            className="text-xs font-bold tracking-[0.14em] uppercase text-black hover:text-[#d4af37] transition-colors relative py-1 cursor-pointer"
          >
            New Arrivals
          </button>
          <button
            onClick={() => scrollToSection('new-arrivals')}
            className="text-xs font-semibold tracking-[0.14em] uppercase text-gray-700 hover:text-black transition-colors relative py-1 cursor-pointer"
          >
            Vault Drops
          </button>
          <button
            onClick={() => scrollToSection('manifesto')}
            className="text-xs font-semibold tracking-[0.14em] uppercase text-gray-700 hover:text-black transition-colors relative py-1 cursor-pointer"
          >
            About & Manifesto
          </button>
          <button
            onClick={() => onOpenConcierge(activeDesk)}
            className="text-xs font-semibold tracking-[0.14em] uppercase text-gray-700 hover:text-black transition-colors relative py-1 cursor-pointer"
          >
            Concierge
          </button>
        </nav>

        {/* Right Action Icons & Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Instagram Pill Button */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border border-gray-300 rounded-full hover:border-[#d4af37] hover:text-[#d4af37] transition-colors bg-white text-black"
          >
            <Camera size={13} className="text-gray-700" />
            <span>@{INSTAGRAM_HANDLE}</span>
          </a>

          {/* WhatsApp Direct Pill Button */}
          <button
            onClick={() => onOpenConcierge(activeDesk)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-black text-white hover:bg-neutral-800 transition-all rounded-full cursor-pointer border border-neutral-900"
          >
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <MessageCircle size={13} className="text-[#10b981] fill-current" />
            <span className="font-mono text-[10.5px]">{activePhone}</span>
          </button>

          {/* Bag Button with Counter */}
          <button
            onClick={onToggleBag}
            aria-label="Toggle Order Bag"
            className="relative p-2 text-black hover:text-[#d4af37] transition-transform active:scale-95 cursor-pointer ml-1"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white rounded-full text-[9.5px] font-bold flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-black"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-5 py-4 flex flex-col gap-3">
          <button
            onClick={() => scrollToSection('new-arrivals')}
            className="text-left font-bold text-xs uppercase tracking-wider py-1.5"
          >
            New Arrivals
          </button>
          <button
            onClick={() => scrollToSection('new-arrivals')}
            className="text-left font-bold text-xs uppercase tracking-wider py-1.5"
          >
            Vault Drops
          </button>
          <button
            onClick={() => scrollToSection('manifesto')}
            className="text-left font-bold text-xs uppercase tracking-wider py-1.5"
          >
            About & Manifesto
          </button>
          <button
            onClick={() => {
              onOpenConcierge(activeDesk);
              setMobileMenuOpen(false);
            }}
            className="text-left font-bold text-xs uppercase tracking-wider py-1.5 text-[#059669]"
          >
            WhatsApp Concierge ({activePhone})
          </button>
        </div>
      )}
    </header>
  );
};
