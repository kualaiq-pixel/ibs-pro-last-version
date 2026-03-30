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
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
    }

    const messages = await db.supportMessage.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
    });

    // Mark user messages as read
    await db.supportMessage.updateMany({
      where: {
        companyId,
        sender: 'user',
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Support messages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
