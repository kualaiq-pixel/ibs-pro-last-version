import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [invoices, pendingResult, paidResult] = await Promise.all([
      db.invoice.findMany({
        where: { companyId: session.companyId },
        include: {
          customer: { select: { name: true } },
          items: true,
        },
        orderBy: { date: 'desc' },
      }),
      db.invoice.aggregate({
        _sum: { total: true },
        where: { companyId: session.companyId, status: 'Pending' },
      }),
      db.invoice.aggregate({
        _sum: { total: true },
        where: { companyId: session.companyId, status: 'Paid' },
      }),
    ]);

    return NextResponse.json({
      invoices,
      summary: {
        totalPending: pendingResult._sum.total || 0,
        totalPaid: paidResult._sum.total || 0,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
