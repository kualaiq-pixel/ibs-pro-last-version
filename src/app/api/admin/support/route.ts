import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get conversations: one row per companyId with company details and unread count
    const conversations = await query<{
      companyId: string;
      companyName: string;
      companyCode: string;
      unreadCount: number;
      lastMessageAt: Date;
    }>(
      `SELECT
        sm."companyId",
        c.name as "companyName",
        c.code as "companyCode",
        (SELECT COUNT(*) FROM "SupportMessage" WHERE "companyId" = sm."companyId" AND sender = 'user' AND "read" = false)::int as "unreadCount",
        sm."createdAt" as "lastMessageAt"
       FROM "SupportMessage" sm
       JOIN "Company" c ON sm."companyId" = c.id
       WHERE sm."companyId" IS NOT NULL
       GROUP BY sm."companyId", c.name, c.code, sm."createdAt"
       ORDER BY sm."createdAt" DESC`
    );

    // Deduplicate by companyId, keeping the one with the latest lastMessageAt
    const seen = new Map<string, typeof conversations.rows[0]>();
    for (const row of conversations.rows) {
      if (!seen.has(row.companyId)) {
        seen.set(row.companyId, row);
      }
    }

    return NextResponse.json(Array.from(seen.values()));
  } catch (error) {
    console.error('Support GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch support conversations' }, { status: 500 });
  }
}
