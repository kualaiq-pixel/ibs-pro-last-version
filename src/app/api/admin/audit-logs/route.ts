import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = 100;

    const [auditLogs, total] = await Promise.all([
      db.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.auditLog.count(),
    ]);

    return NextResponse.json({
      auditLogs,
      total,
      offset,
      limit,
    });
  } catch (error) {
    console.error('Audit logs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
