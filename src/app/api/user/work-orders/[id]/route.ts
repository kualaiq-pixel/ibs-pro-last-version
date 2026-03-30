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
      date, status, customerId, vehicleMake, vehicleModel, licensePlate,
      technician, estimatedHours, actualHours, mileage, workDescription,
      parts, partsCost, laborCost, totalCost, recommendations,
      nextServiceDue, guarantee, warrantyDetails, qualityCheck, technicianNotes,
    } = body;

    const record = await db.workOrder.update({
      where: { id, companyId: session.companyId },
      data: {
        ...(date !== undefined && { date: new Date(date) }),
        ...(status !== undefined && { status }),
        ...(customerId !== undefined && { customerId }),
        ...(vehicleMake !== undefined && { vehicleMake }),
        ...(vehicleModel !== undefined && { vehicleModel }),
        ...(licensePlate !== undefined && { licensePlate }),
        ...(technician !== undefined && { technician }),
        ...(estimatedHours !== undefined && { estimatedHours }),
        ...(actualHours !== undefined && { actualHours }),
        ...(mileage !== undefined && { mileage }),
        ...(workDescription !== undefined && { workDescription }),
        ...(parts !== undefined && { parts: typeof parts === 'string' ? parts : JSON.stringify(parts) }),
        ...(partsCost !== undefined && { partsCost }),
        ...(laborCost !== undefined && { laborCost }),
        ...(totalCost !== undefined && { totalCost }),
        ...(recommendations !== undefined && { recommendations }),
        ...(nextServiceDue !== undefined && { nextServiceDue: nextServiceDue ? new Date(nextServiceDue) : null }),
        ...(guarantee !== undefined && { guarantee }),
        ...(warrantyDetails !== undefined && { warrantyDetails }),
        ...(qualityCheck !== undefined && { qualityCheck }),
        ...(technicianNotes !== undefined && { technicianNotes }),
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
    await db.workOrder.delete({ where: { id, companyId: session.companyId } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
