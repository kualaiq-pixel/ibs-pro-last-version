import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await db.certificate.findMany({
      where: { companyId: session.companyId },
      include: { customer: { select: { name: true } } },
      orderBy: { issueDate: 'desc' },
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
      issueDate, maintenanceType, validUntil, nextMaintenanceDate,
      maintenanceInterval, technician, inspectionResults, technicianNotes,
      recommendations, serviceHistory, remarks, workOrderId,
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

    const certificateNumber = 'CERT-' + Date.now().toString(36).toUpperCase();

    const record = await db.certificate.create({
      data: {
        certificateNumber,
        issueDate: new Date(issueDate),
        customerId: finalCustomerId,
        vehicleMake,
        vehicleModel,
        licensePlate,
        maintenanceType,
        validUntil: validUntil ? new Date(validUntil) : null,
        nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : null,
        maintenanceInterval,
        technician,
        inspectionResults: inspectionResults ? (typeof inspectionResults === 'string' ? inspectionResults : JSON.stringify(inspectionResults)) : null,
        technicianNotes,
        recommendations,
        serviceHistory: serviceHistory ? (typeof serviceHistory === 'string' ? serviceHistory : JSON.stringify(serviceHistory)) : null,
        remarks,
        workOrderId: workOrderId || null,
        companyId: session.companyId,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
