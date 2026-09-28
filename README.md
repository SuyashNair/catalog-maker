# Catalog Maker - High-Speed Product Catalog Platform

A reusable, mobile-first product catalog platform that imports products from Shopify and WooCommerce, stores them in a central database, and serves a blazing-fast catalog experience.

## Architecture

```
Shopify / WooCommerce API
        ↓
  Import & Sync Engine
        ↓
  MongoDB Database
        ↓
  Express.js REST API
        ↓
  Next.js Frontend (2 Designs)
```

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Frontend:** Next.js 14 (App Router), React 18, CSS Modules
- **Integrations:** Shopify Admin API, WooCommerce REST API
- **Auth:** JWT-based admin authentication

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed    # Seeds 110 demo products + admin user
npm run dev     # Starts API on port 5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev     # Starts on port 3000
```

### 3. Access

- **Catalog:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **Admin Login:** admin@catalogmaker.com / admin123
- **API:** http://localhost:5000/api

## Features

### Core
- ✅ Shopify API integration
- ✅ WooCommerce API integration
- ✅ 55 Shopify + 55 WooCommerce demo products
- ✅ Import & Sync engine with error tracking
- ✅ Full Admin Panel (CRUD, import, sync, settings)
- ✅ Two catalog designs (Elegant Dark, Vibrant Modern)
- ✅ Design switching from admin

### Frontend
- ✅ Mobile-first responsive design
- ✅ Skeleton loading states
- ✅ Lazy image loading
- ✅ Product search & category filtering
- ✅ Product detail with image lightbox
- ✅ Related products
- ✅ WhatsApp enquiry (multi-product)
- ✅ Wishlist (localStorage, no login)
- ✅ Pagination / Load More
- ✅ WhatsApp FAB

### Backend
- ✅ Internal REST API (independent of external formats)
- ✅ In-memory response caching
- ✅ Full-text search
- ✅ Compound database indexes
- ✅ Sync error recording
- ✅ Admin JWT authentication

## API Endpoints

### Public
| Endpoint | Description |
|----------|-------------|
| GET /api/config | Catalog configuration |
| GET /api/categories | All visible categories |
| GET /api/products | Paginated product list |
| GET /api/products/featured | Featured products |
| GET /api/products/:slug | Product detail + related |

### Admin (JWT required)
| Endpoint | Description |
|----------|-------------|
| POST /api/admin/login | Admin login |
| GET /api/admin/dashboard | Dashboard stats |
| CRUD /api/admin/products | Product management |
| CRUD /api/admin/categories | Category management |
| POST /api/admin/import | Trigger import |
| POST /api/admin/sync | Trigger sync |
| GET /api/admin/sync-logs | Sync history |
| GET/PUT /api/admin/settings | Settings |

## Demo Data

The seeder creates:
- 8 categories (Electronics, Fashion, Home & Living, etc.)
- 55 Shopify-sourced products
- 55 WooCommerce-sourced products
- Default settings with WhatsApp config
- Admin user (admin@catalogmaker.com / admin123)
