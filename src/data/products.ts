import { Product, LOCKED_PRICING } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'chicago-bulls-96',
    name: '1996 Chicago Bulls Championship 23 Jersey',
    badge: 'ARCHIVE GRAIL',
    badgeStyle: 'black',
    silhouetteTag: 'OVERSIZED BOXY SILHOUETTE',
    priceAED: LOCKED_PRICING['Half-sleeve'].aed,
    priceINR: LOCKED_PRICING['Half-sleeve'].inr,
    inStock: true,
    category: 'BASKETBALL',
    imageUrl: '/src/assets/images/germany_jersey_1790403103997.jpg',
    secondaryImage: '/src/assets/images/male_model_jersey_1790404001362.jpg',
    defaultSleeve: 'Half-sleeve',
    defaultSize: 'L',
    description: 'Iconic 1996 legacy piece re-engineered in heavyweight drop-shoulder fabric with vintage geometric graphics. Male-focused oversized streetwear fit.',
    fabricDetails: '260 GSM Heavy Breathable Mesh, 100% Cotton Rib Trims, Vintage Pre-washed Flocking',
    measurements: { chest: '64 cm', length: '78 cm' }
  },
  {
    id: 'arsenal-03-04',
    name: "Arsenal 03/04 Invincibles Gold Kit",
    badge: 'NEW DROP',
    badgeStyle: 'black',
    silhouetteTag: 'VINTAGE METALLIC JACQUARD',
    priceAED: LOCKED_PRICING['Full-sleeve'].aed,
    priceINR: LOCKED_PRICING['Full-sleeve'].inr,
    inStock: true,
    category: 'FOOTBALL',
    imageUrl: '/src/assets/images/arsenal_gold_1790403118072.jpg',
    secondaryImage: '/src/assets/images/hero_male_model_1790403978668.jpg',
    defaultSleeve: 'Full-sleeve',
    defaultSize: 'L',
    description: 'The golden zenith of the unbeaten Gunners campaign. Metallic jacquard knit with navy geometric zigzag pattern. Worn baggy or layered.',
    fabricDetails: '240 GSM Engineered Jacquard Poly, Raised Heat-Transfer Badging, Double Knit Collar',
    measurements: { chest: '62 cm', length: '76 cm' }
  },
  {
    id: 'mumbai-india-99',
    name: "Mumbai & India '99 Retro Cricket Jersey",
    badge: 'LIMITED EDITION',
    badgeStyle: 'black',
    silhouetteTag: '90S HEAVYWEIGHT DROP-SHOULDER',
    priceAED: LOCKED_PRICING['Half-sleeve'].aed,
    priceINR: LOCKED_PRICING['Half-sleeve'].inr,
    inStock: true,
    category: 'CRICKET',
    imageUrl: '/src/assets/images/india_cricket_1790403135152.jpg',
    secondaryImage: '/src/assets/images/male_model_jersey_1790404001362.jpg',
    defaultSleeve: 'Half-sleeve',
    defaultSize: 'M',
    description: 'The definitive 1999 World Cup geometric stripe aesthetic. Custom drop-shoulder streetwear cut with ribbed collar modeled on authentic male street styling.',
    fabricDetails: '270 GSM Interlock Double Weave, Sublimated Retro Geometric Stripe, Cotton Poly Blend',
    measurements: { chest: '60 cm', length: '74 cm' }
  },
  {
    id: 'lakers-bryant-8',
    name: 'LA Lakers 2000 Bryant #8 Black Edition',
    badge: 'ICONIC VAULT',
    badgeStyle: 'black',
    silhouetteTag: 'TRIPLE-BLACK RELAXED CUT',
    priceAED: LOCKED_PRICING['Half-sleeve'].aed,
    priceINR: LOCKED_PRICING['Half-sleeve'].inr,
    inStock: true,
    category: 'BASKETBALL',
    imageUrl: '/src/assets/images/lakers_black_1790403151452.jpg',
    secondaryImage: '/src/assets/images/hero_male_model_1790403978668.jpg',
    defaultSleeve: 'Half-sleeve',
    defaultSize: 'XL',
    description: 'Black Mamba era tribute in blackout tactical twill. Direct embroidered #8 backplate with oversized drop hem for layering.',
    fabricDetails: '280 GSM Matte Triple-Black Mesh, Dense Satin Twill Lettering, Heritage Gold Trim',
    measurements: { chest: '66 cm', length: '80 cm' }
  },
  {
    id: 'venezia-24-25',
    name: 'Venezia FC 24/25 Monogram Pitch Jersey',
    badge: 'OVERSIZED FIT',
    badgeStyle: 'black',
    silhouetteTag: 'RUNWAY MONOGRAM JACQUARD',
    priceAED: LOCKED_PRICING['Full-sleeve'].aed,
    priceINR: LOCKED_PRICING['Full-sleeve'].inr,
    inStock: true,
    category: 'FOOTBALL',
    imageUrl: '/src/assets/images/venezia_jersey_1790403170075.jpg',
    secondaryImage: '/src/assets/images/male_model_jersey_1790404001362.jpg',
    defaultSleeve: 'Full-sleeve',
    defaultSize: 'L',
    description: 'The intersection of Venetian high-fashion tailoring and pitch culture. Micro-jacquard gold crest with bespoke sleeve ribbing.',
    fabricDetails: '250 GSM Luxury Jacquard Weave, Gilded Metallic Threading, Tailored Rib Cuffs',
    measurements: { chest: '63 cm', length: '77 cm' }
  },
  {
    id: 'sydney-03-cricket',
    name: 'Sydney 2003 Classic Cricket Strip',
    badge: 'EXCLUSIVE RESTOCK',
    badgeStyle: 'black',
    silhouetteTag: 'VINTAGE COLORBLOCKED COTTON-BLEND',
    priceAED: LOCKED_PRICING['Half-sleeve'].aed,
    priceINR: LOCKED_PRICING['Half-sleeve'].inr,
    inStock: true,
    category: 'CRICKET',
    imageUrl: '/src/assets/images/sydney_jersey_1790403184019.jpg',
    secondaryImage: '/src/assets/images/hero_male_model_1790403978668.jpg',
    defaultSleeve: 'Half-sleeve',
    defaultSize: 'M',
    description: 'Tri-nation 2003 era colorblocked collector piece. Breathable micro-pique with vintage sponsor patch and reinforced shoulders.',
    fabricDetails: '260 GSM Pique Cotton-Poly Hybrid, Embroidered Retro Emblem, Contrast Rib Piping',
    measurements: { chest: '59 cm', length: '73 cm' }
  }
];

export const INITIAL_CART_ITEMS = [
  {
    cartItemId: 'item-arsenal-invincibles',
    productId: 'arsenal-03-04',
    productName: "Arsenal 03/04 Invincibles Gold Kit",
    priceAED: LOCKED_PRICING['Full-sleeve'].aed, // 40
    priceINR: LOCKED_PRICING['Full-sleeve'].inr, // 720
    sleeve: 'Full-sleeve' as const,
    size: 'L' as const,
    quantity: 1,
    imageUrl: '/src/assets/images/arsenal_gold_1790403118072.jpg'
  },
  {
    cartItemId: 'item-mumbai-99',
    productId: 'mumbai-india-99',
    productName: "Mumbai & India '99 Retro Cricket",
    priceAED: LOCKED_PRICING['Half-sleeve'].aed, // 35
    priceINR: LOCKED_PRICING['Half-sleeve'].inr, // 650
    sleeve: 'Half-sleeve' as const,
    size: 'M' as const,
    quantity: 1,
    imageUrl: '/src/assets/images/india_cricket_1790403135152.jpg'
  }
];
