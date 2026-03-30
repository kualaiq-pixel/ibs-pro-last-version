import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
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
      queryAll<Record<string, unknown>>('SELECT * FROM "Company"'),
      queryAll<Record<string, unknown>>('SELECT * FROM "User"'),
      queryAll<Record<string, unknown>>('SELECT * FROM "Customer"'),
      queryAll<Record<string, unknown>>('SELECT * FROM "Income"'),
      queryAll<Record<string, unknown>>('SELECT * FROM "Expense"'),
      queryAll<Record<string, unknown>>('SELECT * FROM "Booking"'),
      queryAll<Record<string, unknown>>('SELECT * FROM "WorkOrder"'),
      queryAll<Record<string, unknown>>('SELECT * FROM "Certificate"'),
      queryAll<Record<string, unknown>>('SELECT * FROM "Service"'),
      queryAll<Record<string, unknown>>('SELECT * FROM "Category"'),
      queryAll<Record<string, unknown>>('SELECT * FROM "ShkLink"'),
      queryAll<Record<string, unknown>>('SELECT * FROM "Registration"'),
      queryAll<Record<string, unknown>>('SELECT * FROM "AuditLog"'),
      queryAll<Record<string, unknown>>('SELECT * FROM "ContactInfo"'),
    ]);

    // Invoices with their items (using a join to group items)
    const invoices = await queryAll<Record<string, unknown>>(
      `SELECT i.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', ii.id,
                    'description', ii.description,
                    'quantity', ii.quantity,
                    'unitPrice', ii."unitPrice",
                    'invoiceId', ii."invoiceId"
                  )
                  ORDER BY ii.id
                )
                FILTER (WHERE ii.id IS NOT NULL),
                '[]'::json
              ) as items
       FROM "Invoice" i
       LEFT JOIN "InvoiceItem" ii ON ii."invoiceId" = i.id
       GROUP BY i.id`
    );

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
