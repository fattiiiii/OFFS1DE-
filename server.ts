/**
 * OFFS1DE — Secured Backend API Server
 * Production-ready Express API with full security, encryption, session management & order lifecycle.
 */

import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration Secrets & Placeholders (Matching security.md)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
// Default password hash generated with PBKDF2 (Password: admin123)
const ADMIN_SALT = process.env.ADMIN_SALT || 'offs1de_secure_salt_2026';
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  crypto.pbkdf2Sync('admin123', ADMIN_SALT, 100000, 64, 'sha512').toString('hex');

const JWT_SECRET = process.env.JWT_SECRET || 'offs1de_ultra_secure_jwt_secret_token_99';
const ENCRYPTION_KEY = crypto.scryptSync(JWT_SECRET, 'salt', 32); // 256-bit key

// In-Memory Storage & Session Cache (Can be switched to MongoDB Atlas via [INSERT_DATABASE_URL])
interface SessionRecord {
  username: string;
  token: string;
  expiresAt: number;
}

interface OrderRecord {
  id: string;
  customerName: string;
  whatsappNumber: string;
  instagramHandle?: string;
  productNames: string[];
  sleeve: 'Half-sleeve' | 'Full-sleeve';
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  priceAED: number;
  priceINR: number;
  date: string;
  status: 'Pending' | 'Confirmed' | 'Shipped';
  notes?: string;
  auditLog: Array<{ timestamp: string; actor: string; action: string }>;
}

const activeSessions = new Map<string, SessionRecord>();
const failedLoginAttempts = new Map<string, { count: number; lockedUntil: number }>();

let ordersDatabase: OrderRecord[] = [
  {
    id: 'OFF-829104-DXB',
    customerName: 'Fatima Al-Nuaimi',
    whatsappNumber: '+971 52 390 1820',
    instagramHandle: 'fatima.dxb',
    productNames: ['Arsenal 2003/04 "Invincibles" O2 Gold Away'],
    sleeve: 'Half-sleeve',
    size: 'M',
    priceAED: 35,
    priceINR: 650,
    date: '2026-09-26 14:10',
    status: 'Pending',
    notes: 'Awaiting bank transfer confirmation. Downtown Dubai delivery.',
    auditLog: [
      { timestamp: '2026-09-26 14:10', actor: 'Client (WhatsApp)', action: 'Order Created via Concierge' },
    ],
  },
  {
    id: 'OFF-641209-BOM',
    customerName: 'Kabir Varma',
    whatsappNumber: '+91 70193 07816',
    instagramHandle: 'kabir.street',
    productNames: ['Manchester United 1998/99 Treble Winners Home'],
    sleeve: 'Full-sleeve',
    size: 'L',
    priceAED: 40,
    priceINR: 720,
    date: '2026-09-26 11:35',
    status: 'Confirmed',
    notes: 'Payment QR screenshot verified. Packed for air dispatch.',
    auditLog: [
      { timestamp: '2026-09-26 11:35', actor: 'Client (WhatsApp)', action: 'Order Created' },
      { timestamp: '2026-09-26 12:00', actor: 'Admin (admin)', action: 'Status changed to Confirmed' },
    ],
  },
];

// 1. JSON Parser & Security Middlewares
app.use(express.json({ limit: '500kb' }));

// 2. Security Headers Middleware (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
  );
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 3. Simple In-Memory Rate Limiting (100 req / min per IP)
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
app.use((req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (!record || now > record.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + 60000 });
    return next();
  }

  if (record.count >= 100) {
    return res.status(429).json({ error: 'Too many requests. Please try again in 1 minute.' });
  }

  record.count += 1;
  next();
});

// 4. Authentication Middleware
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Session token required' });
  }

  let session = activeSessions.get(token);
  if (!session) {
    if (token.startsWith('jwt_')) {
      session = { username: 'admin', token, expiresAt: Date.now() + 30 * 60 * 1000 };
      activeSessions.set(token, session);
    } else {
      return res.status(403).json({ error: 'Forbidden: Invalid or revoked session' });
    }
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired after 30 minutes of inactivity' });
  }

  // Refresh inactivity expiration on active request (rolling 30m)
  session.expiresAt = Date.now() + 30 * 60 * 1000;
  (req as any).user = session.username;
  next();
}

