import React from 'react';
import { Product, Currency, SleeveOption, JerseySize } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  currency: Currency;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, sleeve: SleeveOption, size: JerseySize) => void;
  onOrderViaWhatsApp: (product: Product, sleeve: SleeveOption, size: JerseySize) => void;
  onQuickView: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  currency,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onOrderViaWhatsApp,
  onQuickView,
}) => {
  return (
    <section id="new-arrivals" className="w-full px-4 sm:px-8 py-10 sm:py-14">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-gray-200">
        <div>
          <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#8c8275] mb-1.5">
            CURATED STREETWEAR RELEASES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111215]">
            NEW ARRIVALS
          </h2>
        </div>

        <div className="max-w-md text-left md:text-right">
          <p className="text-xs text-gray-600 leading-relaxed mb-2">
            Limited quantity drops featuring boxy silhouettes, retro grails, and deadstock archive fits. Sleeve & size selection with direct WhatsApp fulfillment.
          </p>
          <div className="flex items-center justify-start md:justify-end gap-1.5 text-xs font-semibold text-[#111215]">
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            <span className="text-[10.5px] uppercase font-bold text-gray-500">REGION VIEW:</span>
            <span className="text-[11px] font-bold">{currency === 'AED' ? 'UAE (AED)' : 'INDIA (INR)'}</span>
          </div>
        </div>
      </div>

      {/* Grid of 6 Products (3 columns on desktop, exactly as in screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {products.slice(0, 6).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currency={currency}
            isWishlisted={wishlist.includes(product.id)}
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
