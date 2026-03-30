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
    const { name, code, businessId, vatId, iban, phone, email, address, zipCode, city, country, isActive } = body;

    const existing = await queryOne<{ id: string; name: string; code: string }>(
      'SELECT id, name, code FROM "Company" WHERE id = $1',
      [id]
    );
    if (!existing) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (code && code !== existing.code) {
      const codeExists = await queryOne<{ id: string }>(
        'SELECT id FROM "Company" WHERE code = $1',
        [code]
      );
      if (codeExists) {
        return NextResponse.json({ error: 'Company code already exists' }, { status: 400 });
      }
    }

    await query(
      `UPDATE "Company"
       SET name = COALESCE($1, name),
           code = COALESCE($2, code),
           "businessId" = CASE WHEN $3 IS NOT NULL THEN $3 ELSE "businessId" END,
           "vatId" = CASE WHEN $4 IS NOT NULL THEN $4 ELSE "vatId" END,
           iban = CASE WHEN $5 IS NOT NULL THEN $5 ELSE iban END,
           phone = CASE WHEN $6 IS NOT NULL THEN $6 ELSE phone END,
           email = CASE WHEN $7 IS NOT NULL THEN $7 ELSE email END,
           address = CASE WHEN $8 IS NOT NULL THEN $8 ELSE address END,
           "zipCode" = CASE WHEN $9 IS NOT NULL THEN $9 ELSE "zipCode" END,
           city = CASE WHEN $10 IS NOT NULL THEN $10 ELSE city END,
           country = CASE WHEN $11 IS NOT NULL THEN $11 ELSE country END,
           "isActive" = CASE WHEN $12 IS NOT NULL THEN $12 ELSE "isActive" END,
           "updatedAt" = NOW()
       WHERE id = $13`,
      [name || null, code || null, businessId !== undefined ? businessId : null, vatId !== undefined ? vatId : null, iban !== undefined ? iban : null, phone !== undefined ? phone : null, email !== undefined ? email : null, address !== undefined ? address : null, zipCode !== undefined ? zipCode : null, city !== undefined ? city : null, country !== undefined ? country : null, isActive !== undefined ? isActive : null, id]
    );

    const finalCode = code || existing.code;
    const finalName = name || existing.name;

    await query(
      `INSERT INTO "AuditLog" (id, user, action, "adminId", timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [generateId(), session.username, `Updated company: ${finalName} (${finalCode})`, session.userId || null]
    );

    const company = await queryOne<Record<string, unknown>>(
      'SELECT * FROM "Company" WHERE id = $1',
      [id]
    );

    return NextResponse.json(company);
  } catch (error) {
    console.error('Company PUT error:', error);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
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
    const existing = await queryOne<{ id: string; name: string; code: string }>(
      'SELECT id, name, code FROM "Company" WHERE id = $1',
      [id]
    );
    if (!existing) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    await query('DELETE FROM "Company" WHERE id = $1', [id]);

    await query(
      `INSERT INTO "AuditLog" (id, user, action, "adminId", timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [generateId(), session.username, `Deleted company: ${existing.name} (${existing.code})`, session.userId || null]
    );

    return NextResponse.json({ message: 'Company deleted' });
  } catch (error) {
    console.error('Company DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}
