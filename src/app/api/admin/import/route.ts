import { NextRequest, NextResponse } from 'next/server';
import { query, generateId } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = body.data;

    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // Delete in FK-safe order
    await query('DELETE FROM "InvoiceItem"');
    await query('DELETE FROM "SupportMessage"');
    await query('DELETE FROM "AuditLog"');
    await query('DELETE FROM "Certificate"');
    await query('DELETE FROM "WorkOrder"');
    await query('DELETE FROM "Booking"');
    await query('DELETE FROM "Invoice"');
    await query('DELETE FROM "Income"');
    await query('DELETE FROM "Expense"');
    await query('DELETE FROM "Customer"');
    await query('DELETE FROM "User"');
    await query('DELETE FROM "Service"');
    await query('DELETE FROM "Category"');
    await query('DELETE FROM "ShkLink"');
    await query('DELETE FROM "Registration"');
    await query('DELETE FROM "ContactInfo"');
    await query('DELETE FROM "Company"');
    await query('DELETE FROM "Admin"');

    const counts: Record<string, number> = {};

    // Helper to bulk insert an array of records into a table
    async function bulkInsert(
      table: string,
      records: Record<string, unknown>[],
      columns: string[],
      skipColumns: string[] = []
    ) {
      if (!records?.length) return;
      const filteredCols = columns.filter((c) => !skipColumns.includes(c));
      const placeholders = filteredCols.map((_, i) => `$${i + 1}`).join(', ');
      const colList = filteredCols.map((c) => `"${c}"`).join(', ');

      for (const record of records) {
        const values = filteredCols.map((col) => {
          const val = record[col];
          // Handle JSON fields - stringify objects
          if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
            return JSON.stringify(val);
          }
          return val ?? null;
        });
        await query(
          `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`,
          values
        );
      }
      counts[table] = (counts[table] || 0) + records.length;
    }

    // Insert Admins
    if (data.admins?.length) {
      await bulkInsert('Admin', data.admins, ['id', 'username', 'password', 'createdAt', 'updatedAt']);
    }

    // Insert Companies
    if (data.companies?.length) {
      await bulkInsert('Company', data.companies, [
        'id', 'name', 'code', 'businessId', 'vatId', 'iban', 'phone', 'email',
        'address', 'zipCode', 'city', 'country', 'currency', 'trialStart',
        'trialEnd', 'isActive', 'createdAt', 'updatedAt',
      ]);
    }

    // Insert ContactInfo
    if (data.contactInfo?.length) {
      await bulkInsert('ContactInfo', data.contactInfo, ['id', 'key', 'value']);
    }

    // Insert Registrations
    if (data.registrations?.length) {
      await bulkInsert('Registration', data.registrations, [
        'id', 'companyName', 'username', 'password', 'phone', 'businessId',
        'vatId', 'iban', 'address', 'zipCode', 'city', 'country', 'status',
        'trialStart', 'trialEnd', 'reviewedBy', 'createdAt', 'updatedAt',
      ]);
    }

    // Insert ShkLinks
    if (data.shkLinks?.length) {
      await bulkInsert('ShkLink', data.shkLinks, [
        'id', 'name', 'url', 'username', 'password', 'companyId',
      ]);
    }

    // Insert Categories
    if (data.categories?.length) {
      await bulkInsert('Category', data.categories, ['id', 'name', 'type', 'companyId']);
    }

    // Insert Services
    if (data.services?.length) {
      await bulkInsert('Service', data.services, ['id', 'name', 'companyId']);
    }

    // Insert Users
    if (data.users?.length) {
      await bulkInsert('User', data.users, [
        'id', 'username', 'password', 'role', 'companyId', 'createdAt', 'updatedAt',
      ]);
    }

    // Insert Customers
    if (data.customers?.length) {
      await bulkInsert('Customer', data.customers, [
        'id', 'name', 'email', 'address', 'companyId', 'createdAt', 'updatedAt',
      ]);
    }

    // Insert Expenses
    if (data.expenseRecords?.length) {
      await bulkInsert('Expense', data.expenseRecords, [
        'id', 'date', 'description', 'category', 'amount', 'vatRate',
        'paymentMethod', 'companyId', 'customerId', 'createdAt', 'updatedAt',
      ]);
    }

    // Insert Incomes
    if (data.incomeRecords?.length) {
      await bulkInsert('Income', data.incomeRecords, [
        'id', 'date', 'description', 'category', 'customerId', 'vehicleMake',
        'vehicleModel', 'licensePlate', 'services', 'totalAmount', 'vatRate',
        'paymentMethod', 'invoiceId', 'companyId', 'createdAt', 'updatedAt',
      ]);
    }

    // Insert Invoices with ID mapping for items
    if (data.invoices?.length) {
      const idMap: Record<string, string> = {};

      for (const inv of data.invoices) {
        const oldId = inv.id;
        const newId = generateId();
        idMap[oldId] = newId;

        await query(
          `INSERT INTO "Invoice" (id, "invoiceNumber", date, "customerId", total, "vatRate", status, "paymentMethod", "referenceNumber", "companyId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            newId,
            inv.invoiceNumber,
            inv.date ? new Date(inv.date) : null,
            inv.customerId || null,
            inv.total,
            inv.vatRate ?? 25.5,
            inv.status || 'Pending',
            inv.paymentMethod || null,
            inv.referenceNumber || null,
            inv.companyId || null,
            inv.createdAt ? new Date(inv.createdAt) : new Date(),
            inv.updatedAt ? new Date(inv.updatedAt) : new Date(),
          ]
        );
        counts['invoices'] = (counts['invoices'] || 0) + 1;
      }

      // Insert InvoiceItems with mapped invoiceId
      for (const inv of data.invoices) {
        if (inv.items?.length) {
          for (const item of inv.items) {
            const newId = generateId();
            const mappedInvoiceId = idMap[item.invoiceId] || item.invoiceId;
            await query(
              `INSERT INTO "InvoiceItem" (id, description, quantity, "unitPrice", "invoiceId")
               VALUES ($1, $2, $3, $4, $5)`,
              [
                newId,
                item.description || null,
                item.quantity ?? 1,
                item.unitPrice ?? 0,
                mappedInvoiceId,
              ]
            );
            counts['invoiceItems'] = (counts['invoiceItems'] || 0) + 1;
          }
        }
      }
    }

    // Insert Bookings
    if (data.bookings?.length) {
      await bulkInsert('Booking', data.bookings, [
        'id', 'customerId', 'vehicleMake', 'vehicleModel', 'licensePlate',
        'serviceType', 'bookingDate', 'notes', 'status', 'companyId',
        'createdAt', 'updatedAt',
      ]);
    }

    // Insert WorkOrders
    if (data.workOrders?.length) {
      await bulkInsert('WorkOrder', data.workOrders, [
        'id', 'workOrderNumber', 'date', 'customerId', 'vehicleMake',
        'vehicleModel', 'licensePlate', 'technician', 'estimatedHours',
        'actualHours', 'mileage', 'workDescription', 'parts', 'partsCost',
        'laborCost', 'totalCost', 'status', 'recommendations',
        'nextServiceDue', 'guarantee', 'warrantyDetails', 'qualityCheck',
        'technicianNotes', 'companyId', 'createdAt', 'updatedAt',
      ]);
    }

    // Insert Certificates
    if (data.certificates?.length) {
      await bulkInsert('Certificate', data.certificates, [
        'id', 'certificateNumber', 'issueDate', 'customerId', 'vehicleMake',
        'vehicleModel', 'licensePlate', 'maintenanceType', 'validUntil',
        'status', 'nextMaintenanceDate', 'maintenanceInterval', 'technician',
        'inspectionResults', 'technicianNotes', 'recommendations',
        'serviceHistory', 'remarks', 'workOrderId', 'companyId',
        'createdAt', 'updatedAt',
      ]);
    }

    // Insert AuditLogs
    if (data.auditLogs?.length) {
      await bulkInsert('AuditLog', data.auditLogs, [
        'id', 'timestamp', 'user', 'action', 'adminId',
      ]);
    }

    // Insert SupportMessages
    if (data.supportMessages?.length) {
      await bulkInsert('SupportMessage', data.supportMessages, [
        'id', 'sender', 'senderName', 'message', 'companyId', 'read', 'createdAt',
      ]);
    }

    // Log the import
    await query(
      `INSERT INTO "AuditLog" (id, user, action, "adminId", timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [generateId(), session.username, `Imported data. Record counts: ${JSON.stringify(counts)}`, session.userId || null]
    );

    return NextResponse.json({
      message: 'Data imported successfully',
      counts,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 });
  }
}
