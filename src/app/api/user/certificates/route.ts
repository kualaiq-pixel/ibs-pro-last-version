import { NextRequest, NextResponse } from 'next/server';
import { query, queryAll, generateId } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await queryAll(
      `SELECT cert.*, c.name AS "customerName"
       FROM "Certificate" cert
       LEFT JOIN "Customer" c ON cert."customerId" = c.id
       WHERE cert."companyId" = $1
       ORDER BY cert."issueDate" DESC`,
      [session.companyId]
    );

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
      const newCustomerId = generateId();
      await query(
        `INSERT INTO "Customer" (id, name, email, address, "companyId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [newCustomerId, customerName, customerEmail || null, customerAddress || null, session.companyId]
      );
      finalCustomerId = newCustomerId;
    }

    const certificateNumber = 'CERT-' + Date.now().toString(36).toUpperCase();
    const id = generateId();
    const inspectionResultsStr = inspectionResults
      ? (typeof inspectionResults === 'string' ? inspectionResults : JSON.stringify(inspectionResults))
      : null;
    const serviceHistoryStr = serviceHistory
      ? (typeof serviceHistory === 'string' ? serviceHistory : JSON.stringify(serviceHistory))
      : null;

    const result = await query(
      `INSERT INTO "Certificate" (id, "certificateNumber", "issueDate", "customerId", "vehicleMake", "vehicleModel", "licensePlate", "maintenanceType", "validUntil", status, "nextMaintenanceDate", "maintenanceInterval", technician, "inspectionResults", "technicianNotes", recommendations, "serviceHistory", remarks, "workOrderId", "companyId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW())
       RETURNING *`,
      [
        id, certificateNumber, new Date(issueDate).toISOString(), finalCustomerId,
        vehicleMake || null, vehicleModel || null, licensePlate || null,
        maintenanceType,
        validUntil ? new Date(validUntil).toISOString() : null,
        'Active',
        nextMaintenanceDate ? new Date(nextMaintenanceDate).toISOString() : null,
        maintenanceInterval || null,
        technician || null,
        inspectionResultsStr,
        technicianNotes || null,
        recommendations || null,
        serviceHistoryStr,
        remarks || null,
        workOrderId || null,
        session.companyId
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
