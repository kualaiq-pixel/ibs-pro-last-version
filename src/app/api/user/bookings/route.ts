import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await db.booking.findMany({
      where: { companyId: session.companyId },
      include: { customer: { select: { name: true } } },
      orderBy: { bookingDate: 'desc' },
    });

    return NextResponse.json(records);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerId, customerName, customerEmail, customerAddress,
      vehicleMake, vehicleModel, licensePlate,
      bookingDate, serviceType, notes,
    } = body;

    let finalCustomerId = customerId || null;
    if (!finalCustomerId && customerName) {
      const newCustomer = await db.customer.create({
        data: {
          name: customerName,
          email: customerEmail || null,
          address: customerAddress || null,
          companyId: session.companyId,
        },
      });
      finalCustomerId = newCustomer.id;
    }

    const record = await db.booking.create({
      data: {
        customerId: finalCustomerId,
        vehicleMake,
        vehicleModel,
        licensePlate,
        serviceType,
        bookingDate: new Date(bookingDate),
        notes,
        companyId: session.companyId,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
