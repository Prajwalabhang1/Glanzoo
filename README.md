# 🛍️ Glanzoo E-Commerce Platform

<div align="center">

**A modern, production-grade e-commerce platform for ethnic fashion wear**

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.10-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack) • [API](#-api-reference)

</div>

---

## ✨ Features

### 🛒 Customer Features
- **Product Discovery** - Browse curated collections of ethnic wear
- **Advanced Search & Filters** - Find products by category, price, size
- **User Authentication** - Secure login and registration
- **Wishlist Management** - Save favorite products
- **Shopping Cart** - Add, update, and manage cart items
- **Checkout Flow** - Seamless ordering with COD or online payment
- **Order Tracking** - Track order status from confirmation to delivery
- **Coupon System** - Apply discount codes during checkout
- **Responsive Design** - Optimized for mobile, tablet, and desktop

### 👑 Admin Features
- **Dashboard Analytics** - Revenue, orders, product stats
- **Product Management** - Create, update, delete products
- **Order Management** - Update order status, add tracking numbers
- **Coupon Management** - Create and manage discount coupons
- **User Management** - View customer accounts
- **Inventory Tracking** - Real-time stock management

### 💳 Payment Integration
- **Razorpay Gateway** - Secure online payments
- **COD Support** - Cash on delivery option
- **Payment Verification** - Automatic signature validation
- **Stock Management** - Auto-decrement on successful payment

### 🔐 Security Features
- **NextAuth v5** - Industry-standard authentication
- **Password Hashing** - bcryptjs with salt rounds
- **JWT Sessions** - Secure, scalable session management
- **Role-Based Access Control** - Admin and customer roles
- **Route Protection** - Middleware-based authorization
- **Input Validation** - Zod schema validation
- **CSRF Protection** - Built-in Next.js security

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/glanzoo.git
cd glanzoo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database and seed data
npm run setup

# Start development server
npm run dev
```

Visit **http://localhost:3000** to see your application!

📖 **Detailed setup instructions:** See [QUICKSTART.md](./QUICKSTART.md)

### Test Credentials

**Admin Login:**
- Email: `admin@glanzoo.com`
- Password: `admin123`

**Customer Login:**
- Email: `customer@example.com`
- Password: `customer123`

**Test Coupons:**
- `WELCOME20` - 20% off (min ₹999, max ₹500)
- `FLAT500` - ₹500 off (min ₹2499)
- `FREESHIP` - ₹100 shipping discount

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **State Management:** React Query (TanStack Query)
- **Form Validation:** Zod
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js (via Next.js API Routes)
- **Database:** SQLite (dev) / PostgreSQL (production)
- **ORM:** Prisma 5
- **Authentication:** NextAuth v5
- **Password Hashing:** bcryptjs
- **JWT:** jsonwebtoken

### Payment & Services
- **Payment Gateway:** Razorpay
- **Email Service:** Resend
- **Image Optimization:** Sharp

### Development Tools
- **Linting:** ESLint
- **TypeScript:** Full type safety
- **Database Studio:** Prisma Studio

---

## 📐 Architecture

```
┌─────────────────────────────────────────┐
│          Next.js App Router             │
│  (Server Components + Client Components)│
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐          ┌────▼────┐
│  Pages │          │   API   │
│  /app  │          │ Routes  │
└────┬───┘          └────┬────┘
     │                   │
     │              ┌────▼────────┐
     │              │  NextAuth   │
     │              │  Middleware │
     │              └────┬────────┘
     │                   │
┌────▼───────────────────▼─────┐
│       Prisma ORM              │
│  (Type-safe Database Client)  │
└───────────────┬───────────────┘
                │
       ┌────────▼────────┐
       │   PostgreSQL    │
       │   (Production)  │
       └─────────────────┘
```

---

## 📚 Documentation

### Project Structure
```
glanzoo/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── products/       # Product APIs
│   │   ├── orders/         # Order management
│   │   ├── wishlist/       # Wishlist functionality
│   │   ├── payment/        # Payment processing
│   │   ├── coupons/        # Coupon validation
│   │   └── admin/          # Admin-only APIs
│   ├── (routes)/           # Application pages
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── ui/                 # Reusable UI components
│   ├── layout/             # Layout components
│   ├── product/            # Product components
│   └── cart/               # Cart components
├── lib/                     # Utilities & services
│   ├── auth.ts             # NextAuth config
│   ├── prisma.ts           # Prisma client
│   ├── validations.ts      # Zod schemas
│   ├── auth-utils.ts       # Auth helpers
│   └── razorpay.ts         # Payment service
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Seed script
│   └── migrations/         # Migration files
├── types/                   # TypeScript definitions
├── middleware.ts           # Route protection
├── QUICKSTART.md           # Setup guide
└── README.md               # This file
```

### Database Schema

**Core Models:**
- `User` - Customer and admin accounts
- `Product` - Product information
- `ProductVariant` - Size/SKU variants
- `Category` - Product categories
- `Order` - Customer orders
- `OrderItem` - Individual order items
- `WishlistItem` - User wishlists
- `Coupon` - Discount coupons
- `Session` - Authentication sessions
- `Review` - Product reviews (future)

**Key Relations:**
- One-to-Many: User → Orders, Product → Variants
- Many-to-Many: User → Wishlist (via WishlistItem)

📖 **Full schema:** See [prisma/schema.prisma](./prisma/schema.prisma)

---

## 🔌 API Reference

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | List all active products |
| `/api/products/[slug]` | GET | Get product details |
| `/api/auth/register` | POST | User registration |
| `/api/auth/[...nextauth]` | GET/POST | Authentication |
| `/api/coupons/validate` | GET | Validate coupon code |
| `/api/orders` | POST | Create new order |

### Authenticated Endpoints
*(Requires login)*

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/wishlist` | GET | Get user wishlist |
| `/api/wishlist` | POST | Add to wishlist |
| `/api/wishlist` | DELETE | Remove from wishlist |
| `/api/orders` | GET | Get user orders |

### Admin Endpoints
*(Requires admin role)*

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/dashboard/stats` | GET | Dashboard statistics |
| `/api/admin/products` | GET | List all products (admin view) |
| `/api/admin/products` | POST | Create new product |
| `/api/admin/orders/[id]` | GET | Get order details |
| `/api/admin/orders/[id]` | PATCH | Update order status |
| `/api/admin/coupons` | GET | List all coupons |
| `/api/admin/coupons` | POST | Create coupon |

📖 **Detailed API docs:** See [QUICKSTART.md#api-testing](./QUICKSTART.md#-api-testing)

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run setup            # Complete setup (generate + migrate + seed)
npm run db:seed          # Seed database
npx prisma studio        # Visual database editor
npx prisma generate      # Regenerate Prisma Client
npx prisma migrate dev   # Create & apply migration

# Utilities
npm run lint             # Run ESLint
```

### Environment Variables

Create a `.env` file based on `.env.example`:

**Required:**
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret for JWT signing

**Optional:**
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` - Payment gateway
- `RESEND_API_KEY` - Email service
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics

---

## 🎨 Design System

### Color Palette
- **Primary:** Black (#000000)
- **Accent:** Gold gradient (#F59E0B → #D97706)
- **Surface:** Neutral grays
- **Status:** Success (green), Warning (orange), Error (red)

### Typography
- **Headings:** SF Pro Display, system-ui
- **Body:** Inter, SF Pro Text

### Components
- Modern button variants (primary, secondary, outline, ghost)
- Premium card designs with hover effects
- Skeleton loaders for loading states
- Toast notifications
- Modal dialogs
- Form inputs with validation states

---

## 🚢 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Environment Setup

1. **Database:** Migrate to PostgreSQL
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/glanzoo"
   ```

2. **Environment Variables:** Set all required variables

3. **Run Migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Seed Production Data** (optional)

### Deployment Platforms

Compatible with:
- ✅ Vercel (recommended)
- ✅ Netlify
- ✅ Railway
- ✅ AWS / GCP / Azure
- ✅ Docker

---

## 📈 Roadmap

### Phase 1: Foundation ✅
- [x] Next.js setup with TypeScript
- [x] Database schema design
- [x] Design system implementation
- [x] Error boundaries

### Phase 2: Backend & APIs ✅
- [x] Authentication system (NextAuth)
- [x] Payment gateway (Razorpay)
- [x] Wishlist functionality
- [x] Coupon management
- [x] Admin APIs

### Phase 3: Frontend UI/UX 🚧 *In Progress*
- [ ] Hero banner
- [ ] Product filters
- [ ] Cart UI enhancements
- [ ] Checkout flow UI
- [ ] Admin dashboard frontend
- [ ] User account pages

### Phase 4: Advanced Features 📅 *Planned*
- [ ] Email notifications
- [ ] WhatsApp notifications
- [ ] Invoice generation
- [ ] Product reviews & ratings
- [ ] Search functionality
- [ ] Product recommendations

### Phase 5: Optimization & Testing 📅 *Planned*
- [ ] Performance optimization
- [ ] SEO enhancements
- [ ] Load testing
- [ ] Security audit
- [ ] Accessibility improvements

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Support

For support and questions:
- 📧 Email: support@glanzoo.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/glanzoo/issues)

---

<div align="center">

**Built with ❤️ for Glanzoo E-Commerce Platform**

⭐ Star this repo if you find it helpful!

</div>
