import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne, generateId } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contactInfo = await queryAll<Record<string, unknown>>(
      'SELECT * FROM "ContactInfo" ORDER BY id ASC'
    );

    return NextResponse.json(contactInfo);
  } catch (error) {
    console.error('Contact info GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch contact info' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM "ContactInfo" WHERE key = $1',
      [key]
    );
    if (existing) {
      return NextResponse.json({ error: 'Key already exists' }, { status: 400 });
    }

    const id = generateId();
    await query(
      'INSERT INTO "ContactInfo" (id, key, value) VALUES ($1, $2, $3)',
      [id, key, value]
    );

    await query(
      `INSERT INTO "AuditLog" (id, user, action, "adminId", timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [generateId(), session.username, `Created contact info: ${key}`, session.userId || null]
    );

    const contactInfo = await queryOne<Record<string, unknown>>(
      'SELECT * FROM "ContactInfo" WHERE id = $1',
      [id]
    );

    return NextResponse.json(contactInfo, { status: 201 });
  } catch (error) {
    console.error('Contact info POST error:', error);
    return NextResponse.json({ error: 'Failed to create contact info' }, { status: 500 });
  }
}
