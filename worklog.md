---
Task ID: 1
Agent: Main Agent
Task: Fix all IBS-Pro features - replace Prisma with pg for Supabase compatibility

Work Log:
- Analyzed all 41 API route files and identified Prisma + pgbouncer incompatibility as root cause
- Installed `pg` and `@types/pg` packages
- Created new `/src/lib/db.ts` using pg Pool with pgbouncer-compatible settings (no prepared statements)
- Rewrote `/src/lib/api-auth.ts` to use raw SQL queries instead of Prisma
- Rewrote 4 auth API routes (login, admin-login, register, verify)
- Dispatched 2 parallel agents to rewrite all 17 admin API routes and 24 user API routes
- Updated `package.json` to remove Prisma from build/postinstall pipeline
- Fixed critical frontend bugs across all components:
  - Fixed `fetchItems()` → `loadItems()` in ExpensesPage, WorkOrdersPage, BookingsPage, CertificatesPage
  - Fixed `fetchLinks()` → `loadLinks()` in ShkPage
  - Fixed `fetchCustomers()` → `loadCustomers()` in CustomersPage
  - Fixed `fetchSettings()` → `loadSettings()` in UserSettingsPage (5 occurrences)
  - Fixed `fetchInvoices()` → `loadInvoices()` in InvoicesPage
  - Fixed field name mismatches: `carMake/carModel` → `vehicleMake/vehicleModel` in IncomePage, WorkOrdersPage, BookingsPage, CertificatesPage
  - Fixed `amount` → `totalAmount` in IncomePage and UserHome
  - Fixed `total` → `totalAmount` in IncomePage
  - Fixed dashboard field names: `totalIncome` → `totalIncomeThisMonth`, `totalExpenses` → `totalExpensesThisMonth`
  - Fixed `recentBookings` → `upcomingBookings`, `customer` → `customerName`, `date` → `bookingDate`
  - Fixed invoices response destructuring (API returns `{ invoices, summary }`)
  - Fixed invoice items field names: `amount` → `quantity * unitPrice`
  - Fixed invoice status toggle URL: `/invoices/${id}/status` → `/invoices/${id}`
  - Fixed `customer` → `customerName` in InvoicesPage
- Created `/src/components/admin/shared.ts` with `getAdminAuthHeaders()` helper
- Added Authorization headers to ALL admin API calls in 8 admin components (AdminHome, CompaniesPage, UsersPage, RegistrationsPage, AuditLogsPage, SupportChatPage, AdminSettingsPage, DataImportPage)
- Fixed AdminHome field name mapping: `companies` → `totalCompanies`, etc.

Stage Summary:
- All 41 API routes now use raw SQL via pg library (no Prisma dependency at runtime)
- All frontend components now use correct function names and field names
- All admin and user API calls include proper Authorization headers
- Build pipeline no longer requires Prisma generate
- Zero lint errors in application code (3 errors in old utility scripts only)
- All fixes ready for Vercel deployment
