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
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
    }

    const messages = await query<Record<string, unknown>>(
      `SELECT * FROM "SupportMessage" WHERE "companyId" = $1 ORDER BY "createdAt" ASC`,
      [companyId]
    );

    // Mark user messages as read
    await query(
      `UPDATE "SupportMessage" SET "read" = true WHERE "companyId" = $1 AND sender = 'user' AND "read" = false`,
      [companyId]
    );

    return NextResponse.json(messages.rows);
  } catch (error) {
    console.error('Support messages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
