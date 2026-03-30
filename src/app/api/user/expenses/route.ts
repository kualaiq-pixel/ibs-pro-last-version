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
      `SELECT e.*, c.name AS "customerName"
       FROM "Expense" e
       LEFT JOIN "Customer" c ON e."customerId" = c.id
       WHERE e."companyId" = $1
       ORDER BY e.date DESC`,
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
    const { date, amount, category, description, paymentMethod, vatRate, customerId } = body;

    const id = generateId();
    const result = await query(
      `INSERT INTO "Expense" (id, date, description, category, amount, "vatRate", "paymentMethod", "companyId", "customerId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [id, new Date(date).toISOString(), description || null, category, amount, vatRate || 25.5, paymentMethod, session.companyId, customerId || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
