import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await db.workOrder.findMany({
      where: { companyId: session.companyId },
      include: { customer: { select: { name: true } } },
      orderBy: { date: 'desc' },
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
      date, status, technician, estimatedHours, actualHours, mileage,
      workDescription, parts, partsCost, laborCost, totalCost,
      recommendations, nextServiceDue, guarantee, warrantyDetails,
      qualityCheck, technicianNotes,
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

    const workOrderNumber = 'WO-' + Date.now().toString(36).toUpperCase();

    const record = await db.workOrder.create({
      data: {
        workOrderNumber,
        date: new Date(date),
        customerId: finalCustomerId,
        vehicleMake,
        vehicleModel,
        licensePlate,
        technician,
        estimatedHours: estimatedHours || null,
        actualHours: actualHours || null,
        mileage: mileage || null,
        workDescription,
        parts: typeof parts === 'string' ? parts : JSON.stringify(parts),
        partsCost: partsCost || 0,
        laborCost: laborCost || 0,
        totalCost: totalCost || 0,
        status: status || 'Draft',
        recommendations,
        nextServiceDue: nextServiceDue ? new Date(nextServiceDue) : null,
        guarantee,
        warrantyDetails,
        qualityCheck,
        technicianNotes,
        companyId: session.companyId,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
