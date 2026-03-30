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
      `SELECT wo.*, c.name AS "customerName"
       FROM "WorkOrder" wo
       LEFT JOIN "Customer" c ON wo."customerId" = c.id
       WHERE wo."companyId" = $1
       ORDER BY wo.date DESC`,
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
      date, status, technician, estimatedHours, actualHours, mileage,
      workDescription, parts, partsCost, laborCost, totalCost,
      recommendations, nextServiceDue, guarantee, warrantyDetails,
      qualityCheck, technicianNotes,
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

    const workOrderNumber = 'WO-' + Date.now().toString(36).toUpperCase();
    const id = generateId();
    const partsStr = typeof parts === 'string' ? parts : JSON.stringify(parts || {});

    const result = await query(
      `INSERT INTO "WorkOrder" (id, "workOrderNumber", date, "customerId", "vehicleMake", "vehicleModel", "licensePlate", technician, "estimatedHours", "actualHours", mileage, "workDescription", parts, "partsCost", "laborCost", "totalCost", status, recommendations, "nextServiceDue", guarantee, "warrantyDetails", "qualityCheck", "technicianNotes", "companyId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW(), NOW())
       RETURNING *`,
      [
        id, workOrderNumber, new Date(date).toISOString(), finalCustomerId,
        vehicleMake || null, vehicleModel || null, licensePlate || null,
        technician || null, estimatedHours || null, actualHours || null, mileage || null,
        workDescription, partsStr,
        partsCost || 0, laborCost || 0, totalCost || 0,
        status || 'Draft',
        recommendations || null,
        nextServiceDue ? new Date(nextServiceDue).toISOString() : null,
        guarantee || null, warrantyDetails || null, qualityCheck || null, technicianNotes || null,
        session.companyId
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
