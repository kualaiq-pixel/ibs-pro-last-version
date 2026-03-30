import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, generateId } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const links = await query(
      `SELECT * FROM "ShkLink" WHERE "companyId" = $1`,
      [session.companyId]
    );

    return NextResponse.json(links.rows);
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
    const { name, url, username, password } = body;

    // Check if SHK link already exists for this company
    const existing = await queryOne(
      `SELECT * FROM "ShkLink" WHERE "companyId" = $1`,
      [session.companyId]
    );

    if (existing) {
      const result = await query(
        `UPDATE "ShkLink" SET name = $1, url = $2, username = $3, password = $4, "updatedAt" = NOW() WHERE id = $5 RETURNING *`,
        [name, url, username, password, existing.id]
      );
      return NextResponse.json(result.rows[0]);
    }

    const id = generateId();
    const result = await query(
      `INSERT INTO "ShkLink" (id, name, url, username, password, "companyId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [id, name, url, username, password, session.companyId]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
