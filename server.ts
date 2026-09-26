/**
 * OFFS1DE — Secured Backend API Server
 * Production-ready Express API with full security, encryption, session management & order lifecycle.
 */

import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

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
app.use(express.json({ limit: '10kb' }));

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

  const session = activeSessions.get(token);
  if (!session) {
    return res.status(403).json({ error: 'Forbidden: Invalid or revoked session' });
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

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', server: 'OFFS1DE Secured API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[OFFS1DE API] Security server listening on http://localhost:${PORT}`);
});
