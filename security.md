# OFFSIDE — Complete Website & Admin Dashboard with Security

Build a complete, production-ready e-commerce platform for OFFS1DE (multi-sport jersey brand) with full security.

## BRAND
- Name: OFFS1DE (number 1, not letter I)
- Tagline: "Every Team. Every Sport. One Drop."
- Instagram: @Offs1de.
- Dark, premium, minimal aesthetic

## FRONTEND WEBSITE

### Header
- Logo + "OFFS1DE" text (serif, bold)
- Nav: New Arrivals | How to Order
- Currency toggle: AED / INR
- Instagram icon: @Offs1de. (clickable link)
- WhatsApp icon: Detected number (clickable)
- Cart icon: Item count badge

### Hero Section
- Male model(s) wearing OFFS1DE jersey (streetwear aesthetic, urban)
- Dark, moody lighting
- Headline: "Every Team. Every Sport. One Drop." (serif, large, cream)
- Subheadline: "Retro grails, oversized kits, archive drops, bespoke custom" (muted tan)
- CTA: "SHOP NEW ARRIVALS →" (gold on dark)

### Product Grid
- 4 columns (desktop) / 2 (tablet) / 1 (mobile)
- Image placeholder (4:5 aspect ratio)
- Product name (serif)
- Category/meta (small, tan)
- Sleeve selector: Half-sleeve | Full-sleeve (toggle buttons)
- Pricing (FIXED):
  - Half-sleeve: AED 35 / ₹650
  - Full-sleeve: AED 40 / ₹720
  - Primary/secondary flip based on geolocation
- Buttons:
  - "ORDER VIA WHATSAPP" (pre-filled, uses detected number)
  - "ORDER VIA INSTAGRAM @Offs1de." (pre-filled DM)
  - "+ ADD TO CART"

### How It Works
- 3-step explanation
- Step 1: Pick jersey + sleeve type
- Step 2: Click WhatsApp/Instagram → pre-filled message
- Step 3: Confirm size & send payment QR screenshot

### Cart Drawer (Slide-in from Right)
- Show items, remove buttons
- Total in both AED & INR
- "SEND ORDER ON WHATSAPP" button (uses detected number)
- "Opens WhatsApp with items pre-filled. Nothing charged here."

### Footer
- Left: Logo + "OFFS1DE" + tagline
- Center: Links (New Arrivals | How to Order)
- Right: WhatsApp (detected number), Instagram @Offs1de.
- Bottom: © 2026 OFFS1DE | Privacy | Terms

## GEOLOCATION (Client-Side, No Backend Needed)
- Detect user country from IP
- UAE users: Show AED primary, INR secondary, +971 50 123 4567
- India users: Show INR primary, AED secondary, +91 [INDIA_NUMBER]
- Other: Show both equally
- Currency toggle: Allow user to switch AED ↔ INR anytime

## PRICING (Fixed, Not Converted)
- Half-sleeve: AED 35 / ₹650 (always)
- Full-sleeve: AED 40 / ₹720 (always)
- Display: "AED XX / ₹XXX" format
- Primary/secondary flip based on location + toggle

## FRONTEND FUNCTIONALITY
- Geolocation on load (detect country from IP)
- Sleeve selector updates price instantly
- Currency toggle swaps AED ↔ INR everywhere
- Cart: Add/remove items, calculate total
- WhatsApp links: Pre-fill with product, sleeve, price (detected currency), detected number
- Instagram links: Pre-fill with product details, open @Offs1de.
- Responsive: Mobile, tablet, desktop
- Local storage for cart persistence

## IMAGES
- Use placeholder gray boxes (4:5 ratio) for now
- Later: Replace with Cloudinary URLs (just update URL in code)

## DESIGN
- Colors: #0a0a0a (dark), #e8e3d8 (cream text), #d4af37 (gold accent)
- Typography: Serif for headlines (premium), sans-serif for body
- Whitespace: Generous, airy layout
- Hover: Gold accents, smooth transitions

## ADMIN DASHBOARD (Backend + Security)

### Admin Login Page (SECURED)
- Username and password fields
- Simple, clean design (match website aesthetic)
- "Remember me" checkbox (optional)
- Forgot password link (optional)

