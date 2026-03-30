import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      companies,
      users,
      customers,
      incomeRecords,
      expenseRecords,
      invoices,
      bookings,
      workOrders,
      certificates,
      services,
      categories,
      shkLinks,
      registrations,
      auditLogs,
      contactInfo,
    ] = await Promise.all([
      db.company.findMany(),
      db.user.findMany(),
      db.customer.findMany(),
      db.income.findMany(),
      db.expense.findMany(),
      db.invoice.findMany({ include: { items: true } }),
      db.booking.findMany(),
      db.workOrder.findMany(),
      db.certificate.findMany(),
      db.service.findMany(),
      db.category.findMany(),
      db.shkLink.findMany(),
      db.registration.findMany(),
      db.auditLog.findMany(),
      db.contactInfo.findMany(),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      data: {
        companies,
        users,
        customers,
        incomeRecords,
        expenseRecords,
        invoices,
        bookings,
        workOrders,
        certificates,
        services,
        categories,
        shkLinks,
        registrations,
        auditLogs,
        contactInfo,
      },
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
