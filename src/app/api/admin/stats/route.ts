import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [companies, users, customers, latestLogs] = await Promise.all([
      db.company.count(),
      db.user.count(),
      db.customer.count(),
      db.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      companies,
      users,
      customers,
      latestLogs,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
