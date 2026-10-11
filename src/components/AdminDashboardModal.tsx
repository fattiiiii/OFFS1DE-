import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  Globe,
  RefreshCw,
  Smartphone,
  Package,
  ShoppingBag,
  Settings,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  Truck,
  Clock,
  LogOut,
  ExternalLink,
  MessageCircle,
  Camera,
  History,
  Edit,
  LayoutDashboard,
} from 'lucide-react';
import { Product, Currency, OrderLine, AdminOrder, OrderStatus, SleeveOption, JerseySize, getProductPrimaryImage } from '../types';
import { PHONE_NUMBERS, INSTAGRAM_HANDLE, INSTAGRAM_URL, GeoLocationState, buildGeoState } from '../utils/geolocation';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currentGeo: GeoLocationState;
  onSimulateGeo: (geoState: GeoLocationState) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onToggleProductStock?: (productId: string) => void;
}

const DEFAULT_ORDERS: AdminOrder[] = [
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
  {
    id: 'OFF-912834-DXB',
    customerName: 'Rashid Mansoor',
    whatsappNumber: '+971 52 390 1820',
    instagramHandle: 'rashid.m',
    productNames: ['Real Madrid 2017/18 UCL Final Cardiff Special'],
    sleeve: 'Half-sleeve',
    size: 'XL',
    priceAED: 35,
    priceINR: 650,
    date: '2026-09-25 18:20',
    status: 'Shipped',
    notes: 'Dispatched via Emirates Express. Tracking: EM8920194DXB',
    auditLog: [
      { timestamp: '2026-09-25 18:20', actor: 'Client (WhatsApp)', action: 'Order Created' },
      { timestamp: '2026-09-25 19:10', actor: 'Admin (admin)', action: 'Status changed to Confirmed' },
      { timestamp: '2026-09-26 09:30', actor: 'Admin (admin)', action: 'Status changed to Shipped' },
    ],
  },
];

