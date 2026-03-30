import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get invoices with customer name and items as JSON subquery
    const invoices = await query(
      `SELECT inv.*, c.name AS "customerName",
              COALESCE(
                (SELECT json_agg(json_build_object('id', ii.id, 'description', ii.description, 'quantity', ii.quantity, 'unitPrice', ii."unitPrice"))
                 FROM "InvoiceItem" ii WHERE ii."invoiceId" = inv.id), '[]'::json
              ) AS "items"
       FROM "Invoice" inv
       LEFT JOIN "Customer" c ON inv."customerId" = c.id
       WHERE inv."companyId" = $1
       ORDER BY inv.date DESC`,
      [session.companyId]
    );

    // Get pending and paid totals
    const pendingResult = await queryOne<{ total: string | null }>(
      `SELECT COALESCE(SUM(total), 0)::text AS total FROM "Invoice" WHERE "companyId" = $1 AND status = 'Pending'`,
      [session.companyId]
    );
    const paidResult = await queryOne<{ total: string | null }>(
      `SELECT COALESCE(SUM(total), 0)::text AS total FROM "Invoice" WHERE "companyId" = $1 AND status = 'Paid'`,
      [session.companyId]
    );

    return NextResponse.json({
      invoices: invoices.rows,
      summary: {
        totalPending: parseFloat(pendingResult?.total || '0'),
        totalPaid: parseFloat(paidResult?.total || '0'),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
