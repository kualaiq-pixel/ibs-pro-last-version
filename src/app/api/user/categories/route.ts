import { NextRequest, NextResponse } from 'next/server';
import { query, queryAll, generateId } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type) {
      const categories = await queryAll(
        `SELECT * FROM "Category" WHERE "companyId" = $1 AND type = $2 ORDER BY name ASC`,
        [session.companyId, type]
      );
      return NextResponse.json(categories);
    }

    const categories = await queryAll(
      `SELECT * FROM "Category" WHERE "companyId" = $1 ORDER BY name ASC`,
      [session.companyId]
    );

    return NextResponse.json(categories);
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
    const { name, type } = body;

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json({ error: 'Type must be income or expense' }, { status: 400 });
    }

    const id = generateId();
    const result = await query(
      `INSERT INTO "Category" (id, name, type, "companyId") VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, name, type, session.companyId]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