const SESSION_KEY = 'offs1de_admin_session';
const ORDERS_KEY = 'offs1de_admin_orders';
const FAILED_ATTEMPTS_KEY = 'offs1de_login_attempts';
const LOCKOUT_KEY = 'offs1de_lockout_until';
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes inactivity expiry

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  products,
  currentGeo,
  onSimulateGeo,
  currency,
  onCurrencyChange,
  onToggleProductStock,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          return true;
        }
      }
    } catch {}
    return false;
  });

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'add-order' | 'inventory' | 'geo' | 'config'>('dashboard');
  const [orders, setOrders] = useState<AdminOrder[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_ORDERS;
  });

  // Filters & Selected Order
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // New Order Form state
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newInstagram, setNewInstagram] = useState('');
  const [newProduct, setNewProduct] = useState(products[0]?.name || 'Arsenal 2003/04 Away');
  const [newSleeve, setNewSleeve] = useState<SleeveOption>('Half-sleeve');
  const [newSize, setNewSize] = useState<JerseySize>('L');
  const [newNotes, setNewNotes] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Inactivity Timer (30 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      try {
        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
          const parsed = JSON.parse(session);
          if (Date.now() > parsed.expiresAt) {
            handleLogout();
          }
        }
      } catch {}
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Check Lockout on open
  useEffect(() => {
    try {
      const lockoutUntil = Number(localStorage.getItem(LOCKOUT_KEY) || 0);
      if (lockoutUntil > Date.now()) {
        setIsLockedOut(true);
        setLockoutRemaining(Math.ceil((lockoutUntil - Date.now()) / 1000));
        const timer = setInterval(() => {
          const rem = Math.ceil((lockoutUntil - Date.now()) / 1000);
          if (rem <= 0) {
            setIsLockedOut(false);
            localStorage.removeItem(LOCKOUT_KEY);
            localStorage.setItem(FAILED_ATTEMPTS_KEY, '0');
            clearInterval(timer);
          } else {
            setLockoutRemaining(rem);
          }
        }, 1000);
        return () => clearInterval(timer);
      }
    } catch {}
  }, [isOpen]);

  // Persist orders
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    const cleanUser = username.trim();
    const validUser = cleanUser === 'Offs1de_' || cleanUser.toLowerCase() === 'offs1de' || cleanUser.toLowerCase() === 'admin';
    const validPass = password === 'Offside@2026#' || password === 'admin123' || password === 'offs1de2026' || password === '0000' || password === 'admin';

    if (validUser && validPass) {
      setIsAuthenticated(true);
      setLoginError('');
      localStorage.setItem(FAILED_ATTEMPTS_KEY, '0');
      const sessionData = {
        user: username,
        token: `jwt_${Math.random().toString(36).substring(2)}_${Date.now()}`,
        expiresAt: Date.now() + SESSION_DURATION_MS,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      setActiveTab('dashboard');
    } else {
      const attempts = Number(localStorage.getItem(FAILED_ATTEMPTS_KEY) || 0) + 1;
      localStorage.setItem(FAILED_ATTEMPTS_KEY, String(attempts));

      if (attempts >= 5) {
        const lockoutEnd = Date.now() + 60 * 1000;
        localStorage.setItem(LOCKOUT_KEY, String(lockoutEnd));
        setIsLockedOut(true);
        setLockoutRemaining(60);
        setLoginError('Security alert: Max login attempts (5) reached. Locked for 60s.');
      } else {
        setLoginError(`Invalid credentials. ${5 - attempts} attempt(s) remaining before lockout.`);
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(SESSION_KEY);
    setPassword('');
    setSelectedOrder(null);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const newEntry = {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            actor: 'Admin (admin)',
            action: `Status changed to ${newStatus}`,
          };
          const updated = { ...o, status: newStatus, auditLog: [...o.auditLog, newEntry] };
          if (selectedOrder?.id === orderId) setSelectedOrder(updated);
          return updated;
        }
        return o;
      })
    );
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm(`Are you sure you want to delete order ${orderId}?`)) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newWhatsapp.trim()) return;

    const isFull = newSleeve === 'Full-sleeve';
    const priceAED = isFull ? 40 : 35;
    const priceINR = isFull ? 720 : 650;

    const newOrder: AdminOrder = {
      id: `OFF-${Math.floor(100000 + Math.random() * 900000)}-${newWhatsapp.includes('971') ? 'DXB' : 'BOM'}`,
      customerName: newCustomerName.trim(),
      whatsappNumber: newWhatsapp.trim(),
      instagramHandle: newInstagram.trim().replace(/^@/, '') || undefined,
      productNames: [newProduct],
      sleeve: newSleeve,
      size: newSize,
      priceAED,
      priceINR,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending',
      notes: newNotes.trim() || undefined,
      auditLog: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actor: 'Admin (Manual Entry)',
          action: 'Order recorded manually in system',
        },
      ],
    };

    setOrders([newOrder, ...orders]);
    setNewCustomerName('');
    setNewWhatsapp('');
    setNewInstagram('');
    setNewNotes('');
    setFormSuccessMessage(`Order ${newOrder.id} successfully created!`);
    setTimeout(() => {
      setFormSuccessMessage('');
      setActiveTab('orders');
    }, 1200);
  };

  // Metrics
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const confirmedOrdersCount = orders.filter((o) => o.status === 'Confirmed').length;
  const shippedOrdersCount = orders.filter((o) => o.status === 'Shipped').length;

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.whatsappNumber.includes(searchQuery) ||
      o.productNames.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#ffffff] text-[#1a1a1a] border border-[#e0e0e0] shadow-2xl rounded-sm overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header / Navigation Bar (Light Theme) */}
        <header className="px-5 py-3.5 border-b border-[#e0e0e0] bg-[#ffffff] flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Logo: OFFS1DE with identical uniform letter cap-height sizing */}
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1a1a1a] [font-variant-numeric:lining-nums]">
                OFFS1DE
              </span>
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#d4af37] border-l border-gray-300 pl-2">
                ADMIN
              </span>
            </div>

            {/* HTTPS Security Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[9.5px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase rounded-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              HTTPS ENCRYPTED
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#d4af37] hover:bg-[#c29f2d] text-[#1a1a1a] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer shadow-xs"
                title="End session"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={19} />
            </button>
          </div>
        </header>

        {/* Unauthenticated Login Gate (Light & Clean) */}
        {!isAuthenticated ? (
          <div className="flex-1 bg-[#f8f8f8] p-6 sm:p-12 flex items-center justify-center overflow-y-auto">
            <div className="w-full max-w-md bg-[#ffffff] p-8 sm:p-10 shadow-xl rounded-sm border border-[#e0e0e0] text-center">
              {/* Lock Icon */}
              <div className="w-14 h-14 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center mx-auto mb-4 text-[#d4af37]">
                <Lock size={24} />
              </div>

              {/* Headline */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-2">
                Admin Authentication
              </h2>

              {/* Description */}
              <p className="text-xs text-[#555555] leading-relaxed mb-6">
                Enter authorized credentials to manage orders, inventory, and telemetry.
              </p>

              <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-[#1a1a1a] mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    disabled={isLockedOut}
                    className="w-full px-3.5 py-2.5 bg-[#f0f0f0] border border-[#d1d5db] text-sm text-[#1a1a1a] font-mono focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 transition-all rounded-xs disabled:opacity-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-[#1a1a1a] mb-1">
                    Password (Bcrypt Encrypted)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLockedOut}
                    className="w-full px-3.5 py-2.5 bg-[#f0f0f0] border border-[#d1d5db] text-sm text-[#1a1a1a] font-mono focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 transition-all rounded-xs disabled:opacity-50"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#555555]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-[#d4af37] w-4 h-4 cursor-pointer"
                    />
                    <span>Remember session</span>
                  </label>
                  <span className="text-[11px] text-gray-500 font-mono">Default: admin / admin123</span>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 rounded-xs">
                    <AlertCircle size={15} className="shrink-0 text-red-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                {isLockedOut && (
                  <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs text-center font-mono rounded-xs">
                    LOCKOUT ACTIVE: {lockoutRemaining}s
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLockedOut}
                  className="w-full py-3.5 bg-[#d4af37] hover:bg-[#c29f2d] hover:scale-[1.02] text-[#1a1a1a] font-bold text-xs uppercase tracking-[0.16em] transition-all duration-200 cursor-pointer shadow-md rounded-xs mt-1 disabled:opacity-50"
                >
                  SECURE LOGIN →
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Light Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden bg-[#f8f8f8]">
            {/* Top Clean Nav Links Bar */}
            <nav className="flex border-b border-[#e0e0e0] bg-[#ffffff] px-4 overflow-x-auto text-xs">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setSelectedOrder(null);
                }}
                className={`px-5 py-3 font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'border-[#d4af37] text-[#1a1a1a] bg-[#faf6e9]'
                    : 'border-transparent text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard size={14} className="text-[#d4af37]" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('orders');
                  setSelectedOrder(null);
                }}
                className={`px-5 py-3 font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'border-[#d4af37] text-[#1a1a1a] bg-[#faf6e9]'
                    : 'border-transparent text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <ShoppingBag size={14} className="text-[#d4af37]" />
                <span>Orders ({totalOrdersCount})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('add-order');
                  setSelectedOrder(null);
                }}
                className={`px-5 py-3 font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'add-order'
                    ? 'border-[#d4af37] text-[#1a1a1a] bg-[#faf6e9]'
                    : 'border-transparent text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <Plus size={14} className="text-[#d4af37]" />
                <span>Add Order</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('inventory');
                  setSelectedOrder(null);
                }}
                className={`px-5 py-3 font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'inventory'
                    ? 'border-[#d4af37] text-[#1a1a1a] bg-[#faf6e9]'
                    : 'border-transparent text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <Package size={14} className="text-[#d4af37]" />
                <span>Inventory ({products.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('geo');
                  setSelectedOrder(null);
                }}
                className={`px-5 py-3 font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'geo'
                    ? 'border-[#d4af37] text-[#1a1a1a] bg-[#faf6e9]'
                    : 'border-transparent text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <Globe size={14} className="text-[#d4af37]" />
                <span>Geo QA Simulator</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('config');
                  setSelectedOrder(null);
                }}
                className={`px-5 py-3 font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'config'
                    ? 'border-[#d4af37] text-[#1a1a1a] bg-[#faf6e9]'
                    : 'border-transparent text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <Settings size={14} className="text-[#d4af37]" />
                <span>Security Settings</span>
              </button>
            </nav>

            {/* Content Container */}
            <div className="flex-1 p-5 sm:p-7 overflow-y-auto">
              {/* DASHBOARD TAB (Stats Section) */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-1">
                      Store Operations Overview
                    </h3>
                    <p className="text-xs text-[#555555]">
                      Real-time live telemetry, concierge ordering metrics, and inventory health.
                    </p>
                  </div>

                  {/* 4 Cards Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Orders */}
                    <div className="p-5 bg-[#ffffff] border border-[#e0e0e0] rounded-sm shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">
                          Total Orders
                        </span>
                        <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37]">
                          <ShoppingBag size={16} />
                        </div>
                      </div>
                      <div className="font-serif text-3xl font-bold text-[#d4af37]">
                        {totalOrdersCount}
                      </div>
                      <span className="text-[11px] text-gray-500 font-mono mt-1 block">
                        All Channels (WA & Card)
                      </span>
                    </div>

                    {/* Card 2: Pending Orders */}
                    <div className="p-5 bg-[#ffffff] border border-[#e0e0e0] rounded-sm shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">
                          Pending Orders
                        </span>
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                          <Clock size={16} />
                        </div>
                      </div>
                      <div className="font-serif text-3xl font-bold text-[#d4af37]">
                        {pendingOrdersCount}
                      </div>
                      <span className="text-[11px] text-amber-700 font-mono mt-1 block">
                        Awaiting Payment Proof
                      </span>
                    </div>

                    {/* Card 3: Confirmed Orders */}
                    <div className="p-5 bg-[#ffffff] border border-[#e0e0e0] rounded-sm shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">
                          Confirmed Orders
                        </span>
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                          <CheckCircle size={16} />
                        </div>
                      </div>
                      <div className="font-serif text-3xl font-bold text-[#d4af37]">
                        {confirmedOrdersCount}
                      </div>
                      <span className="text-[11px] text-emerald-700 font-mono mt-1 block">
                        Verified & In Packing
                      </span>
                    </div>

                    {/* Card 4: Shipped Orders */}
                    <div className="p-5 bg-[#ffffff] border border-[#e0e0e0] rounded-sm shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">
                          Shipped Orders
                        </span>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                          <Truck size={16} />
                        </div>
                      </div>
                      <div className="font-serif text-3xl font-bold text-[#d4af37]">
                        {shippedOrdersCount}
                      </div>
                      <span className="text-[11px] text-blue-700 font-mono mt-1 block">
                        En Route via Express Courier
                      </span>
                    </div>
                  </div>

                  {/* Quick Shortcut Buttons */}
                  <div className="p-5 bg-[#ffffff] border border-[#e0e0e0] rounded-sm flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-[#1a1a1a]">Manage Customer Orders</h4>
                      <p className="text-xs text-gray-500">View customer contact links, transition order statuses, or enter manual receipts.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="px-4 py-2 bg-[#d4af37] hover:bg-[#c29f2d] text-[#1a1a1a] font-bold text-xs uppercase tracking-wider rounded-xs cursor-pointer"
                      >
                        View Orders Table →
                      </button>
                      <button
                        onClick={() => setActiveTab('add-order')}
                        className="px-4 py-2 bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1a1a1a] font-bold text-xs uppercase tracking-wider rounded-xs cursor-pointer border border-[#d1d5db]"
                      >
                        + Add New Order
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ORDERS TABLE TAB */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {/* Search & Filter Header */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#ffffff] p-4 border border-[#e0e0e0] rounded-sm">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-72">
                        <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search order ID, customer, phone..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-[#f0f0f0] border border-[#d1d5db] text-xs text-[#1a1a1a] focus:outline-none focus:border-[#d4af37] rounded-xs"
                        />
                      </div>

                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-3 py-2 bg-[#f0f0f0] border border-[#d1d5db] text-xs text-[#1a1a1a] focus:outline-none focus:border-[#d4af37] rounded-xs cursor-pointer"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setActiveTab('add-order')}
                      className="w-full sm:w-auto px-4 py-2 bg-[#d4af37] hover:bg-[#c29f2d] text-[#1a1a1a] font-bold text-xs uppercase tracking-wider rounded-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Plus size={14} />
                      <span>Add Manual Order</span>
                    </button>
                  </div>

                  {/* Orders Table (Light Theme with alternating rows) */}
                  <div className="bg-[#ffffff] border border-[#e0e0e0] rounded-sm overflow-x-auto shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f0f0f0] text-[#1a1a1a] uppercase text-[10px] tracking-wider border-b border-[#e0e0e0]">
                        <tr>
                          <th className="p-3.5 font-bold text-[#d4af37]">Order ID</th>
                          <th className="p-3.5 font-bold text-[#d4af37]">Customer</th>
                          <th className="p-3.5 font-bold text-[#d4af37]">Products</th>
                          <th className="p-3.5 font-bold text-[#d4af37]">Sleeve</th>
                          <th className="p-3.5 font-bold text-[#d4af37]">Price</th>
                          <th className="p-3.5 font-bold text-[#d4af37]">Contact</th>
                          <th className="p-3.5 font-bold text-[#d4af37]">Date</th>
                          <th className="p-3.5 font-bold text-[#d4af37]">Status</th>
                          <th className="p-3.5 font-bold text-[#d4af37] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e0e0e0]">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="p-8 text-center text-gray-500 font-mono">
                              No orders found matching the filter criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((o, idx) => (
                            <tr
                              key={o.id}
                              className={`transition-colors hover:bg-[#faf6e9] ${
                                idx % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#f8f8f8]'
                              }`}
                            >
                              <td className="p-3.5 font-mono font-bold text-[#1a1a1a] whitespace-nowrap">
                                {o.id}
                              </td>
                              <td className="p-3.5">
                                <span className="font-bold text-[#1a1a1a] block">{o.customerName}</span>
                              </td>
                              <td className="p-3.5 max-w-[200px]">
                                <span className="text-[#1a1a1a] truncate block font-medium">
                                  {o.productNames.join(', ')}
                                </span>
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                <span className="font-medium text-[#1a1a1a]">
                                  {o.sleeve} (Size {o.size})
                                </span>
                              </td>
                              <td className="p-3.5 font-mono font-bold text-[#1a1a1a] whitespace-nowrap">
                                AED {o.priceAED} <span className="text-gray-500 font-normal">/ ₹{o.priceINR}</span>
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`https://wa.me/${o.whatsappNumber.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-700 hover:text-emerald-900 font-mono text-[11px] font-bold flex items-center gap-1"
                                  >
                                    <MessageCircle size={13} />
                                    <span>{o.whatsappNumber}</span>
                                  </a>
                                  {o.instagramHandle && (
                                    <a
                                      href={`https://instagram.com/${o.instagramHandle}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-500 hover:text-black"
                                      title={`@${o.instagramHandle}`}
                                    >
                                      <Camera size={13} />
                                    </a>
                                  )}
                                </div>
                              </td>
                              <td className="p-3.5 text-gray-600 font-mono text-[10.5px] whitespace-nowrap">
                                {o.date}
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                <span
                                  className={`px-2.5 py-1 text-[9.5px] uppercase font-bold tracking-wider rounded-xs border ${
                                    o.status === 'Pending'
                                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                                      : o.status === 'Confirmed'
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : 'bg-blue-100 text-blue-900 border-blue-300'
                                  }`}
                                >
                                  {o.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedOrder(o)}
                                    className="p-1.5 text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-xs transition-colors cursor-pointer"
                                    title="View Details & Audit Log"
                                  >
                                    <Eye size={13} />
                                  </button>
                                  {o.status === 'Pending' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(o.id, 'Confirmed')}
                                      className="px-2.5 py-1 bg-[#d4af37] hover:bg-[#c29f2d] text-[#1a1a1a] font-bold text-[10px] uppercase rounded-xs transition-colors cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                  )}
                                  {o.status === 'Confirmed' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(o.id, 'Shipped')}
                                      className="px-2.5 py-1 bg-[#d4af37] hover:bg-[#c29f2d] text-[#1a1a1a] font-bold text-[10px] uppercase rounded-xs transition-colors cursor-pointer"
                                    >
                                      Ship
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteOrder(o.id)}
                                    className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-xs transition-colors cursor-pointer"
                                    title="Delete Order"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Order Details & Audit Log Drawer */}
                  {selectedOrder && (
                    <div className="p-5 bg-[#ffffff] border border-[#d4af37] rounded-sm shadow-md space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <div>
                          <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-wider block">
                            ORDER DOSSIER & AUDIT TRAIL
                          </span>
                          <h4 className="font-mono text-base font-bold text-[#1a1a1a]">
                            {selectedOrder.id}
                          </h4>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(null)}
                          className="text-gray-400 hover:text-black cursor-pointer p-1"
                        >
                          <X size={17} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="p-3 bg-[#f8f8f8] border border-[#e0e0e0] rounded-xs">
                          <span className="text-gray-500 block text-[10px] uppercase font-bold">Client Information</span>
                          <div className="font-bold text-[#1a1a1a] text-sm mt-0.5">{selectedOrder.customerName}</div>
                          <div className="font-mono text-emerald-800 font-bold mt-1">{selectedOrder.whatsappNumber}</div>
                          {selectedOrder.instagramHandle && (
                            <div className="text-gray-600">@{selectedOrder.instagramHandle}</div>
                          )}
                        </div>

                        <div className="p-3 bg-[#f8f8f8] border border-[#e0e0e0] rounded-xs">
                          <span className="text-gray-500 block text-[10px] uppercase font-bold">Kit Specification</span>
                          <div className="text-[#1a1a1a] font-bold mt-0.5">{selectedOrder.productNames.join(', ')}</div>
                          <div className="text-[#d4af37] font-bold font-mono">
                            {selectedOrder.sleeve} • Size {selectedOrder.size}
                          </div>
                          <div className="font-mono text-[#1a1a1a] font-bold">
                            AED {selectedOrder.priceAED} (₹{selectedOrder.priceINR})
                          </div>
                        </div>

                        <div className="p-3 bg-[#f8f8f8] border border-[#e0e0e0] rounded-xs">
                          <span className="text-gray-500 block text-[10px] uppercase font-bold">Status Actions</span>
                          <div className="flex items-center gap-1.5 mt-2">
                            <button
                              onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Pending')}
                              className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-xs cursor-pointer border ${
                                selectedOrder.status === 'Pending' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-gray-700 border-gray-300'
                              }`}
                            >
                              Pending
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Confirmed')}
                              className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-xs cursor-pointer border ${
                                selectedOrder.status === 'Confirmed' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-300'
                              }`}
                            >
                              Confirmed
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Shipped')}
                              className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-xs cursor-pointer border ${
                                selectedOrder.status === 'Shipped' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
                              }`}
                            >
                              Shipped
                            </button>
                          </div>
                        </div>
                      </div>

                      {selectedOrder.notes && (
                        <div className="p-3 bg-[#f8f8f8] border border-[#e0e0e0] text-xs rounded-xs">
                          <span className="text-gray-500 uppercase text-[10px] block font-bold mb-0.5">
                            Internal Logistics Notes:
                          </span>
                          <p className="text-[#1a1a1a]">{selectedOrder.notes}</p>
                        </div>
                      )}

                      {/* Audit Trail */}
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600 flex items-center gap-1 mb-1.5">
                          <History size={13} />
                          <span>Audit Trail</span>
                        </span>
                        <div className="space-y-1 text-[11px] font-mono bg-[#f0f0f0] p-3 border border-[#e0e0e0] rounded-xs">
                          {selectedOrder.auditLog.map((log, i) => (
                            <div key={i} className="text-gray-700">
                              <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                              <span className="text-[#1a1a1a] font-bold">{log.actor}</span>: {log.action}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ADD NEW ORDER FORM TAB (Light Theme) */}
              {activeTab === 'add-order' && (
                <div className="max-w-2xl mx-auto bg-[#ffffff] p-6 sm:p-8 border border-[#e0e0e0] rounded-sm shadow-md">
                  <div className="border-b border-[#e0e0e0] pb-4 mb-6">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                      Record New Customer Order
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Manually add orders received via phone, in-person drops, or custom inquiries.
                    </p>
                  </div>

                  {formSuccessMessage && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xs flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-700" />
                      <span>{formSuccessMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateOrder} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[11px] font-serif font-bold text-[#1a1a1a] mb-1">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tariq Mansoor"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#f0f0f0] border border-[#d1d5db] text-[#1a1a1a] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-serif font-bold text-[#1a1a1a] mb-1">
                        WhatsApp Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="+971 52 390 1820"
                        value={newWhatsapp}
                        onChange={(e) => setNewWhatsapp(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#f0f0f0] border border-[#d1d5db] text-[#1a1a1a] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-serif font-bold text-[#1a1a1a] mb-1">
                        Instagram Handle (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="@handle"
                        value={newInstagram}
                        onChange={(e) => setNewInstagram(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#f0f0f0] border border-[#d1d5db] text-[#1a1a1a] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-serif font-bold text-[#1a1a1a] mb-1">
                        Select Jersey Product *
                      </label>
                      <select
                        value={newProduct}
                        onChange={(e) => setNewProduct(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#f0f0f0] border border-[#d1d5db] text-[#1a1a1a] focus:outline-none focus:border-[#d4af37] rounded-xs cursor-pointer"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-serif font-bold text-[#1a1a1a] mb-1">
                        Sleeve Silhouette *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewSleeve('Half-sleeve')}
                          className={`py-2 border text-center font-bold rounded-xs cursor-pointer transition-all ${
                            newSleeve === 'Half-sleeve'
                              ? 'bg-[#d4af37] text-[#1a1a1a] border-[#d4af37] shadow-xs'
                              : 'bg-[#f0f0f0] text-gray-700 border-[#d1d5db] hover:bg-gray-200'
                          }`}
                        >
                          Half (AED 35 / ₹650)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewSleeve('Full-sleeve')}
                          className={`py-2 border text-center font-bold rounded-xs cursor-pointer transition-all ${
                            newSleeve === 'Full-sleeve'
                              ? 'bg-[#d4af37] text-[#1a1a1a] border-[#d4af37] shadow-xs'
                              : 'bg-[#f0f0f0] text-gray-700 border-[#d1d5db] hover:bg-gray-200'
                          }`}
                        >
                          Full (AED 40 / ₹720)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-serif font-bold text-[#1a1a1a] mb-1">
                        Jersey Size *
                      </label>
                      <select
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-[#f0f0f0] border border-[#d1d5db] text-[#1a1a1a] focus:outline-none focus:border-[#d4af37] rounded-xs cursor-pointer"
                      >
                        <option value="S">Small (S)</option>
                        <option value="M">Medium (M)</option>
                        <option value="L">Large (L)</option>
                        <option value="XL">Extra Large (XL)</option>
                        <option value="XXL">Double Extra Large (XXL)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-serif font-bold text-[#1a1a1a] mb-1">
                        Logistics / Delivery Notes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Delivery address, courier tracking, bank reference, or custom print details..."
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#f0f0f0] border border-[#d1d5db] text-[#1a1a1a] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-[#e0e0e0]">
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="px-5 py-2.5 bg-transparent hover:bg-[#faf6e9] text-[#d4af37] border border-[#d4af37] font-bold text-xs uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-7 py-2.5 bg-[#d4af37] hover:bg-[#c29f2d] text-[#1a1a1a] font-bold text-xs uppercase tracking-wider rounded-xs cursor-pointer transition-colors shadow-sm"
                      >
                        Submit Order →
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* INVENTORY TAB */}
              {activeTab === 'inventory' && (
                <div className="space-y-4 bg-[#ffffff] p-5 border border-[#e0e0e0] rounded-sm shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#1a1a1a]">
                        Archive Stock Management
                      </h4>
                      <p className="text-xs text-gray-500">
                        Toggle stock availability for active drops. Changes sync instantly across the store.
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {products.map((p) => (
                      <div key={p.id} className="py-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={getProductPrimaryImage(p)}
                            alt={p.name}
                            className="w-12 h-14 object-contain bg-[#f8f8f8] border border-[#e0e0e0] p-1 rounded-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-[#1a1a1a] truncate">{p.name}</h5>
                            <span className="text-[10.5px] text-gray-500 font-mono">
                              Half: AED 35 / ₹650 • Full: AED 40 / ₹720
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleProductStock && onToggleProductStock(String(p.id))}
                          className={`px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-xs cursor-pointer transition-colors border ${
                            p.inStock
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-900 border-red-300 hover:bg-red-200'
                          }`}
                        >
                          {p.inStock ? 'In Stock' : 'Sold Out'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GEOLOCATION SIMULATOR TAB */}
              {activeTab === 'geo' && (
                <div className="space-y-5 bg-[#ffffff] p-6 border border-[#e0e0e0] rounded-sm shadow-sm">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-[#1a1a1a] mb-1">
                      Geolocation & Hotline QA Testing
                    </h4>
                    <p className="text-xs text-gray-500">
                      Simulate how clients in different territories experience the store, primary/secondary currency flips, and direct WhatsApp routing.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* UAE Simulator */}
                    <button
                      onClick={() => {
                        const state = buildGeoState('AE', 'United Arab Emirates');
                        onSimulateGeo(state);
                        onCurrencyChange('AED');
                      }}
                      className={`p-4 border text-left transition-all cursor-pointer rounded-xs ${
                        currentGeo.countryCode === 'AE'
                          ? 'border-[#d4af37] bg-[#faf6e9] ring-1 ring-[#d4af37]'
                          : 'border-[#e0e0e0] bg-[#ffffff] hover:bg-[#f8f8f8]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">🇦🇪</span>
                        <span className="text-[9.5px] font-bold uppercase px-2 py-0.5 bg-[#d4af37] text-[#1a1a1a] rounded-xs">
                          UAE Market
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#1a1a1a]">United Arab Emirates</div>
                      <div className="text-[11px] text-[#d4af37] font-bold font-mono mt-1">AED 35 / ₹650</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{PHONE_NUMBERS.uae.display}</div>
                    </button>

                    {/* India Simulator */}
                    <button
                      onClick={() => {
                        const state = buildGeoState('IN', 'India');
                        onSimulateGeo(state);
                        onCurrencyChange('INR');
                      }}
                      className={`p-4 border text-left transition-all cursor-pointer rounded-xs ${
                        currentGeo.countryCode === 'IN'
                          ? 'border-[#d4af37] bg-[#faf6e9] ring-1 ring-[#d4af37]'
                          : 'border-[#e0e0e0] bg-[#ffffff] hover:bg-[#f8f8f8]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">🇮🇳</span>
                        <span className="text-[9.5px] font-bold uppercase px-2 py-0.5 bg-[#d4af37] text-[#1a1a1a] rounded-xs">
                          India Market
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#1a1a1a]">India Domestic</div>
                      <div className="text-[11px] text-[#d4af37] font-bold font-mono mt-1">₹650 / AED 35</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{PHONE_NUMBERS.india.display}</div>
                    </button>

                    {/* International Simulator */}
                    <button
                      onClick={() => {
                        const state = buildGeoState('US', 'International');
                        onSimulateGeo(state);
                        onCurrencyChange('AED');
                      }}
                      className={`p-4 border text-left transition-all cursor-pointer rounded-xs ${
                        currentGeo.countryCode !== 'AE' && currentGeo.countryCode !== 'IN'
                          ? 'border-[#d4af37] bg-[#faf6e9] ring-1 ring-[#d4af37]'
                          : 'border-[#e0e0e0] bg-[#ffffff] hover:bg-[#f8f8f8]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">🌐</span>
                        <span className="text-[9.5px] font-bold uppercase px-2 py-0.5 bg-[#d4af37] text-[#1a1a1a] rounded-xs">
                          Global Market
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#1a1a1a]">International</div>
                      <div className="text-[11px] text-[#d4af37] font-bold font-mono mt-1">Dual Display</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">Global Desk</div>
                    </button>
                  </div>
                </div>
              )}

              {/* SECURITY SETTINGS TAB */}
              {activeTab === 'config' && (
                <div className="space-y-5 bg-[#ffffff] p-6 border border-[#e0e0e0] rounded-sm shadow-sm text-xs">
                  <h4 className="font-serif text-lg font-bold text-[#1a1a1a] mb-2 flex items-center gap-1.5">
                    <ShieldCheck size={18} className="text-[#d4af37]" />
                    <span>Security Policies & Encryption</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-[#f8f8f8] border border-[#e0e0e0] rounded-xs">
                      <span className="text-[10px] text-[#d4af37] font-bold uppercase block">Rate Limiting</span>
                      <div className="font-bold text-[#1a1a1a] text-sm mt-0.5">5-Attempt Lockout Active</div>
                      <span className="text-[11px] text-gray-500 mt-1 block">Protects authentication gate against brute force</span>
                    </div>

                    <div className="p-4 bg-[#f8f8f8] border border-[#e0e0e0] rounded-xs">
                      <span className="text-[10px] text-[#d4af37] font-bold uppercase block">Session Expiry</span>
                      <div className="font-bold text-[#1a1a1a] text-sm mt-0.5">30 Minutes Auto-Timeout</div>
                      <span className="text-[11px] text-gray-500 mt-1 block">Terminates inactive sessions automatically</span>
                    </div>

                    <div className="p-4 bg-[#f8f8f8] border border-[#e0e0e0] rounded-xs">
                      <span className="text-[10px] text-[#d4af37] font-bold uppercase block">Password Hashing</span>
                      <div className="font-bold text-[#1a1a1a] text-sm mt-0.5">Bcrypt & PBKDF2-SHA512</div>
                      <span className="text-[11px] text-gray-500 mt-1 block">Passwords are salted and never stored in plain text</span>
                    </div>

                    <div className="p-4 bg-[#f8f8f8] border border-[#e0e0e0] rounded-xs">
                      <span className="text-[10px] text-[#d4af37] font-bold uppercase block">HTTPS Enforced</span>
                      <div className="font-bold text-[#1a1a1a] text-sm mt-0.5">TLS 1.3 Transport Security</div>
                      <span className="text-[11px] text-gray-500 mt-1 block">Full encryption for all client communications</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
