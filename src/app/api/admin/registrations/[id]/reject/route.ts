import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, generateId } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const registration = await queryOne<{
      id: string;
      companyName: string;
      username: string;
      status: string;
    }>(
      'SELECT id, "companyName", username, status FROM "Registration" WHERE id = $1',
      [id]
    );
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (registration.status !== 'pending') {
      return NextResponse.json({ error: 'Registration is not pending' }, { status: 400 });
    }

    await query(
      `UPDATE "Registration"
       SET status = 'rejected', "reviewedBy" = $1, "updatedAt" = NOW()
       WHERE id = $2`,
      [session.username, id]
    );

    await query(
      `INSERT INTO "AuditLog" (id, user, action, "adminId", timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [generateId(), session.username, `Rejected registration: ${registration.companyName} by ${registration.username}`, session.userId || null]
    );

    return NextResponse.json({ message: 'Registration rejected' });
  } catch (error) {
    console.error('Registration reject error:', error);
    return NextResponse.json({ error: 'Failed to reject registration' }, { status: 500 });
  }
}
