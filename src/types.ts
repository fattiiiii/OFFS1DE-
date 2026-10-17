export type Currency = 'AED' | 'INR';

export type SleeveOption = 'Half-sleeve' | 'Full-sleeve';

export type JerseySize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type ProductCategory = 'ALL' | 'FOOTBALL' | 'BASKETBALL' | 'CRICKET' | 'VAULT';

export const LOCKED_PRICING = {
  'Half-sleeve': {
    aed: 35,
    inr: 650,
    display: 'AED 35 / ₹650',
  },
  'Full-sleeve': {
    aed: 40,
    inr: 720,
    display: 'AED 40 / ₹720',
  },
} as const;

export function getLockedPrice(sleeve: SleeveOption) {
  return LOCKED_PRICING[sleeve] || LOCKED_PRICING['Half-sleeve'];
}

export interface Product {
  id: string | number;
  name: string;
  badge?: string;
  badgeStyle?: 'black' | 'red' | 'gold';
  silhouetteTag?: string;
  priceAED?: number;
  priceINR?: number;
  inStock?: boolean;
  category?: ProductCategory;
  imageUrl?: string;
  image?: string | string[];
  images?: string[];
  secondaryImage?: string;
  defaultSleeve?: SleeveOption;
  defaultSize?: JerseySize;
  description?: string;
  fabricDetails?: string;
  measurements?: {
    chest?: string;
    length?: string;
  };
}

/**
 * Automatically transforms jersey links to appear on a clean off-white studio background (#F1EFE9)
 * via Cloudinary background removal and solid background fill.
 * Supports Cloudinary URLs and resolves any local /products/productX paths to Cloudinary studio images.
 */
export function toStudioImage(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim();

  // If a local /products/productX path is passed, map directly to its Cloudinary asset
  const localMatch = trimmed.match(/^\/?(?:src\/assets\/images\/|products\/)(product\d+(?:\.\d+)?)\.jpe?g$/i);
  if (localMatch) {
    trimmed = `https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/${localMatch[1]}.jpg`;
  }

  if (!trimmed.includes('cloudinary.com') || !trimmed.includes('/upload/')) {
    return trimmed;
  }
  if (trimmed.includes('e_background_removal')) {
    return trimmed;
  }

  // Ensure exact target format: /upload/e_background_removal/b_rgb:F1EFE9/f_auto,q_auto/<file>
  return trimmed.replace(
    /\/upload\/(?:f_auto,q_auto\/|f_auto\/q_auto\/)?/,
    '/upload/e_background_removal/b_rgb:F1EFE9/f_auto,q_auto/'
  );
}

/**
 * Reverts a transformed studio image link back to the raw unprocessed original URL.
 * Used for fallback onError handlers to guarantee no broken image icons ever show.
 */
export function getOriginalImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  return url.replace('e_background_removal/b_rgb:F1EFE9/', '');
}

export function getProductPrimaryImage(product: Product): string {
  let raw = '';
  if (product.imageUrl) raw = product.imageUrl;
  else if (Array.isArray(product.image) && product.image.length > 0) raw = product.image[0];
  else if (typeof product.image === 'string') raw = product.image;
  else if (product.images && product.images.length > 0) raw = product.images[0];
  return toStudioImage(raw);
}

export function getProductSecondaryImage(product: Product): string | undefined {
  let raw: string | undefined = undefined;
  if (product.secondaryImage) raw = product.secondaryImage;
  else if (Array.isArray(product.image) && product.image.length > 1) raw = product.image[1];
  else if (product.images && product.images.length > 1) raw = product.images[1];
  return raw ? toStudioImage(raw) : undefined;
}

export function getAllProductImages(product: Product): string[] {
  const list: string[] = [];
  if (product.images && product.images.length > 0) {
    list.push(...product.images);
  } else if (Array.isArray(product.image)) {
    list.push(...product.image);
  } else {
    if (product.imageUrl) list.push(product.imageUrl);
    if (typeof product.image === 'string') list.push(product.image);
  }
  if (product.secondaryImage && !list.includes(product.secondaryImage)) {
    list.push(product.secondaryImage);
  }
  return [...new Set(list)].filter(Boolean).map(toStudioImage);
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  priceAED: number;
  priceINR: number;
  sleeve: SleeveOption;
  size: JerseySize;
  quantity: number;
  imageUrl: string;
  customPrint?: string;
}

export type OrderLine = 'uae' | 'india';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped';

export interface AuditEntry {
  timestamp: string;
  actor: string;
  action: string;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  whatsappNumber: string;
  instagramHandle?: string;
  productNames: string[];
  sleeve: SleeveOption;
  size: JerseySize;
  priceAED: number;
  priceINR: number;
  date: string;
  status: OrderStatus;
  notes?: string;
  auditLog: AuditEntry[];
}

