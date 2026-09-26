import { Currency, OrderLine, Product, SleeveOption, JerseySize, getLockedPrice } from '../types';

export interface GeoLocationState {
  countryCode: string; // 'AE', 'IN', 'US', 'GB', etc.
  countryName: string;
  detectedCurrency: Currency;
  isUAE: boolean;
  isIndia: boolean;
  primaryPhone: string;
  primaryPhoneDisplay: string;
  secondaryPhone: string;
  secondaryPhoneDisplay: string;
}

export const PHONE_NUMBERS = {
  uae: {
    raw: '+971523901820',
    display: '+971 52 390 1820',
    label: 'UAE & Global Concierge',
    flag: '🇦🇪',
  },
  india: {
    raw: '+917019307816',
    display: '+91 70193 07816',
    label: 'India Domestic Desk',
    flag: '🇮🇳',
  },
};

export const INSTAGRAM_HANDLE = 'Offs1de';
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

const GEO_CACHE_KEY = 'offs1de_geo_cache';

export async function detectUserCountry(): Promise<GeoLocationState> {
  // Check cached detection first
  try {
    const cached = localStorage.getItem(GEO_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.countryCode) {
        return buildGeoState(parsed.countryCode, parsed.countryName || 'Auto-Detected');
      }
    }
  } catch (e) {
    // ignore cache errors
  }

  try {
    // Attempt 1: ipapi.co (reliable, provides country_code and country_name)
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.country_code) {
        const state = buildGeoState(data.country_code, data.country_name || data.country);
        localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ countryCode: data.country_code, countryName: data.country_name }));
        return state;
      }
    }
  } catch {
    // Fallback to next provider
  }

  try {
    // Attempt 2: api.country.is
    const res = await fetch('https://api.country.is', { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      if (data.country) {
        const state = buildGeoState(data.country, data.country);
        localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ countryCode: data.country, countryName: data.country }));
        return state;
      }
    }
  } catch {
    // Fallback to timezone heuristics
  }

  // Fallback: Timezone-based detection
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  if (timeZone.includes('Dubai') || timeZone.includes('Muscat') || timeZone.includes('Asia/Dubai')) {
    return buildGeoState('AE', 'United Arab Emirates');
  } else if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata') || timeZone.includes('India')) {
    return buildGeoState('IN', 'India');
  }

  // Default fallback
  return buildGeoState('AE', 'United Arab Emirates');
}

export function buildGeoState(countryCode: string, countryName: string): GeoLocationState {
  const code = (countryCode || 'AE').toUpperCase();
  const isUAE = code === 'AE';
  const isIndia = code === 'IN';

  let detectedCurrency: Currency = 'AED';
  if (isIndia) {
    detectedCurrency = 'INR';
  } else {
    detectedCurrency = 'AED';
  }

  return {
    countryCode: code,
    countryName: countryName || (isUAE ? 'United Arab Emirates' : isIndia ? 'India' : 'International'),
    detectedCurrency,
    isUAE,
    isIndia,
    primaryPhone: isIndia ? PHONE_NUMBERS.india.raw : PHONE_NUMBERS.uae.raw,
    primaryPhoneDisplay: isIndia ? PHONE_NUMBERS.india.display : PHONE_NUMBERS.uae.display,
    secondaryPhone: isIndia ? PHONE_NUMBERS.uae.raw : PHONE_NUMBERS.india.raw,
    secondaryPhoneDisplay: isIndia ? PHONE_NUMBERS.uae.display : PHONE_NUMBERS.india.display,
  };
}

/**
 * Pre-fills WhatsApp link for a single product order
 */
export function buildProductWhatsAppUrl(
  product: Product,
  sleeve: SleeveOption,
  size: JerseySize,
  currency: Currency,
  targetPhone?: string
): string {
  const locked = getLockedPrice(sleeve);
  const phone = (targetPhone || (currency === 'INR' ? PHONE_NUMBERS.india.raw : PHONE_NUMBERS.uae.raw)).replace(/[^0-9]/g, '');

  const text = `Salam / Hi OFFS1DE Concierge!
I would like to order:
• Product: ${product.name}
• Specification: ${sleeve}, Size: ${size}
• Fixed Price: ${currency === 'AED' ? `AED ${locked.aed} (₹${locked.inr})` : `₹${locked.inr} (AED ${locked.aed})`}

Please confirm availability & dispatch timeline!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Pre-fills WhatsApp link for the entire Bag
 */
export function buildBagWhatsAppUrl(
  items: Array<{ productName: string; sleeve: SleeveOption; size: JerseySize; quantity: number; priceAED: number; priceINR: number }>,
  currency: Currency,
  orderLine: OrderLine,
  customPrint?: string
): string {
  const phoneObj = orderLine === 'india' ? PHONE_NUMBERS.india : PHONE_NUMBERS.uae;
  const phone = phoneObj.raw.replace(/[^0-9]/g, '');

  const itemsList = items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.productName} (${item.sleeve}, Size ${item.size}) x ${item.quantity} — ${
          currency === 'AED'
            ? `AED ${item.priceAED * item.quantity} (₹${item.priceINR * item.quantity})`
            : `₹${item.priceINR * item.quantity} (AED ${item.priceAED * item.quantity})`
        }`
    )
    .join('\n');

  const totalAED = items.reduce((sum, item) => sum + item.priceAED * item.quantity, 0);
  const totalINR = items.reduce((sum, item) => sum + item.priceINR * item.quantity, 0);

  const priceSummary =
    currency === 'AED' ? `AED ${totalAED} (₹${totalINR})` : `₹${totalINR} (AED ${totalAED})`;

  let text = `Salam / Hi OFFS1DE Concierge!\nI would like to complete my archive bag order:\n\n📦 ITEMS IN BAG:\n${itemsList}\n\n`;

  if (customPrint && customPrint.trim()) {
    text += `🏷️ CUSTOM PRINT: ${customPrint.trim()}\n`;
  }

  text += `💰 TOTAL: ${priceSummary}\n`;
  text += `📍 FULFILLMENT DESK: ${phoneObj.label}\n\n`;
  text += `Please send dispatch invoice & delivery confirmation!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Formats price display string with primary / secondary currency switch
 */
export function formatPriceDisplay(sleeve: SleeveOption, primaryCurrency: Currency): {
  primary: string;
  secondary: string;
  combined: string;
} {
  const locked = getLockedPrice(sleeve);
  if (primaryCurrency === 'AED') {
    return {
      primary: `AED ${locked.aed}`,
      secondary: `₹${locked.inr}`,
      combined: `AED ${locked.aed} / ₹${locked.inr}`,
    };
  } else {
    return {
      primary: `₹${locked.inr}`,
      secondary: `AED ${locked.aed}`,
      combined: `₹${locked.inr} / AED ${locked.aed}`,
    };
  }
}
