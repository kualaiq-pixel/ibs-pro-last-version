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
      date, status, customerId, vehicleMake, vehicleModel, licensePlate,
      technician, estimatedHours, actualHours, mileage, workDescription,
      parts, partsCost, laborCost, totalCost, recommendations,
      nextServiceDue, guarantee, warrantyDetails, qualityCheck, technicianNotes,
    } = body;

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (date !== undefined) {
      setClauses.push(`date = $${paramIndex++}`);
      values.push(new Date(date).toISOString());
    }
    if (status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`);
      values.push(status);
    }
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
    if (technician !== undefined) {
      setClauses.push(`technician = $${paramIndex++}`);
      values.push(technician);
    }
    if (estimatedHours !== undefined) {
      setClauses.push(`"estimatedHours" = $${paramIndex++}`);
      values.push(estimatedHours);
    }
    if (actualHours !== undefined) {
      setClauses.push(`"actualHours" = $${paramIndex++}`);
      values.push(actualHours);
    }
    if (mileage !== undefined) {
      setClauses.push(`mileage = $${paramIndex++}`);
      values.push(mileage);
    }
    if (workDescription !== undefined) {
      setClauses.push(`"workDescription" = $${paramIndex++}`);
      values.push(workDescription);
    }
    if (parts !== undefined) {
      setClauses.push(`parts = $${paramIndex++}`);
      values.push(typeof parts === 'string' ? parts : JSON.stringify(parts));
    }
    if (partsCost !== undefined) {
      setClauses.push(`"partsCost" = $${paramIndex++}`);
      values.push(partsCost);
    }
    if (laborCost !== undefined) {
      setClauses.push(`"laborCost" = $${paramIndex++}`);
      values.push(laborCost);
    }
    if (totalCost !== undefined) {
      setClauses.push(`"totalCost" = $${paramIndex++}`);
      values.push(totalCost);
    }
    if (recommendations !== undefined) {
      setClauses.push(`recommendations = $${paramIndex++}`);
      values.push(recommendations);
    }
    if (nextServiceDue !== undefined) {
      setClauses.push(`"nextServiceDue" = $${paramIndex++}`);
      values.push(nextServiceDue ? new Date(nextServiceDue).toISOString() : null);
    }
    if (guarantee !== undefined) {
      setClauses.push(`guarantee = $${paramIndex++}`);
      values.push(guarantee);
    }
    if (warrantyDetails !== undefined) {
      setClauses.push(`"warrantyDetails" = $${paramIndex++}`);
      values.push(warrantyDetails);
    }
    if (qualityCheck !== undefined) {
      setClauses.push(`"qualityCheck" = $${paramIndex++}`);
      values.push(qualityCheck);
    }
    if (technicianNotes !== undefined) {
      setClauses.push(`"technicianNotes" = $${paramIndex++}`);
      values.push(technicianNotes);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    setClauses.push(`"updatedAt" = NOW()`);
    values.push(id);
    values.push(session.companyId);

    const sql = `UPDATE "WorkOrder" SET ${setClauses.join(', ')} WHERE id = $${paramIndex++} AND "companyId" = $${paramIndex} RETURNING *`;
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
      `DELETE FROM "WorkOrder" WHERE id = $1 AND "companyId" = $2`,
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
