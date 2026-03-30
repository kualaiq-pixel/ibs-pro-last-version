import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyId, message } = body;

    if (!companyId || !message) {
      return NextResponse.json({ error: 'companyId and message are required' }, { status: 400 });
    }

    const company = await db.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const supportMessage = await db.supportMessage.create({
      data: {
        sender: 'admin',
        senderName: session.username,
        message,
        companyId,
        read: true,
      },
    });

    await db.auditLog.create({
      data: {
        user: session.username,
        action: `Sent support message to ${company.name}`,
        adminId: session.userId || null,
      },
    });

    return NextResponse.json(supportMessage, { status: 201 });
  } catch (error) {
    console.error('Support send POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
