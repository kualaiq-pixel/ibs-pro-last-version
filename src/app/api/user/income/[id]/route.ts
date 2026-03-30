import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
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

    // Build dynamic SET clause for partial update
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (date !== undefined) {
      setClauses.push(`date = $${paramIndex++}`);
      values.push(new Date(date).toISOString());
    }
    if (category !== undefined) {
      setClauses.push(`category = $${paramIndex++}`);
      values.push(category);
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
    if (services !== undefined) {
      setClauses.push(`services = $${paramIndex++}`);
      values.push(typeof services === 'string' ? services : JSON.stringify(services));
    }
    if (totalAmount !== undefined) {
      setClauses.push(`"totalAmount" = $${paramIndex++}`);
      values.push(totalAmount);
    }
    if (vatRate !== undefined) {
      setClauses.push(`"vatRate" = $${paramIndex++}`);
      values.push(vatRate);
    }
    if (paymentMethod !== undefined) {
      setClauses.push(`"paymentMethod" = $${paramIndex++}`);
      values.push(paymentMethod);
    }
    if (description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (invoiceId !== undefined) {
      setClauses.push(`"invoiceId" = $${paramIndex++}`);
      values.push(invoiceId);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    setClauses.push(`"updatedAt" = NOW()`);
    values.push(id);
    values.push(session.companyId);

    const sql = `UPDATE "Income" SET ${setClauses.join(', ')} WHERE id = $${paramIndex++} AND "companyId" = $${paramIndex} RETURNING *`;
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
      `DELETE FROM "Income" WHERE id = $1 AND "companyId" = $2`,
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
