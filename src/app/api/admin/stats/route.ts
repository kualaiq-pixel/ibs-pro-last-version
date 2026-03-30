import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [companiesResult, usersResult, customersResult, logsResult] = await Promise.all([
      query<{ count: string }>('SELECT COUNT(*)::text as count FROM "Company"'),
      query<{ count: string }>('SELECT COUNT(*)::text as count FROM "User"'),
      query<{ count: string }>('SELECT COUNT(*)::text as count FROM "Customer"'),
      query<Record<string, unknown>>(
        'SELECT * FROM "AuditLog" ORDER BY "timestamp" DESC LIMIT 10'
      ),
    ]);

    return NextResponse.json({
      companies: parseInt(companiesResult.rows[0]?.count || '0', 10),
      users: parseInt(usersResult.rows[0]?.count || '0', 10),
      customers: parseInt(customersResult.rows[0]?.count || '0', 10),
      latestLogs: logsResult.rows,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
