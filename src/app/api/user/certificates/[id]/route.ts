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
      customerId, vehicleMake, vehicleModel, licensePlate,
      issueDate, maintenanceType, validUntil, nextMaintenanceDate,
      maintenanceInterval, technician, inspectionResults, technicianNotes,
      recommendations, serviceHistory, remarks, workOrderId,
    } = body;

    const record = await db.certificate.update({
      where: { id, companyId: session.companyId },
      data: {
        ...(customerId !== undefined && { customerId }),
        ...(vehicleMake !== undefined && { vehicleMake }),
        ...(vehicleModel !== undefined && { vehicleModel }),
        ...(licensePlate !== undefined && { licensePlate }),
        ...(issueDate !== undefined && { issueDate: new Date(issueDate) }),
        ...(maintenanceType !== undefined && { maintenanceType }),
        ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
        ...(nextMaintenanceDate !== undefined && { nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : null }),
        ...(maintenanceInterval !== undefined && { maintenanceInterval }),
        ...(technician !== undefined && { technician }),
        ...(inspectionResults !== undefined && { inspectionResults: inspectionResults ? (typeof inspectionResults === 'string' ? inspectionResults : JSON.stringify(inspectionResults)) : null }),
        ...(technicianNotes !== undefined && { technicianNotes }),
        ...(recommendations !== undefined && { recommendations }),
        ...(serviceHistory !== undefined && { serviceHistory: serviceHistory ? (typeof serviceHistory === 'string' ? serviceHistory : JSON.stringify(serviceHistory)) : null }),
        ...(remarks !== undefined && { remarks }),
        ...(workOrderId !== undefined && { workOrderId }),
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
    await db.certificate.delete({ where: { id, companyId: session.companyId } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