### Authentication & Security (CRITICAL)
- Password hashing: Use bcrypt (never store plain passwords)
- Session tokens: Create secure session after login
- HTTPS only: All connections encrypted
- Session expiry: Auto-logout after 30 minutes of inactivity
- Login attempt limits: Max 5 failed attempts, then lockout
- Database encryption: Encrypt WhatsApp numbers, customer names in database

### Dashboard Home (Authenticated)
- Order summary stats (only visible if logged in)
  - Total orders
  - Pending orders
  - Confirmed orders
  - Shipped orders

### Orders Table (Secured)
- Columns: Order ID | Customer Name | Products | Sleeve Type | Price (AED) | Contact (WA/IG) | Date | Status | Actions
- Status: Pending → Confirmed → Shipped
- Action buttons: Edit | Mark Confirmed | Mark Shipped
- Search/filter orders (optional)

### Add New Order (Manual Entry, Secured)
- Form:
  - Customer Name
  - WhatsApp Number
  - Instagram Handle (optional)
  - Select Products (dropdown)
  - Sleeve type per product
  - Total price (auto-calculate)
  - Notes (size, address, etc.)
  - Submit button

### Order Details Page (Secured)
- View full order info
- Edit status (Pending → Confirmed → Shipped)
- Add/edit notes
- Customer contact clickable (WhatsApp/Instagram links)
- Audit log: Show who made changes and when

### Logout
- Logout button in dashboard
- Clear session token
- Redirect to login page

## BACKEND REQUIREMENTS (Secured)

### Database
- Store orders: Order ID, customer name, WhatsApp, Instagram, products, price, date, status, notes
- Encrypt sensitive fields: WhatsApp numbers, customer names
- Regular backups: Daily automated backups

### Authentication
- Username: admin (or configurable)
- Password: User-set during setup (hashed with bcrypt)
- Session tokens: JWT or similar
- Password requirements: Min 8 characters, alphanumeric

### API Endpoints (All Secured - Require Login)
- POST /api/auth/login (authenticate admin)
- GET /api/orders (fetch all orders)
- POST /api/orders (create new order)
- PUT /api/orders/:id (update order status)
- DELETE /api/orders/:id (delete order)
- POST /api/auth/logout (end session)

### Security Headers
- Content-Security-Policy
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security (HTTPS)

### Data Protection
- Input validation: Sanitize all inputs
- SQL injection prevention: Use parameterized queries
- CORS: Only allow requests from your domain
- Rate limiting: Prevent brute force attacks

## DEPLOYMENT & HOSTING

### Frontend
- Vercel or Netlify (auto-deploy from GitHub)
- HTTPS: Automatic SSL certificate

### Backend
- Heroku, Railway, or similar
- HTTPS: Mandatory encrypted connection
- Environment variables: Store secrets (passwords, database URLs) securely

### Database
- MongoDB Atlas (free tier available)
- Encryption at rest: Enable database encryption
- Regular backups: Automated daily backups

## PLACEHOLDERS IN CODE
- [INSERT_INDIA_WHATSAPP_NUMBER] — User fills in
- [INSERT_ADMIN_USERNAME] — User sets during setup
- [INSERT_ADMIN_PASSWORD] — User sets during setup (will be hashed)
- [PLACEHOLDER_IMAGE_URL] — Replace with Cloudinary URLs later
- [INSERT_DATABASE_URL] — Connection string for MongoDB

## DELIVERABLE
- Frontend: Single HTML file (clean, production-ready, HTTPS)
- Frontend: Embedded CSS + JavaScript
- Backend: Secured API with authentication
- Backend: Admin login with password hashing
- Backend: Order management system
- Database: MongoDB with encryption
- No dependencies required for frontend
- Mobile-tested, responsive
- Production-ready with security best practices
- Ready to deploy (Vercel for frontend, Heroku/Railway for backend)

## SECURITY CHECKLIST (Before Launch)
- ✅ Admin login working (password hashed)
- ✅ Session management secure
- ✅ HTTPS enabled everywhere
- ✅ Database backup automated
- ✅ Sensitive data encrypted
- ✅ Input validation implemented
- ✅ Rate limiting enabled
- ✅ CORS configured
- ✅ Environment variables set
- ✅ Tested from different networks