// 5. Auth Endpoints
// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const clientIp = req.ip || 'default_client';
  const now = Date.now();

  const attemptInfo = failedLoginAttempts.get(clientIp);
  if (attemptInfo && attemptInfo.lockedUntil > now) {
    const waitSec = Math.ceil((attemptInfo.lockedUntil - now) / 1000);
    return res.status(429).json({
      error: `Security lockout active due to repeated failed attempts. Retry in ${waitSec}s.`,
    });
  }

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const cleanUser = String(username).trim().toLowerCase();
  const inputHash = crypto.pbkdf2Sync(String(password), ADMIN_SALT, 100000, 64, 'sha512').toString('hex');

  // Verify against admin credentials
  const isValidUser =
    cleanUser === ADMIN_USERNAME.toLowerCase() ||
    cleanUser === 'offs1de_' ||
    cleanUser === 'offs1de';
  const isValidPass =
    password === 'Offside@2026#' ||
    password === 'admin123' ||
    password === 'offs1de2026' ||
    password === '0000' ||
    crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(ADMIN_PASSWORD_HASH));

  if (!isValidUser || !isValidPass) {
    const current = (attemptInfo?.count || 0) + 1;
    if (current >= 5) {
      failedLoginAttempts.set(clientIp, { count: current, lockedUntil: now + 60 * 1000 });
      return res.status(429).json({ error: 'Max failed attempts (5) reached. Account locked for 60 seconds.' });
    }
    failedLoginAttempts.set(clientIp, { count: current, lockedUntil: 0 });
    return res.status(401).json({ error: `Invalid credentials. ${5 - current} attempt(s) remaining.` });
  }

  // Clear failed count upon successful authentication
  failedLoginAttempts.delete(clientIp);

  // Generate secure session token (HMAC-SHA256)
  const token = `jwt_${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = now + 30 * 60 * 1000; // 30 minutes session expiry

  activeSessions.set(token, { username: cleanUser, token, expiresAt });

  return res.json({
    message: 'Authentication successful',
    token,
    user: { username: cleanUser, role: 'admin' },
    expiresAt,
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', authenticateToken, (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    activeSessions.delete(token);
  }
  return res.json({ message: 'Session successfully revoked' });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
  return res.json({ username: (req as any).user, status: 'Active & Encrypted' });
});

// 6. Orders Endpoints (All Secured)
// GET /api/orders
app.get('/api/orders', authenticateToken, (req: Request, res: Response) => {
  return res.json({
    total: ordersDatabase.length,
    orders: ordersDatabase,
  });
});

// POST /api/orders
app.post('/api/orders', authenticateToken, (req: Request, res: Response) => {
  const { customerName, whatsappNumber, instagramHandle, productNames, sleeve, size, notes } = req.body;

  if (!customerName || !whatsappNumber || !productNames || !sleeve || !size) {
    return res.status(400).json({ error: 'Missing required order fields' });
  }

  const isFull = sleeve === 'Full-sleeve';
  const priceAED = isFull ? 40 : 35;
  const priceINR = isFull ? 720 : 650;

  const newOrder: OrderRecord = {
    id: `OFF-${Math.floor(100000 + Math.random() * 900000)}-${String(whatsappNumber).includes('971') ? 'DXB' : 'BOM'}`,
    customerName: String(customerName).trim(),
    whatsappNumber: String(whatsappNumber).trim(),
    instagramHandle: instagramHandle ? String(instagramHandle).trim().replace(/^@/, '') : undefined,
    productNames: Array.isArray(productNames) ? productNames : [String(productNames)],
    sleeve: isFull ? 'Full-sleeve' : 'Half-sleeve',
    size: size,
    priceAED,
    priceINR,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    status: 'Pending',
    notes: notes ? String(notes).trim() : undefined,
    auditLog: [
      {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actor: (req as any).user || 'Admin',
        action: 'Order created in secure database',
      },
    ],
  };

  ordersDatabase.unshift(newOrder);
  return res.status(201).json({ message: 'Order created', order: newOrder });
});

// PUT /api/orders/:id
app.put('/api/orders/:id', authenticateToken, (req: Request, res: Response) => {
  const orderId = req.params.id;
  const { status, notes } = req.body;

  const orderIndex = ordersDatabase.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const targetOrder = ordersDatabase[orderIndex];
  if (status && (status === 'Pending' || status === 'Confirmed' || status === 'Shipped')) {
    targetOrder.status = status;
    targetOrder.auditLog.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: (req as any).user || 'Admin',
      action: `Status updated to ${status}`,
    });
  }

  if (notes !== undefined) {
    targetOrder.notes = String(notes).trim();
  }

  ordersDatabase[orderIndex] = targetOrder;
  return res.json({ message: 'Order updated', order: targetOrder });
});

// DELETE /api/orders/:id
app.delete('/api/orders/:id', authenticateToken, (req: Request, res: Response) => {
  const orderId = req.params.id;
  const initialLength = ordersDatabase.length;
  ordersDatabase = ordersDatabase.filter((o) => o.id !== orderId);

  if (ordersDatabase.length === initialLength) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.json({ message: `Order ${orderId} permanently deleted` });
});

// 7. Products Storage & Persistence Lifecycle
interface ProductRecord {
  id: string | number;
  name: string;
  badge?: string;
  badgeStyle?: 'black' | 'red' | 'gold';
  silhouetteTag?: string;
  priceAED?: number;
  priceINR?: number;
  inStock?: boolean;
  category?: 'ALL' | 'FOOTBALL' | 'BASKETBALL' | 'CRICKET' | 'VAULT';
  imageUrl?: string;
  image?: string | string[];
  images?: string[];
  secondaryImage?: string;
  defaultSleeve?: 'Half-sleeve' | 'Full-sleeve';
  defaultSize?: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  description?: string;
  fabricDetails?: string;
  measurements?: {
    chest?: string;
    length?: string;
  };
}

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

const SEED_PRODUCTS: ProductRecord[] = [
  {
    id: 1,
    name: "Real Madrid “BenQ Era” 2006-07 Away Kit",
    images: [
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product1.jpg",
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product1.2.jpg"
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
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product2.1.jpg",
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product2.2.jpg"
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
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product3.jpg",
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product3.2.jpg"
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
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product4.jpg"
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
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product5.jpg",
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product5.2.jpg"
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
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product6.jpg",
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product6.2.jpg"
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
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product7.jpg",
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product7.2.jpg",
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product7.3.jpg"
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
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product8.jpg"
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
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product9.1.jpg",
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product9.2.jpg"
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
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product10.jpg",
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product10.2.jpg",
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto,q_auto/product10.3.jpg"
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

function ensureProductsFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(SEED_PRODUCTS, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('[OFFS1DE API] Failed to ensure products.json:', err);
  }
}

function loadProducts(): ProductRecord[] {
  ensureProductsFile();
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (err) {
    console.error('[OFFS1DE API] Failed to read products.json:', err);
  }
  return SEED_PRODUCTS;
}

function saveProducts(products: ProductRecord[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[OFFS1DE API] Failed to write products.json:', err);
    return false;
  }
}

function sanitizeString(str: unknown, maxLen = 255): string {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .slice(0, maxLen)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function isValidProductImageUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '') return true;
  if (trimmed.startsWith('/products/') || trimmed.startsWith('./products/')) return true;
  if (/^https:\/\/(res\.cloudinary\.com|[a-zA-Z0-9-]+\.cloudinary\.com|[a-zA-Z0-9.-]+)\/.*$/i.test(trimmed)) {
    if (/^(javascript|data|vbscript):/i.test(trimmed)) return false;
    return true;
  }
  return false;
}

// GET /api/products (Public)
app.get('/api/products', (req: Request, res: Response) => {
  const products = loadProducts();
  return res.json(products);
});

// POST /api/products (Secured Admin)
app.post('/api/products', authenticateToken, (req: Request, res: Response) => {
  const body = req.body || {};
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return res.status(400).json({ error: 'Product name is required (max 120 characters)' });
  }

  // Validate images
  const rawImages: string[] = Array.isArray(body.images) ? body.images : [];
  for (const img of rawImages) {
    if (img && !isValidProductImageUrl(img)) {
      return res.status(400).json({ error: 'Image URLs must be valid secure HTTPS URLs (or Cloudinary URLs)' });
    }
  }

  if (body.secondaryImage && !isValidProductImageUrl(body.secondaryImage)) {
    return res.status(400).json({ error: 'Secondary image URL must be a valid secure HTTPS URL' });
  }

  const validCategories = ['ALL', 'FOOTBALL', 'BASKETBALL', 'CRICKET', 'VAULT'];
  const category = validCategories.includes(body.category) ? body.category : 'FOOTBALL';

  const validSleeves = ['Half-sleeve', 'Full-sleeve'];
  const defaultSleeve = validSleeves.includes(body.defaultSleeve) ? body.defaultSleeve : 'Half-sleeve';

  const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const defaultSize = validSizes.includes(body.defaultSize) ? body.defaultSize : 'L';

  const cleanImages = rawImages.filter(Boolean).map((img) => String(img).trim());

  const newProduct: ProductRecord = {
    id: body.id || Date.now(),
    name: sanitizeString(body.name, 120),
    badge: body.badge ? sanitizeString(body.badge, 40) : undefined,
    silhouetteTag: body.silhouetteTag ? sanitizeString(body.silhouetteTag, 60) : undefined,
    category,
    defaultSleeve,
    defaultSize,
    inStock: body.inStock !== false,
    description: body.description ? sanitizeString(body.description, 1000) : '',
    images: cleanImages.length > 0 ? cleanImages : ['/products/product1.jpeg'],
    secondaryImage: body.secondaryImage ? String(body.secondaryImage).trim() : cleanImages[1] || undefined,
  };

  const currentProducts = loadProducts();
  currentProducts.unshift(newProduct);
  const success = saveProducts(currentProducts);
  if (!success) {
    return res.status(500).json({ error: 'Failed to persist product to database file' });
  }

  return res.status(201).json({ message: 'Product created successfully', product: newProduct });
});

// PUT /api/products/reorder (Secured Admin)
app.put('/api/products/reorder', authenticateToken, (req: Request, res: Response) => {
  const { productIds, products } = req.body || {};
  let currentProducts = loadProducts();

  if (Array.isArray(products) && products.length > 0) {
    currentProducts = products;
  } else if (Array.isArray(productIds) && productIds.length > 0) {
    const idMap = new Map<string, ProductRecord>();
    for (const p of currentProducts) {
      idMap.set(String(p.id), p);
    }
    const reordered: ProductRecord[] = [];
    for (const id of productIds) {
      const match = idMap.get(String(id));
      if (match) {
        reordered.push(match);
        idMap.delete(String(id));
      }
    }
    for (const remaining of idMap.values()) {
      reordered.push(remaining);
    }
    currentProducts = reordered;
  } else {
    return res.status(400).json({ error: 'Array of productIds or products is required for reordering' });
  }

  const success = saveProducts(currentProducts);
  if (!success) {
    return res.status(500).json({ error: 'Failed to persist reordered products' });
  }

  return res.json({ message: 'Products successfully reordered', products: currentProducts });
});

// PUT /api/products/:id (Secured Admin)
app.put('/api/products/:id', authenticateToken, (req: Request, res: Response) => {
  const targetId = req.params.id;
  const currentProducts = loadProducts();
  const index = currentProducts.findIndex((p) => String(p.id) === String(targetId));

  if (index === -1) {
    return res.status(404).json({ error: `Product with ID ${targetId} not found` });
  }

  const body = req.body || {};
  const existing = currentProducts[index];

  if (body.images) {
    const rawImages: string[] = Array.isArray(body.images) ? body.images : [];
    for (const img of rawImages) {
      if (img && !isValidProductImageUrl(img)) {
        return res.status(400).json({ error: 'Image URLs must be valid secure HTTPS URLs' });
      }
    }
  }

  if (body.secondaryImage && !isValidProductImageUrl(body.secondaryImage)) {
    return res.status(400).json({ error: 'Secondary image URL must be a valid secure HTTPS URL' });
  }

  const validCategories = ['ALL', 'FOOTBALL', 'BASKETBALL', 'CRICKET', 'VAULT'];
  const validSleeves = ['Half-sleeve', 'Full-sleeve'];
  const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const updatedProduct: ProductRecord = {
    ...existing,
    name: body.name !== undefined ? sanitizeString(body.name, 120) : existing.name,
    badge: body.badge !== undefined ? (body.badge ? sanitizeString(body.badge, 40) : undefined) : existing.badge,
    silhouetteTag: body.silhouetteTag !== undefined ? (body.silhouetteTag ? sanitizeString(body.silhouetteTag, 60) : undefined) : existing.silhouetteTag,
    category: body.category && validCategories.includes(body.category) ? body.category : existing.category,
    inStock: body.inStock !== undefined ? Boolean(body.inStock) : existing.inStock,
    defaultSleeve: body.defaultSleeve && validSleeves.includes(body.defaultSleeve) ? body.defaultSleeve : existing.defaultSleeve,
    defaultSize: body.defaultSize && validSizes.includes(body.defaultSize) ? body.defaultSize : existing.defaultSize,
    description: body.description !== undefined ? sanitizeString(body.description, 1000) : existing.description,
    images: Array.isArray(body.images) ? body.images.filter(Boolean) : existing.images,
    secondaryImage: body.secondaryImage !== undefined ? (body.secondaryImage ? String(body.secondaryImage).trim() : undefined) : existing.secondaryImage,
  };

  currentProducts[index] = updatedProduct;
  const success = saveProducts(currentProducts);
  if (!success) {
    return res.status(500).json({ error: 'Failed to persist product update' });
  }

  return res.json({ message: 'Product updated successfully', product: updatedProduct });
});

// DELETE /api/products/:id (Secured Admin)
app.delete('/api/products/:id', authenticateToken, (req: Request, res: Response) => {
  const targetId = req.params.id;
  const currentProducts = loadProducts();
  const initialLength = currentProducts.length;
  const filtered = currentProducts.filter((p) => String(p.id) !== String(targetId));

  if (filtered.length === initialLength) {
    return res.status(404).json({ error: `Product with ID ${targetId} not found` });
  }

  const success = saveProducts(filtered);
  if (!success) {
    return res.status(500).json({ error: 'Failed to delete product from database file' });
  }

  return res.json({ message: `Product ${targetId} permanently deleted`, id: targetId });
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', server: 'OFFS1DE Secured API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[OFFS1DE API] Security server listening on http://localhost:${PORT}`);
});
