import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, generateId } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { key, value } = body;

    const existing = await queryOne<{ id: string; key: string }>(
      'SELECT id, key FROM "ContactInfo" WHERE id = $1',
      [id]
    );
    if (!existing) {
      return NextResponse.json({ error: 'Contact info not found' }, { status: 404 });
    }

    if (key && key !== existing.key) {
      const keyExists = await queryOne<{ id: string }>(
        'SELECT id FROM "ContactInfo" WHERE key = $1',
        [key]
      );
      if (keyExists) {
        return NextResponse.json({ error: 'Key already exists' }, { status: 400 });
      }
    }

    const finalKey = key || existing.key;
    await query(
      `UPDATE "ContactInfo"
       SET key = $1, value = $2
       WHERE id = $3`,
      [finalKey, value !== undefined ? value : null, id]
    );

    await query(
      `INSERT INTO "AuditLog" (id, user, action, "adminId", timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [generateId(), session.username, `Updated contact info: ${existing.key} -> ${finalKey}`, session.userId || null]
    );

    const contactInfo = await queryOne<Record<string, unknown>>(
      'SELECT * FROM "ContactInfo" WHERE id = $1',
      [id]
    );

    return NextResponse.json(contactInfo);
  } catch (error) {
    console.error('Contact info PUT error:', error);
    return NextResponse.json({ error: 'Failed to update contact info' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await queryOne<{ id: string; key: string }>(
      'SELECT id, key FROM "ContactInfo" WHERE id = $1',
      [id]
    );
    if (!existing) {
      return NextResponse.json({ error: 'Contact info not found' }, { status: 404 });
    }

    await query('DELETE FROM "ContactInfo" WHERE id = $1', [id]);

    await query(
      `INSERT INTO "AuditLog" (id, user, action, "adminId", timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [generateId(), session.username, `Deleted contact info: ${existing.key}`, session.userId || null]
    );

    return NextResponse.json({ message: 'Contact info deleted' });
  } catch (error) {
    console.error('Contact info DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete contact info' }, { status: 500 });
  }
}
