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
    const { date, amount, category, description, paymentMethod, vatRate, customerId } = body;

    const record = await db.expense.update({
      where: { id, companyId: session.companyId },
      data: {
        ...(date !== undefined && { date: new Date(date) }),
        ...(amount !== undefined && { amount }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(paymentMethod !== undefined && { paymentMethod }),
        ...(vatRate !== undefined && { vatRate }),
        ...(customerId !== undefined && { customerId }),
      },
    });

    return NextResponse.json(record);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.expense.delete({ where: { id, companyId: session.companyId } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
