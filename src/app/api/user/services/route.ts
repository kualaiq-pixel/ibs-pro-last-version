import { NextRequest, NextResponse } from 'next/server';
import { query, queryAll, generateId } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const services = await queryAll(
      `SELECT * FROM "Service" WHERE "companyId" = $1 ORDER BY name ASC`,
      [session.companyId]
    );

    return NextResponse.json(services);
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
    const { name } = body;

    const id = generateId();
    const result = await query(
      `INSERT INTO "Service" (id, name, "companyId") VALUES ($1, $2, $3) RETURNING *`,
      [id, name, session.companyId]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
