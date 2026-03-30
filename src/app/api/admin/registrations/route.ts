import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    let registrations;
    if (status === 'all') {
      registrations = await queryAll<Record<string, unknown>>(
        `SELECT * FROM "Registration" ORDER BY "createdAt" DESC`
      );
    } else {
      registrations = await queryAll<Record<string, unknown>>(
        `SELECT * FROM "Registration" WHERE status = $1 ORDER BY "createdAt" DESC`,
        [status]
      );
    }

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Registrations GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}
