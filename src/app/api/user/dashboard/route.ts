import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.companyId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

    const [incomeResult, expenseResult, pendingInvoices, activeBookings, recentIncome, upcomingBookings] =
      await Promise.all([
        queryOne<{ total: string | null }>(
          `SELECT COALESCE(SUM("totalAmount"), 0)::text AS total FROM "Income" WHERE "companyId" = $1 AND date >= $2 AND date < $3`,
          [companyId, startOfMonth, endOfMonth]
        ),
        queryOne<{ total: string | null }>(
          `SELECT COALESCE(SUM(amount), 0)::text AS total FROM "Expense" WHERE "companyId" = $1 AND date >= $2 AND date < $3`,
          [companyId, startOfMonth, endOfMonth]
        ),
        queryOne<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM "Invoice" WHERE "companyId" = $1 AND status = 'Pending'`,
          [companyId]
        ),
        queryOne<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM "Booking" WHERE "companyId" = $1 AND status IN ('Scheduled', 'In Progress')`,
          [companyId]
        ),
        query(
          `SELECT i.*, c.name AS "customerName"
           FROM "Income" i
           LEFT JOIN "Customer" c ON i."customerId" = c.id
           WHERE i."companyId" = $1
           ORDER BY i.date DESC
           LIMIT 5`,
          [companyId]
        ),
        query(
          `SELECT b.*, c.name AS "customerName"
           FROM "Booking" b
           LEFT JOIN "Customer" c ON b."customerId" = c.id
           WHERE b."companyId" = $1 AND b."bookingDate" >= $2 AND b.status IN ('Scheduled', 'In Progress')
           ORDER BY b."bookingDate" ASC
           LIMIT 5`,
          [companyId, now.toISOString()]
        ),
      ]);

    return NextResponse.json({
      totalIncomeThisMonth: parseFloat(incomeResult?.total || '0'),
      totalExpensesThisMonth: parseFloat(expenseResult?.total || '0'),
      pendingInvoices: parseInt(pendingInvoices?.count || '0'),
      activeBookings: parseInt(activeBookings?.count || '0'),
      recentIncome: recentIncome.rows,
      upcomingBookings: upcomingBookings.rows,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
