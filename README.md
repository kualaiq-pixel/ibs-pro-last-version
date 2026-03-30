<div align="center">

# 🏢 IBS-Pro

**Professional Business Management System**

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## 📋 Features

### 🏠 Landing Page
- Professional design with animated hero section
- 10 feature showcase cards
- Pricing (€40/month or €360/year)
- Testimonials from businesses
- Contact form
- **4 languages**: English 🇬🇧, Finnish 🇫🇮, Swedish 🇸🇪, Arabic 🇸🇦 (RTL)
- Dark/Light theme toggle
- **PWA** - Installable on any device

### 🔐 Admin Panel (Secret: `/sec-ad-admin`)
- Dashboard with stats overview
- **Companies** - Full CRUD management
- **Users** - Role-based (Admin, Manager, Accountant, Staff, Viewer)
- **Registrations** - Approve / Reject / 14-Day Trial
- **Support Chat** - Real-time messaging with customers
- **Data Import/Export** - Full JSON backup & restore
- **Audit Logs** - Complete activity tracking
- **Settings** - Manage contact info on landing page

### 👤 User Dashboard (11 Pages)
- **Home** - Monthly stats & recent activity
- **Income** - Track with auto-receipt/invoice generation (Finnish reference numbers)
- **Expenses** - By category with VAT support
- **Invoices** - Manage Pending/Paid status
- **Bookings** - Schedule with vehicle & service tracking (37+ services)
- **Work Orders** - Parts, labor, quality checks, certificates
- **Maintenance Certificates** - 8-point inspection system
- **SHK Service** - External system link management
- **Customers** - Full CRM
- **Reports** - Financial reports with charts
- **Settings** - Company details, services, categories
- **💬 Support Chat** - Floating support widget

---

## 🚀 Quick Start (Vercel + Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com/) → Sign up / Log in
2. Click **"New Project"**
3. Fill in: **Name** = `ibs-pro`, **Database Password** = (choose a strong password), **Region** = (closest to you)
4. Wait for the project to be created (~2 minutes)

### Step 2: Get Database URLs

1. In Supabase dashboard → **Settings** → **Database**
2. Find **Connection string** → Select **"URI"** tab
3. Copy the connection string — it looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
4. **DATABASE_URL** (for app runtime - use the pooler connection):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```
5. **DIRECT_DATABASE_URL** (for migrations):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Step 3: Setup Database

```bash
# Clone the repo
git clone https://github.com/kualaiq-pixel/ibs-pro-last-version.git
cd ibs-pro-last-version

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and paste your DATABASE_URL
# IMPORTANT: URL-encode your password (replace @ with %40)
# Example: If password is "My@Pass", use "My%40Pass"
nano .env

# Create database tables
node scripts/create-tables.js

# Seed admin user
DATABASE_URL="your-database-url" npx tsx prisma/seed.ts
```

### Step 4: Deploy to Vercel

**Option A: Via GitHub (Recommended)**

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/ibs-pro-last-version.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com/) → Sign up with GitHub
3. Click **"Add New Project"** → Import your `ibs-pro-last-version` repo
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
5. **Environment Variables** → Add:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Supabase pooler URL (with `?pgbouncer=true`) |
   | `NEXT_PUBLIC_APP_URL` | Your Vercel URL |
6. Click **"Deploy"**

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_APP_URL

# Redeploy with env vars
vercel --prod
```

### Step 5: Run Seed on Production

After first deployment, seed the admin user:

```bash
DATABASE_URL="your-supabase-pooler-url" npx tsx prisma/seed.ts
```

---

## 📦 Install on Your Own Hosting

### Prerequisites
- Node.js 18+ or Bun
- A PostgreSQL database (Supabase, Neon, Railway, or self-hosted)
- Git

### Method 1: VPS / Dedicated Server (Node.js)

```bash
# 1. Clone the repository
git clone https://github.com/YOUR-USERNAME/ibs-pro-last-version.git
cd ibs-pro-last-version

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your database URL and app URL

# 4. Setup database
node scripts/create-tables.js
DATABASE_URL="your-database-url" npx tsx prisma/seed.ts

# 5. Build for production
npm run build

# 6. Start the server
npm start
# Server runs on port 3000

# 7. (Optional) Use PM2 for process management
npm i -g pm2
pm2 start npm --name "ibs-pro" -- start
pm2 save
pm2 startup
```

### Method 2: Docker

