import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

    // Delete in correct order due to foreign keys
    // InvoiceItem, SupportMessage, AuditLog, Certificate, WorkOrder, Booking,
    // Invoice, Income, Expense, Customer, User, Service, Category, ShkLink,
    // Registration, ContactInfo, Company, Admin
    await db.invoiceItem.deleteMany();
    await db.supportMessage.deleteMany();
    await db.auditLog.deleteMany();
    await db.certificate.deleteMany();
    await db.workOrder.deleteMany();
    await db.booking.deleteMany();
    await db.invoice.deleteMany();
    await db.income.deleteMany();
    await db.expense.deleteMany();
    await db.customer.deleteMany();
    await db.user.deleteMany();
    await db.service.deleteMany();
    await db.category.deleteMany();
    await db.shkLink.deleteMany();
    await db.registration.deleteMany();
    await db.contactInfo.deleteMany();
    await db.company.deleteMany();
    await db.admin.deleteMany();

    // Insert in reverse order: Admin, Company, ContactInfo, Registration,
    // ShkLink, Category, Service, User, Customer, Expense, Income, Invoice,
    // Booking, WorkOrder, Certificate, AuditLog, SupportMessage, InvoiceItem

    const counts: Record<string, number> = {};

    if (data.admins?.length) {
      counts.admins = (await db.admin.createMany({ data: data.admins })).count;
    }
    if (data.companies?.length) {
      counts.companies = (await db.company.createMany({ data: data.companies })).count;
    }
    if (data.contactInfo?.length) {
      counts.contactInfo = (await db.contactInfo.createMany({ data: data.contactInfo })).count;
    }
    if (data.registrations?.length) {
      counts.registrations = (await db.registration.createMany({ data: data.registrations })).count;
    }
    if (data.shkLinks?.length) {
      counts.shkLinks = (await db.shkLink.createMany({ data: data.shkLinks })).count;
    }
    if (data.categories?.length) {
      counts.categories = (await db.category.createMany({ data: data.categories })).count;
    }
    if (data.services?.length) {
      counts.services = (await db.service.createMany({ data: data.services })).count;
    }
    if (data.users?.length) {
      counts.users = (await db.user.createMany({ data: data.users })).count;
    }
    if (data.customers?.length) {
      counts.customers = (await db.customer.createMany({ data: data.customers })).count;
    }
    if (data.expenseRecords?.length) {
      counts.expenseRecords = (await db.expense.createMany({ data: data.expenseRecords })).count;
    }
    if (data.incomeRecords?.length) {
      counts.incomeRecords = (await db.income.createMany({ data: data.incomeRecords })).count;
    }

    // Invoices need special handling: insert invoices first, then items with correct invoiceId mapping
    if (data.invoices?.length) {
      // Build a map of old invoice id -> new invoice id
      const idMap: Record<string, string> = {};
      for (const inv of data.invoices) {
        const oldId = inv.id;
        const { id: _, items, ...invoiceData } = inv;
        const created = await db.invoice.create({ data: invoiceData as never });
        idMap[oldId] = created.id;
        counts.invoices = (counts.invoices || 0) + 1;
      }
      // Insert invoice items with mapped invoiceId
      for (const inv of data.invoices) {
        if (inv.items?.length) {
          for (const item of inv.items) {
            const { id: _, invoiceId, ...itemData } = item;
            await db.invoiceItem.create({
              data: { ...itemData, invoiceId: idMap[invoiceId] || invoiceId } as never,
            });
            counts.invoiceItems = (counts.invoiceItems || 0) + 1;
          }
        }
      }
    }

    if (data.bookings?.length) {
      counts.bookings = (await db.booking.createMany({ data: data.bookings })).count;
    }
    if (data.workOrders?.length) {
      counts.workOrders = (await db.workOrder.createMany({ data: data.workOrders })).count;
    }
    if (data.certificates?.length) {
      counts.certificates = (await db.certificate.createMany({ data: data.certificates })).count;
    }
    if (data.auditLogs?.length) {
      counts.auditLogs = (await db.auditLog.createMany({ data: data.auditLogs })).count;
    }
    if (data.supportMessages?.length) {
      counts.supportMessages = (await db.supportMessage.createMany({ data: data.supportMessages })).count;
    }

    await db.auditLog.create({
      data: {
        user: session.username,
        action: `Imported data. Record counts: ${JSON.stringify(counts)}`,
        adminId: session.userId || null,
      },
    });

    return NextResponse.json({
      message: 'Data imported successfully',
      counts,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 });
  }
}
