import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
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

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (customerId !== undefined) {
      setClauses.push(`"customerId" = $${paramIndex++}`);
      values.push(customerId);
    }
    if (vehicleMake !== undefined) {
      setClauses.push(`"vehicleMake" = $${paramIndex++}`);
      values.push(vehicleMake);
    }
    if (vehicleModel !== undefined) {
      setClauses.push(`"vehicleModel" = $${paramIndex++}`);
      values.push(vehicleModel);
    }
    if (licensePlate !== undefined) {
      setClauses.push(`"licensePlate" = $${paramIndex++}`);
      values.push(licensePlate);
    }
    if (issueDate !== undefined) {
      setClauses.push(`"issueDate" = $${paramIndex++}`);
      values.push(new Date(issueDate).toISOString());
    }
    if (maintenanceType !== undefined) {
      setClauses.push(`"maintenanceType" = $${paramIndex++}`);
      values.push(maintenanceType);
    }
    if (validUntil !== undefined) {
      setClauses.push(`"validUntil" = $${paramIndex++}`);
      values.push(validUntil ? new Date(validUntil).toISOString() : null);
    }
    if (nextMaintenanceDate !== undefined) {
      setClauses.push(`"nextMaintenanceDate" = $${paramIndex++}`);
      values.push(nextMaintenanceDate ? new Date(nextMaintenanceDate).toISOString() : null);
    }
    if (maintenanceInterval !== undefined) {
      setClauses.push(`"maintenanceInterval" = $${paramIndex++}`);
      values.push(maintenanceInterval);
    }
    if (technician !== undefined) {
      setClauses.push(`technician = $${paramIndex++}`);
      values.push(technician);
    }
    if (inspectionResults !== undefined) {
      setClauses.push(`"inspectionResults" = $${paramIndex++}`);
      values.push(inspectionResults ? (typeof inspectionResults === 'string' ? inspectionResults : JSON.stringify(inspectionResults)) : null);
    }
    if (technicianNotes !== undefined) {
      setClauses.push(`"technicianNotes" = $${paramIndex++}`);
      values.push(technicianNotes);
    }
    if (recommendations !== undefined) {
      setClauses.push(`recommendations = $${paramIndex++}`);
      values.push(recommendations);
    }
    if (serviceHistory !== undefined) {
      setClauses.push(`"serviceHistory" = $${paramIndex++}`);
      values.push(serviceHistory ? (typeof serviceHistory === 'string' ? serviceHistory : JSON.stringify(serviceHistory)) : null);
    }
    if (remarks !== undefined) {
      setClauses.push(`remarks = $${paramIndex++}`);
      values.push(remarks);
    }
    if (workOrderId !== undefined) {
      setClauses.push(`"workOrderId" = $${paramIndex++}`);
      values.push(workOrderId);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    setClauses.push(`"updatedAt" = NOW()`);
    values.push(id);
    values.push(session.companyId);

    const sql = `UPDATE "Certificate" SET ${setClauses.join(', ')} WHERE id = $${paramIndex++} AND "companyId" = $${paramIndex} RETURNING *`;
    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
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
    const result = await query(
      `DELETE FROM "Certificate" WHERE id = $1 AND "companyId" = $2`,
      [id, session.companyId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