```dockerfile
# Dockerfile is included. Build and run:
docker build -t ibs-pro .
docker run -p 3000:3000 --env-file .env ibs-pro
```

### Method 3: Vercel (Cloud)
See **Quick Start** section above.

### Method 4: Railway
1. Go to [railway.app](https://railway.app/)
2. New Project → Deploy from GitHub
3. Add PostgreSQL database
4. Set environment variables
5. Railway auto-detects Next.js and deploys

### Method 5: Netlify (with adapter)
```bash
# Install Netlify adapter
npm i @netlify/next
# Update next.config.ts with Netlify settings
# Deploy via Netlify CLI or GitHub integration
```

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Supabase pooler, with `?pgbouncer=true`) |
| `NEXT_PUBLIC_APP_URL` | ❌ | Your app's public URL |

---

## 🔑 Default Admin Access

| Field | Value |
|-------|-------|
| **Admin URL** | `https://your-domain.com/sec-ad-admin` |
| **Username** | `admin` |
| **Password** | `admin123` |

> ⚠️ **IMPORTANT**: Change the admin password immediately after first login!

---

## 🗄️ Database Schema

The system uses **20 database tables**:

`Admin` · `Company` · `Registration` · `User` · `Customer` · `Income` · `Expense` · `Invoice` · `InvoiceItem` · `Booking` · `WorkOrder` · `Certificate` · `Service` · `Category` · `ShkLink` · `AuditLog` · `ContactInfo` · `SupportMessage` · `Session`

View & edit with:
```bash
npx prisma studio
```

---

## 📁 Project Structure

```
ibs-pro/
├── prisma/
│   ├── schema.prisma          # Database schema (PostgreSQL)
│   └── seed.ts                # Seed data (admin user + default contacts)
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icons/                 # App icons
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main SPA router
│   │   ├── layout.tsx         # Root layout (PWA, meta)
│   │   ├── globals.css        # Global styles + theme
│   │   └── api/               # API routes
│   │       ├── auth/          # Login, Register, Admin login
│   │       ├── admin/         # Admin CRUD endpoints
│   │       └── user/          # User CRUD endpoints
│   ├── components/
│   │   ├── landing/           # Landing page (Hero, Features, etc.)
│   │   ├── auth/              # Login, Register, Admin login pages
│   │   ├── admin/             # Admin dashboard (8 pages)
│   │   ├── user/              # User dashboard (11 pages + chat)
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       ├── store.ts           # Zustand state management
│       ├── i18n.ts            # Translations (EN, FI, SV, AR)
│       ├── auth.ts            # Auth utilities + Finnish ref numbers
│       ├── db.ts              # Prisma client
│       └── api-auth.ts        # API auth middleware
├── .env.example               # Environment template
├── .gitignore
├── next.config.ts             # Next.js config
├── tailwind.config.ts         # Tailwind config
├── package.json
└── README.md
```

---

## 🔧 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework (App Router) |
| **TypeScript 5** | Type safety |
| **Tailwind CSS 4** | Styling |
| **shadcn/ui** | UI component library |
| **Prisma 6** | ORM (PostgreSQL) |
| **Supabase** | PostgreSQL hosting |
| **Zustand** | Client state management |
| **Framer Motion** | Animations |
| **next-themes** | Dark/Light mode |
| **Recharts** | Charts & reports |
| **bcryptjs** | Password hashing |
| **Lucide** | Icons |

---

## 🌐 Multi-Language

The system supports **4 languages** with full RTL support:

| Language | Code | Direction |
|----------|------|-----------|
| English | `en` | LTR |
| Finnish (Suomi) | `fi` | LTR |
| Swedish (Svenska) | `sv` | LTR |
| Arabic (العربية) | `ar` | RTL |

All 249+ translation keys are available in each language.

---

## 📱 PWA (Progressive Web App)

IBS-Pro is a fully installable PWA:
- **Desktop**: Chrome/Edge → "Install" icon in address bar
- **iOS**: Safari → Share → "Add to Home Screen"
- **Android**: Chrome → "Add to Home Screen"
- Works offline with service worker caching

---

## 🛡️ Security

- Password hashing with bcrypt
- Session-based authentication with 24h expiry
- Role-based access control (Admin, Manager, Accountant, Staff, Viewer)
- Admin approval required for new accounts
- Audit logging for all admin actions
- Secret admin URL path (`/sec-ad-admin`)

---

## 📄 License

MIT License — free for personal and commercial use.

---

<div align="center">

**Built with ❤️ for professional business management**

</div>
