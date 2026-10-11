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

export function getProductPrimaryImage(product: Product): string {
  if (product.imageUrl) return product.imageUrl;
  if (Array.isArray(product.image) && product.image.length > 0) return product.image[0];
  if (typeof product.image === 'string') return product.image;
  if (product.images && product.images.length > 0) return product.images[0];
  return '';
}

export function getProductSecondaryImage(product: Product): string | undefined {
  if (product.secondaryImage) return product.secondaryImage;
  if (Array.isArray(product.image) && product.image.length > 1) return product.image[1];
  if (product.images && product.images.length > 1) return product.images[1];
  return undefined;
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

