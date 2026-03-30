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
    const { name, email, address } = body;

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (email !== undefined) {
      setClauses.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (address !== undefined) {
      setClauses.push(`address = $${paramIndex++}`);
      values.push(address);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    setClauses.push(`"updatedAt" = NOW()`);
    values.push(id);
    values.push(session.companyId);

    const sql = `UPDATE "Customer" SET ${setClauses.join(', ')} WHERE id = $${paramIndex++} AND "companyId" = $${paramIndex} RETURNING *`;
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
      `DELETE FROM "Customer" WHERE id = $1 AND "companyId" = $2`,
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
