import React, { useState, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Product, Currency, SleeveOption, JerseySize } from '../types';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ProductGridProps {
  products: Product[];
  currency: Currency;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, sleeve: SleeveOption, size: JerseySize) => void;
  onOrderViaWhatsApp: (product: Product, sleeve: SleeveOption, size: JerseySize) => void;
  onQuickView: (product: Product) => void;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Drops' },
  { id: 'REAL_MADRID', label: 'Real Madrid' },
  { id: 'BARCELONA', label: 'Barcelona' },
  { id: 'MAN_UNITED', label: 'Manchester United' },
  { id: 'VAULT', label: 'Archive & Vault' },
];

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  currency,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onOrderViaWhatsApp,
  onQuickView,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('DEFAULT');

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isInitialScrollRef = useRef(true);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory === 'REAL_MADRID') {
      list = list.filter((p) => p.name.toLowerCase().includes('real madrid'));
    } else if (selectedCategory === 'BARCELONA') {
      list = list.filter((p) => p.name.toLowerCase().includes('barcelona'));
    } else if (selectedCategory === 'MAN_UNITED') {
      list = list.filter((p) => p.name.toLowerCase().includes('manchester united'));
    } else if (selectedCategory === 'VAULT') {
      list = list.filter(
        (p) =>
          p.badge?.includes('GRAIL') ||
          p.badge?.includes('CLASSIC') ||
          p.badge?.includes('FINAL') ||
          p.name.includes('Beckham') ||
          p.name.includes('Santos')
      );
    }

    if (sortBy === 'NAME_ASC') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'NAME_DESC') {
      list.sort((a, b) => b.name.localeCompare(a.name));
    }

    return list;
  }, [products, selectedCategory, sortBy]);

  // Initial scroll-triggered entrance animation with matchMedia for mobile vs desktop & reduced-motion
  useGSAP(
    () => {
      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (isReducedMotion) {
        gsap.set(['.gsap-heading', '.gsap-filter-bar', '.product-card-wrapper'], {
          autoAlpha: 1,
          y: 0,
        });
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(
        {
          isMobile: '(max-width: 767px)',
          isDesktop: '(min-width: 768px)',
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          // 1. Heading & Filter Bar Fade Up
          gsap.fromTo(
            ['.gsap-heading', '.gsap-filter-bar'],
            { autoAlpha: 0, y: isMobile ? 18 : 30 },
            {
              autoAlpha: 1,
              y: 0,
              duration: isMobile ? 0.4 : 0.55,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 88%',
                once: true,
              },
            }
          );

          // 2. Product Cards Scroll Trigger Entrance
          const cardEls = gridRef.current?.querySelectorAll('.product-card-wrapper');
          if (cardEls && cardEls.length > 0) {
            gsap.fromTo(
              cardEls,
              { autoAlpha: 0, y: isMobile ? 25 : 40 },
              {
                autoAlpha: 1,
                y: 0,
                duration: isMobile ? 0.45 : 0.6,
                stagger: isMobile ? 0.05 : 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: gridRef.current,
                  start: 'top 85%',
                  once: true,
                  onEnter: () => {
                    isInitialScrollRef.current = false;
                  },
                },
              }
            );
          }
        }
      );
    },
    { scope: sectionRef }
  );

  // Re-run card entrance animation smoothly when category filter or sort changes
  useGSAP(
    () => {
      // Don't re-animate on initial load before user scrolls into view
      if (isInitialScrollRef.current) return;

      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = window.matchMedia('(max-width: 767px)').matches;

      const cardEls = gridRef.current?.querySelectorAll('.product-card-wrapper');
      if (!cardEls || cardEls.length === 0) return;

      if (isReducedMotion) {
        gsap.set(cardEls, { autoAlpha: 1, y: 0 });
        ScrollTrigger.refresh();
        return;
      }

      gsap.killTweensOf(cardEls);

      gsap.fromTo(
        cardEls,
        { autoAlpha: 0, y: isMobile ? 18 : 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: isMobile ? 0.35 : 0.48,
          stagger: isMobile ? 0.04 : 0.06,
          ease: 'power3.out',
          onComplete: () => {
            ScrollTrigger.refresh();
          },
        }
      );
    },
    { dependencies: [filteredProducts], scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="new-arrivals"
      className="w-full px-2.5 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16"
    >
      {/* Section Header */}
      <div
        ref={headingRef}
        className="gsap-heading flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 mb-5 sm:mb-6 border-b border-gray-200"
      >
        <div>
          <span className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-[#8c8275] mb-1 sm:mb-1.5">
            CURATED STREETWEAR RELEASES
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-[#111215]">
            NEW ARRIVALS
          </h2>
        </div>

        <div className="max-w-md text-left md:text-right">
          <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed mb-2">
            Archive drops & boxy streetwear fits. Sleeve & size selection with direct WhatsApp concierge fulfillment.
          </p>
          <div className="flex items-center justify-start md:justify-end gap-1.5 text-xs font-semibold text-[#111215]">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span className="text-[10px] sm:text-[10.5px] uppercase font-bold text-gray-500">REGION VIEW:</span>
            <span className="text-[10.5px] sm:text-[11px] font-bold">
              {currency === 'AED' ? 'UAE (AED)' : 'INDIA (INR)'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div
        ref={filterBarRef}
        className="gsap-filter-bar flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 sm:mb-8"
      >
        {/* Category Pills (horizontal scroll on mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-2.5 px-2.5 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-xs border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#111215] text-white border-[#111215] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-black active:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 sm:hidden">
            {filteredProducts.length} ITEMS
          </span>

          <div className="relative inline-flex items-center">
            <SlidersHorizontal size={13} className="absolute left-2.5 text-gray-500 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-800 text-[10.5px] sm:text-xs font-semibold pl-7 pr-7 py-1.5 rounded-xs cursor-pointer focus:outline-none focus:border-black transition-colors"
              aria-label="Sort products"
            >
              <option value="DEFAULT">SORT: FEATURED</option>
              <option value="NAME_ASC">NAME: A → Z</option>
              <option value="NAME_DESC">NAME: Z → A</option>
            </select>
            <ChevronDown size={13} className="absolute right-2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid of Products: 2 columns on phones (fits 360px), 3 on tablets, 4 on desktop */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6"
      >
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currency={currency}
            isWishlisted={wishlist.includes(String(product.id))}
            onToggleWishlist={onToggleWishlist}
            onAddToCart={onAddToCart}
            onOrderViaWhatsApp={onOrderViaWhatsApp}
            onQuickView={onQuickView}
          />
        ))}
      </div>
    </section>
  );
};
