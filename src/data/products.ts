import { Product, CartItem, LOCKED_PRICING } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Real Madrid “BenQ Era” 2006-07 Away Kit",
    images: [
      "/products/product1.jpeg",
      "/products/product1.2.jpeg"
    ],
    badge: "ARCHIVE GRAIL",
    silhouetteTag: "BECKHAM #23 ICON",
    category: "FOOTBALL",
    defaultSleeve: "Half-sleeve",
    defaultSize: "L",
    inStock: true,
    description: "Legendary 2006-07 Real Madrid BenQ Siemens away kit with iconic Beckham #23 back print. Premium heavyweight fabric with authentic gold/white details."
  },
  {
    id: 2,
    name: "Real Madrid Emerald Third Kit 25/26",
    images: [
      "/products/product2.1.jpeg",
      "/products/product2.2.jpeg"
    ],
    badge: "NEW DROP",
    silhouetteTag: "MODERN STREETWEAR SILHOUETTE",
    category: "FOOTBALL",
    defaultSleeve: "Half-sleeve",
    defaultSize: "L",
    inStock: true,
    description: "Modern 25/26 emerald green third kit featuring intricate crest patterning and bespoke collar styling for contemporary urban fits."
  },
  {
    id: 3,
    name: "Manchester United Retro Black Away 07/08 – AIG Era",
    images: [
      "/products/product3.jpeg",
      "/products/product3.2.jpeg"
    ],
    badge: "VAULT GRAIL",
    silhouetteTag: "07/08 DOUBLE CHAMPIONS",
    category: "FOOTBALL",
    defaultSleeve: "Half-sleeve",
    defaultSize: "L",
    inStock: true,
    description: "The iconic black and red stripe away kit worn during the historic 2007-08 European and Premier League double season with classic AIG branding."
  },
  {
    id: 4,
    name: "Real Madrid Retro White Home – Teka Era",
    images: [
      "/products/product4.jpeg"
    ],
    badge: "CLASSIC 90S",
    silhouetteTag: "TEKA HERITAGE COLLAR",
    category: "FOOTBALL",
    defaultSleeve: "Half-sleeve",
    defaultSize: "L",
    inStock: true,
    description: "Timeless 90s Real Madrid Teka era home kit with classic polo collar, tonal club jacquard, and heritage three stripes."
  },
  {
    id: 5,
    name: "Real Madrid “White Crown” 25/26 Third Kit",
    images: [
      "/products/product5.1.jpeg",
      "/products/product5.2.jpeg"
    ],
    badge: "LATEST RELEASE",
    silhouetteTag: "OVERSIZED MONOGRAM",
    category: "FOOTBALL",
    defaultSleeve: "Half-sleeve",
    defaultSize: "L",
    inStock: true,
    description: "Crisp white edition with subtle luxury detailing, high-density crest embroidery, and relaxed drop-shoulder cut."
  },
  {
    id: 6,
    name: "FC Barcelona “Purple Haze” Special Edition",
    images: [
      "/products/product6.jpeg",
      "/products/product6.2.jpeg"
    ],
    badge: "SPECIAL EDITION",
    silhouetteTag: "STREETWEAR CROSSOVER",
    category: "FOOTBALL",
    defaultSleeve: "Half-sleeve",
    defaultSize: "L",
    inStock: true,
    description: "Vibrant iridescent purple jersey with color-shifting badge elements and modern breathable knit structure."
  },
  {
    id: 7,
    name: "Manchester United “Moscow 2008” Final Kit",
    images: [
      "/products/product7.jpeg",
      "/products/product7.2.jpeg",
      "/products/product7.3.jpeg"
    ],
    badge: "UCL FINAL 2008",
    silhouetteTag: "MATCHDAY COMMEMORATIVE",
    category: "FOOTBALL",
    defaultSleeve: "Half-sleeve",
    defaultSize: "L",
    inStock: true,
    description: "Official 2008 Champions League Moscow final commemorative kit with bespoke match embroidery and Champions Star detailing."
  },
  {
    id: 8,
    name: "England “Beckham 7” 2002 World Cup Home Kit",
    images: [
      "/products/product8.jpeg"
    ],
    badge: "WORLD CUP 02",
    silhouetteTag: "VERTICAL RED STRIPE",
    category: "FOOTBALL",
    defaultSleeve: "Half-sleeve",
    defaultSize: "L",
    inStock: true,
    description: "The definitive 2002 World Cup England home kit with the asymmetric single red vertical stripe and reversible inner detail."
  },
  {
    id: 9,
    name: "Santos FC “Centenary” 2012 Home Kit",
    images: [
      "/products/product9.1.jpeg",
      "/products/product9.2.jpeg"
    ],
    badge: "NEYMAR JR #11",
    silhouetteTag: "SANTOS 100 ANOS",
    category: "FOOTBALL",
    defaultSleeve: "Half-sleeve",
    defaultSize: "L",
    inStock: true,
    description: "Historic Santos Centenary 2012 home kit celebrating 100 years of Peixe, featuring Neymar Jr #11 typography and BMG sponsor badges."
  },
  {
    id: 10,
    name: "FC Barcelona 23/24 Aqua Cyan Third Kit",
    images: [
      "/products/product10.jpeg",
      "/products/product10.3.jpeg",
      "/products/product10.2.jpeg"
    ],
    badge: "RAPHINHA #11",
    silhouetteTag: "AERO-FIT LIGHT AQUA",
    category: "FOOTBALL",
    defaultSleeve: "Half-sleeve",
    defaultSize: "L",
    inStock: true,
    description: "Vibrant aqua cyan 2023/24 third kit with split tone geometric zig-zag weave, Spotify centerpiece, and Raphinha #11 back print."
  }
];

export const INITIAL_CART_ITEMS: CartItem[] = [];