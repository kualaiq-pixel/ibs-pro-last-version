import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, generateId } from '@/lib/db';
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

    const company = await queryOne<{ id: string; name: string }>(
      'SELECT id, name FROM "Company" WHERE id = $1',
      [companyId]
    );
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const id = generateId();
    await query(
      `INSERT INTO "SupportMessage" (id, sender, "senderName", message, "companyId", "read", "createdAt")
       VALUES ($1, 'admin', $2, $3, $4, true, NOW())`,
      [id, session.username, message, companyId]
    );

    await query(
      `INSERT INTO "AuditLog" (id, user, action, "adminId", timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [generateId(), session.username, `Sent support message to ${company.name}`, session.userId || null]
    );

    const supportMessage = await queryOne<Record<string, unknown>>(
      'SELECT * FROM "SupportMessage" WHERE id = $1',
      [id]
    );

    return NextResponse.json(supportMessage, { status: 201 });
  } catch (error) {
    console.error('Support send POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
