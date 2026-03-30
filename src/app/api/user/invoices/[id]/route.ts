import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (status !== 'Pending' && status !== 'Paid') {
      return NextResponse.json({ error: 'Invalid status. Must be Pending or Paid' }, { status: 400 });
    }

    const invoice = await db.invoice.update({
      where: { id, companyId: session.companyId },
      data: { status },
    });

    return NextResponse.json(invoice);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
