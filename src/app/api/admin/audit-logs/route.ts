import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
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

    const [auditLogsResult, totalResult] = await Promise.all([
      query<Record<string, unknown>>(
        'SELECT * FROM "AuditLog" ORDER BY "timestamp" DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      query<{ count: string }>('SELECT COUNT(*)::text as count FROM "AuditLog"'),
    ]);

    return NextResponse.json({
      auditLogs: auditLogsResult.rows,
      total: parseInt(totalResult.rows[0]?.count || '0', 10),
      offset,
      limit,
    });
  } catch (error) {
    console.error('Audit logs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
