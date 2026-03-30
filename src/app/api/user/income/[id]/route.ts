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
    const {
      date, category, customerId, vehicleMake, vehicleModel, licensePlate,
      services, totalAmount, vatRate, paymentMethod, description, invoiceId,
    } = body;

    const record = await db.income.update({
      where: { id, companyId: session.companyId },
      data: {
        ...(date !== undefined && { date: new Date(date) }),
        ...(category !== undefined && { category }),
        ...(customerId !== undefined && { customerId }),
        ...(vehicleMake !== undefined && { vehicleMake }),
        ...(vehicleModel !== undefined && { vehicleModel }),
        ...(licensePlate !== undefined && { licensePlate }),
        ...(services !== undefined && { services: typeof services === 'string' ? services : JSON.stringify(services) }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(vatRate !== undefined && { vatRate }),
        ...(paymentMethod !== undefined && { paymentMethod }),
        ...(description !== undefined && { description }),
        ...(invoiceId !== undefined && { invoiceId }),
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
    await db.income.delete({ where: { id, companyId: session.companyId } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
