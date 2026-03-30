import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get distinct companyIds from SupportMessage
    const messages = await db.supportMessage.findMany({
      where: { companyId: { not: null } },
      select: { companyId: true, senderName: true, createdAt: true },
      distinct: ['companyId'],
      orderBy: { createdAt: 'desc' },
    });

    // Get company details for each distinct companyId
    const companyIds = messages.map((m) => m.companyId!).filter(Boolean);
    const companies = await db.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true, name: true, code: true },
    });

    // Get unread count per company
    const unreadCounts = await db.supportMessage.groupBy({
      by: ['companyId'],
      where: {
        companyId: { in: companyIds },
        sender: 'user',
        read: false,
      },
      _count: { id: true },
    });

    const result = companies.map((company) => ({
      ...company,
      unreadCount: unreadCounts.find((u) => u.companyId === company.id)?._count.id || 0,
      lastMessageAt: messages.find((m) => m.companyId === company.id)?.createdAt || null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Support GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch support conversations' }, { status: 500 });
  }
}
