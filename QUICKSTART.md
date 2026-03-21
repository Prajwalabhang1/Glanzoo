# 🚀 Glanzoo E-Commerce Platform - Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

## Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# Razorpay (optional for payment testing)
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

> **Note:** Generate a secure NEXTAUTH_SECRET:
> ```bash
> openssl rand -base64 32
> ```

### 3. Database Setup & Seeding
Run the complete setup command:

```bash
npm run setup
```

This will:
- ✅ Generate Prisma Client
- ✅ Run database migrations
- ✅ Seed database with:
  - Admin user
  - Sample customer
  - 6 products with variants
  - 3 test coupons
  - Categories

**OR** run steps individually:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 📝 Test Credentials

### Admin Access
- **Email:** `admin@glanzoo.com`
- **Password:** `admin123`
- **Access:** `/admin/*` routes

### Customer Access
- **Email:** `customer@example.com`
- **Password:** `customer123`
- **Access:** User dashboard, wishlist, orders

---

## 🎫 Test Coupons

| Code | Type | Discount | Min Order | Max Discount |
|------|------|----------|-----------|--------------|
| `WELCOME20` | Percentage | 20% | ₹999 | ₹500 |
| `FLAT500` | Fixed | ₹500 | ₹2499 | - |
| `FREESHIP` | Fixed | ₹100 | ₹999 | - |

---

## 🧪 API Testing

### Public Endpoints

**Get Products:**
```bash
GET /api/products
```

**Validate Coupon:**
```bash
GET /api/coupons/validate?code=WELCOME20&total=2000
```

**Create Order:**
```bash
POST /api/orders
Content-Type: application/json

{
  "customerEmail": "test@example.com",
  "customerName": "Test User",
  "customerPhone": "9876543210",
  "shippingAddress": {...},
  "items": [...],
  "subtotal": 2000,
  "total": 2000,
  "paymentMethod": "COD"
}
```

### Authenticated Endpoints
(Requires login)

**Get Wishlist:**
```bash
GET /api/wishlist
Authorization: Bearer <token>
```

**Add to Wishlist:**
```bash
POST /api/wishlist
Content-Type: application/json

{
  "productId": "product-id-here"
}
```

### Admin Endpoints
(Requires admin role)

**Dashboard Stats:**
```bash
GET /api/admin/dashboard/stats
Authorization: Bearer <admin-token>
```

**List All Products:**
```bash
GET /api/admin/products
```

**Update Order Status:**
```bash
PATCH /api/admin/orders/{orderId}
Content-Type: application/json

{
  "status": "SHIPPED",
  "trackingNumber": "TRACK123456"
}
```

---

## 📂 Project Structure

```
glanzoo/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── products/     # Product APIs
│   │   ├── orders/       # Order management
│   │   ├── wishlist/     # Wishlist API
│   │   ├── payment/      # Razorpay integration
│   │   ├── coupons/      # Coupon validation
│   │   └── admin/        # Admin APIs
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── (other pages)/
├── components/            # React components
│   ├── ui/               # UI components
│   ├── layout/           # Layout components
│   ├── product/          # Product components
│   └── cart/             # Cart components
├── lib/                   # Utilities & services
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── validations.ts    # Zod schemas
│   ├── auth-utils.ts     # Auth helpers
│   └── razorpay.ts       # Payment service
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── seed.ts           # Seed script
│   └── migrations/       # Migration files
└── types/                 # TypeScript definitions
```

---

## 🔧 Common Commands

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
```

### Database
```bash
npx prisma studio        # Open Prisma Studio (visual DB editor)
npx prisma migrate dev   # Create & apply migration
npx prisma generate      # Regenerate Prisma Client
npm run db:seed          # Re-seed database
npx prisma migrate reset # Reset DB (⚠️ deletes all data)
```

### Utilities
```bash
npm run lint             # Run ESLint
```

---

## 🐛 Troubleshooting

### Issue: Prisma Client errors
**Solution:**
```bash
npx prisma generate
```

### Issue: TypeScript errors after schema changes
**Solution:**
```bash
# Restart dev server after regenerating
npx prisma generate
npm run dev
```

### Issue: Database locked (Windows)
**Solution:**
```bash
# Stop all dev servers, then:
npx prisma generate
npm run dev
```

### Issue: Port 3000 already in use
**Solution:**
```bash
# Next.js will automatically use next available port (3001, 3002, etc.)
# Or manually kill process:
# Windows: netstat -ano | findstr :3000
# Then: taskkill /PID <PID> /F
```

---

## 🌟 Features Implemented

### Phase 1: Foundation ✅
- Production-grade Next.js configuration
- Enhanced database schema with indexes
- Validation schemas (Zod)
- Error boundaries
- Premium design system

### Phase 2: Backend & APIs ✅
- **Authentication:** NextAuth v5 with JWT
- **Payment:** Razorpay integration
- **Wishlist:** Full CRUD API
- **Coupons:** Validation & management
- **Admin Dashboard APIs:** Complete management system
- **Role-based Access:** CUSTOMER/ADMIN roles
- **Route Protection:** Middleware for secure routes

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [Razorpay API Docs](https://razorpay.com/docs/api)

---

## 🚀 Next Steps

1. **Test the application** - Register, login, browse products
2. **Try admin features** - Login as admin, view dashboard
3. **Test payment flow** - Add Razorpay credentials for live testing
4. **Customize products** - Add your own product images and data
5. **Deploy** - Ready for production deployment

---

**Built with ❤️ for Glanzoo E-Commerce Platform**
