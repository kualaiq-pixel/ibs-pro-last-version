import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

    const registration = await db.registration.findUnique({ where: { id } });
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (registration.status !== 'pending') {
      return NextResponse.json({ error: 'Registration is not pending' }, { status: 400 });
    }

    await db.registration.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewedBy: session.username,
      },
    });

    await db.auditLog.create({
      data: {
        user: session.username,
        action: `Rejected registration: ${registration.companyName} by ${registration.username}`,
        adminId: session.userId || null,
      },
    });

    return NextResponse.json({ message: 'Registration rejected' });
  } catch (error) {
    console.error('Registration reject error:', error);
    return NextResponse.json({ error: 'Failed to reject registration' }, { status: 500 });
  }
}
