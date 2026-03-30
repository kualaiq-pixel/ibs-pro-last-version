const { PrismaClient } = require('@prisma/client');

async function setup() {
  const url = 'postgresql://postgres.zrddjzisqrpajeqrrezz:May1921Sul%40%40102030@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1';
  const prisma = new PrismaClient({ datasources: { db: { url } } });

  const tables = [
    `CREATE TABLE IF NOT EXISTS "Admin" ("id" TEXT NOT NULL PRIMARY KEY, "username" TEXT NOT NULL UNIQUE, "password" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "Company" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "code" TEXT NOT NULL UNIQUE, "businessId" TEXT, "vatId" TEXT, "iban" TEXT, "phone" TEXT, "email" TEXT, "address" TEXT, "zipCode" TEXT, "city" TEXT, "country" TEXT, "currency" TEXT NOT NULL DEFAULT 'EUR', "trialStart" TIMESTAMP(3), "trialEnd" TIMESTAMP(3), "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "Registration" ("id" TEXT NOT NULL PRIMARY KEY, "companyName" TEXT NOT NULL, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "phone" TEXT, "businessId" TEXT, "vatId" TEXT, "iban" TEXT, "address" TEXT, "zipCode" TEXT, "city" TEXT, "country" TEXT, "status" TEXT NOT NULL DEFAULT 'pending', "trialStart" TIMESTAMP(3), "trialEnd" TIMESTAMP(3), "reviewedBy" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "ContactInfo" ("id" TEXT NOT NULL PRIMARY KEY, "key" TEXT NOT NULL UNIQUE, "value" TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS "Customer" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT, "address" TEXT, "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL PRIMARY KEY, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "role" TEXT NOT NULL DEFAULT 'Staff', "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "AuditLog" ("id" TEXT NOT NULL PRIMARY KEY, "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "user" TEXT NOT NULL, "action" TEXT NOT NULL, "adminId" TEXT REFERENCES "Admin"("id") ON DELETE SET NULL)`,
    `CREATE TABLE IF NOT EXISTS "Service" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS "Category" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "type" TEXT NOT NULL, "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS "ShkLink" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "url" TEXT NOT NULL, "username" TEXT, "password" TEXT, "companyId" TEXT UNIQUE REFERENCES "Company"("id") ON DELETE RESTRICT)`,
    `CREATE TABLE IF NOT EXISTS "SupportMessage" ("id" TEXT NOT NULL PRIMARY KEY, "sender" TEXT NOT NULL, "senderName" TEXT NOT NULL, "message" TEXT NOT NULL, "companyId" TEXT, "read" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "Session" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT, "userType" TEXT NOT NULL, "username" TEXT NOT NULL, "companyId" TEXT, "token" TEXT NOT NULL UNIQUE, "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "InvoiceItem" ("id" TEXT NOT NULL PRIMARY KEY, "description" TEXT NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 1, "unitPrice" DOUBLE PRECISION NOT NULL, "invoiceId" TEXT NOT NULL REFERENCES "Invoice"("id") ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS "Invoice" ("id" TEXT NOT NULL PRIMARY KEY, "invoiceNumber" TEXT NOT NULL UNIQUE, "date" TIMESTAMP(3) NOT NULL, "customerId" TEXT REFERENCES "Customer"("id") ON DELETE SET NULL, "total" DOUBLE PRECISION NOT NULL, "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 25.5, "status" TEXT NOT NULL DEFAULT 'Pending', "paymentMethod" TEXT NOT NULL, "referenceNumber" TEXT, "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "Income" ("id" TEXT NOT NULL PRIMARY KEY, "date" TIMESTAMP(3) NOT NULL, "description" TEXT, "category" TEXT, "customerId" TEXT REFERENCES "Customer"("id") ON DELETE SET NULL, "vehicleMake" TEXT, "vehicleModel" TEXT, "licensePlate" TEXT, "services" TEXT NOT NULL DEFAULT '{}', "totalAmount" DOUBLE PRECISION NOT NULL, "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 25.5, "paymentMethod" TEXT NOT NULL, "invoiceId" TEXT, "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "Expense" ("id" TEXT NOT NULL PRIMARY KEY, "date" TIMESTAMP(3) NOT NULL, "description" TEXT, "category" TEXT, "amount" DOUBLE PRECISION NOT NULL, "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 25.5, "paymentMethod" TEXT NOT NULL, "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE, "customerId" TEXT REFERENCES "Customer"("id") ON DELETE SET NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "Booking" ("id" TEXT NOT NULL PRIMARY KEY, "customerId" TEXT REFERENCES "Customer"("id") ON DELETE SET NULL, "vehicleMake" TEXT, "vehicleModel" TEXT, "licensePlate" TEXT, "serviceType" TEXT, "bookingDate" TIMESTAMP(3) NOT NULL, "notes" TEXT, "status" TEXT NOT NULL DEFAULT 'Scheduled', "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "WorkOrder" ("id" TEXT NOT NULL PRIMARY KEY, "workOrderNumber" TEXT NOT NULL UNIQUE, "date" TIMESTAMP(3) NOT NULL, "customerId" TEXT REFERENCES "Customer"("id") ON DELETE SET NULL, "vehicleMake" TEXT, "vehicleModel" TEXT, "licensePlate" TEXT, "technician" TEXT, "estimatedHours" DOUBLE PRECISION, "actualHours" DOUBLE PRECISION, "mileage" DOUBLE PRECISION, "workDescription" TEXT, "parts" TEXT NOT NULL DEFAULT '{}', "partsCost" DOUBLE PRECISION NOT NULL DEFAULT 0, "laborCost" DOUBLE PRECISION NOT NULL DEFAULT 0, "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0, "status" TEXT NOT NULL DEFAULT 'Draft', "recommendations" TEXT, "nextServiceDue" TIMESTAMP(3), "guarantee" TEXT, "warrantyDetails" TEXT, "qualityCheck" TEXT, "technicianNotes" TEXT, "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "Certificate" ("id" TEXT NOT NULL PRIMARY KEY, "certificateNumber" TEXT NOT NULL UNIQUE, "issueDate" TIMESTAMP(3) NOT NULL, "customerId" TEXT REFERENCES "Customer"("id") ON DELETE SET NULL, "vehicleMake" TEXT, "vehicleModel" TEXT, "licensePlate" TEXT, "maintenanceType" TEXT, "validUntil" TIMESTAMP(3), "status" TEXT NOT NULL DEFAULT 'Active', "nextMaintenanceDate" TIMESTAMP(3), "maintenanceInterval" TEXT, "technician" TEXT, "inspectionResults" TEXT DEFAULT '{}', "technicianNotes" TEXT, "recommendations" TEXT, "serviceHistory" TEXT DEFAULT '[]', "remarks" TEXT, "workOrderId" TEXT REFERENCES "WorkOrder"("id") ON DELETE SET NULL, "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "_prisma_migrations" ("id" TEXT NOT NULL PRIMARY KEY, "checksum" TEXT NOT NULL, "finished_at" TIMESTAMP(3) NOT NULL, "migration_name" TEXT NOT NULL, "logs" TEXT, "rolled_back_at" TIMESTAMP(3), "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "applied_steps_count" INTEGER NOT NULL DEFAULT 0)`
  ];

  let ok = 0, fail = 0;
  for (const sql of tables) {
    try {
      await prisma.$executeRawUnsafe(sql);
      const name = sql.match(/"(\w+)"/)?.[1] || '?';
      console.log('OK: ' + name);
      ok++;
    } catch (e) {
      const name = sql.match(/"(\w+)"/)?.[1] || '?';
      console.log('FAIL: ' + name + ' - ' + (e.message||'').substring(0, 100));
      fail++;
    }
  }
  console.log('\nDone: ' + ok + ' ok, ' + fail + ' failed');
  await prisma.$disconnect();
}

setup().catch(console.error);
