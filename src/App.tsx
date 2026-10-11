import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { BrandManifesto } from './components/BrandManifesto';
import { Footer } from './components/Footer';
import { BagPanel } from './components/BagPanel';
import { QuickViewModal } from './components/QuickViewModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { AuthenticityModal } from './components/AuthenticityModal';
import { CardCheckoutModal } from './components/CardCheckoutModal';
import { ConciergeChatModal } from './components/ConciergeChatModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { HowItWorks } from './components/HowItWorks';
import { PRODUCTS, INITIAL_CART_ITEMS } from './data/products';
import { Product, CartItem, Currency, SleeveOption, JerseySize, OrderLine, getLockedPrice, getProductPrimaryImage } from './types';
import { detectUserCountry, GeoLocationState, buildGeoState, buildProductWhatsAppUrl, buildBagWhatsAppUrl } from './utils/geolocation';
import { ShoppingBag } from 'lucide-react';

const STORAGE_KEYS = {
  CART: 'offs1de_cart_v1',
  WISHLIST: 'offs1de_wishlist_v1',
  CURRENCY: 'offs1de_currency_v1',
};

export default function App() {
  // Geolocation state
  const [geoState, setGeoState] = useState<GeoLocationState>(() =>
    buildGeoState('AE', 'United Arab Emirates')
  );

  // Currency with localStorage fallback
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (saved === 'AED' || saved === 'INR') return saved;
    } catch {}
    return 'AED';
  });

  // Cart with localStorage fallback
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_CART_ITEMS;
  });

  // Wishlist with localStorage fallback
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return ['arsenal-03-04'];
  });

  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [isBagOpen, setIsBagOpen] = useState(true);

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isAuthenticityOpen, setIsAuthenticityOpen] = useState(false);
  const [isCardCheckoutOpen, setIsCardCheckoutOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [conciergeDesk, setConciergeDesk] = useState<OrderLine>('uae');
  const [conciergePrefilledMsg, setConciergePrefilledMsg] = useState('');
  const [checkoutCustomPrint, setCheckoutCustomPrint] = useState('');
  const [checkoutOrderLine, setCheckoutOrderLine] = useState<OrderLine>('uae');

  // Client-side Geolocation detection on load
  useEffect(() => {
    let isMounted = true;
    detectUserCountry().then((detected) => {
      if (isMounted) {
        setGeoState(detected);
        // Only set default currency if user hasn't explicitly saved one
        const hasSavedCurrency = localStorage.getItem(STORAGE_KEYS.CURRENCY);
        if (!hasSavedCurrency) {
          setCurrency(detected.detectedCurrency);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // Sync Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  // Handle currency change with persistence
  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, newCurrency);
    } catch {}
  };

  // Cart operations
  const handleAddToCart = (product: Product, sleeve: SleeveOption, size: JerseySize) => {
    const pId = String(product.id);
    const existingIndex = cartItems.findIndex(
      (item) => item.productId === pId && item.sleeve === sleeve && item.size === size
    );

    const locked = getLockedPrice(sleeve);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      const newItem: CartItem = {
        cartItemId: `${pId}-${sleeve}-${size}-${Date.now()}`,
        productId: pId,
        productName: product.name,
        priceAED: locked.aed,
        priceINR: locked.inr,
        sleeve,
        size,
        quantity: 1,
        imageUrl: getProductPrimaryImage(product),
      };
      setCartItems([...cartItems, newItem]);
    }
    setIsBagOpen(true);
  };

  const handleUpdateQuantity = (cartItemId: string, change: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + change;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Direct WhatsApp single item order
  const handleOrderViaWhatsApp = (
    product: Product,
    sleeve: SleeveOption,
    size: JerseySize
  ) => {
    const targetDesk: OrderLine = currency === 'INR' ? 'india' : 'uae';
    const locked = getLockedPrice(sleeve);
    const text = `Salam / Hi OFFS1DE Concierge! I'd like to order:
• ${product.name}
• Specification: ${sleeve}, Size: ${size}
• Fixed Locked Price: ${currency === 'AED' ? `AED ${locked.aed} (₹${locked.inr})` : `₹${locked.inr} (AED ${locked.aed})`}

Please confirm availability & courier dispatch!`;

    setConciergeDesk(targetDesk);
    setConciergePrefilledMsg(text);
    setIsConciergeOpen(true);
  };

  // Bag Checkout via WhatsApp
  const handleBagWhatsAppCheckout = (customPrint: string, orderLine: OrderLine) => {
    const waUrl = buildBagWhatsAppUrl(cartItems, currency, orderLine, customPrint);
    window.open(waUrl, '_blank');
  };

  // Bag Checkout via Card
  const handleBagCardCheckout = (customPrint: string, orderLine: OrderLine) => {
    setCheckoutCustomPrint(customPrint);
    setCheckoutOrderLine(orderLine);
    setIsCardCheckoutOpen(true);
  };

  const handleOpenConcierge = (desk: 'uae' | 'india' = currency === 'INR' ? 'india' : 'uae') => {
    setConciergeDesk(desk);
    setConciergePrefilledMsg('');
    setIsConciergeOpen(true);
  };

  const handleToggleProductStock = (productId: string) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p))
    );
  };

  const totalCartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#1b1c1a] flex relative selection:bg-black selection:text-[#d4af37]">
      {/* Left / Main Site Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Announcement Bar with IP Geolocation & WhatsApp Desk Switch */}
        <TopBar
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          onOpenConcierge={handleOpenConcierge}
          geoState={geoState}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        {/* Main Navigation */}
        <Navbar
          cartCount={totalCartCount}
          currency={currency}
          onToggleBag={() => setIsBagOpen(!isBagOpen)}
          onOpenConcierge={() => handleOpenConcierge(currency === 'INR' ? 'india' : 'uae')}
          onOpenAuthenticity={() => setIsAuthenticityOpen(true)}
        />

        {/* Main Content Sections */}
        <main className="flex-1">
          {/* Hero Banner */}
          <Hero
            onShopClick={() => {
              const el = document.getElementById('new-arrivals');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onWhatsAppOrder={(country) => handleOpenConcierge(country)}
          />

          {/* Curated Streetwear Releases / New Arrivals (6 Cards) */}
          <ProductGrid
            products={productsList}
            currency={currency}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onOrderViaWhatsApp={handleOrderViaWhatsApp}
            onQuickView={setQuickViewProduct}
          />

          {/* 3-Step How It Works Section */}
          <HowItWorks
            currency={currency}
            onOpenConcierge={() => handleOpenConcierge(currency === 'INR' ? 'india' : 'uae')}
          />

          {/* Beyond Athletics Dark Carbon Section */}
          <BrandManifesto onOpenConcierge={handleOpenConcierge} />
        </main>

        {/* Editorial Footer */}
        <Footer
          onOpenConcierge={handleOpenConcierge}
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          onOpenAuthenticity={() => setIsAuthenticityOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      </div>

      {/* Right Column: Docked WhatsApp Order Bag on Desktop */}
      {isBagOpen && (
        <aside className="hidden lg:block w-[340px] xl:w-[380px] shrink-0 border-l border-gray-200 bg-white sticky top-0 h-screen overflow-hidden z-30 shadow-lg">
          <BagPanel
            items={cartItems}
            currency={currency}
            onClose={() => setIsBagOpen(false)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCardCheckout={handleBagCardCheckout}
            onWhatsAppCheckout={handleBagWhatsAppCheckout}
          />
        </aside>
      )}

      {/* Mobile / Tablet Drawer Version (< 1024px) */}
      {isBagOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsBagOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl z-10">
            <BagPanel
              items={cartItems}
              currency={currency}
              onClose={() => setIsBagOpen(false)}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCardCheckout={handleBagCardCheckout}
              onWhatsAppCheckout={handleBagWhatsAppCheckout}
            />
          </div>
        </div>
      )}

      {/* Floating Bag Button when Bag is closed */}
      {!isBagOpen && (
        <button
          onClick={() => setIsBagOpen(true)}
          className="fixed bottom-6 right-6 z-30 bg-[#0a0a0a] text-white p-3.5 shadow-2xl flex items-center gap-2 hover:bg-neutral-800 transition-transform active:scale-95 cursor-pointer rounded-xs border border-[#d4af37]/30"
          aria-label="Open Order Bag"
        >
          <ShoppingBag size={18} className="text-[#d4af37]" />
          <span className="text-xs font-bold uppercase tracking-wider">
            BAG ({totalCartCount})
          </span>
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
        </button>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        currency={currency}
        isWishlisted={quickViewProduct ? wishlist.includes(String(quickViewProduct.id)) : false}
        onClose={() => setQuickViewProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onOrderViaWhatsApp={handleOrderViaWhatsApp}
      />

      {/* Streetwear Sizing Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* Authenticity Protocol Modal */}
      <AuthenticityModal
        isOpen={isAuthenticityOpen}
        onClose={() => setIsAuthenticityOpen(false)}
      />

      {/* Card Checkout Modal */}
      <CardCheckoutModal
        isOpen={isCardCheckoutOpen}
        onClose={() => setIsCardCheckoutOpen(false)}
        items={cartItems}
        currency={currency}
        customPrint={checkoutCustomPrint}
        orderLine={checkoutOrderLine}
        onSuccess={() => setCartItems([])}
      />

      {/* WhatsApp Concierge Live Chat Modal */}
      <ConciergeChatModal
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
        initialDesk={conciergeDesk}
        prefilledMessage={conciergePrefilledMsg}
      />

      {/* Admin Operations & Geolocation Simulator Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={productsList}
        currentGeo={geoState}
        onSimulateGeo={setGeoState}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        onToggleProductStock={handleToggleProductStock}
      />
    </div>
  );
}
