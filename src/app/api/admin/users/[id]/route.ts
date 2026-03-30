import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, generateId } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';
import { hashPassword } from '@/lib/auth';

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
    const { username, password, role, companyId } = body;

    const existing = await queryOne<{ id: string; username: string }>(
      'SELECT id, username FROM "User" WHERE id = $1',
      [id]
    );
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (username && username !== existing.username) {
      const usernameExists = await queryOne<{ id: string }>(
        'SELECT id FROM "User" WHERE username = $1',
        [username]
      );
      if (usernameExists) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }
    }

    if (companyId) {
      const company = await queryOne<{ id: string }>(
        'SELECT id FROM "Company" WHERE id = $1',
        [companyId]
      );
      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }
    }

    const hashedPassword = password ? await hashPassword(password) : null;

    await query(
      `UPDATE "User"
       SET username = COALESCE($1, username),
           password = COALESCE($2, password),
           role = COALESCE($3, role),
           "companyId" = COALESCE($4, "companyId"),
           "updatedAt" = NOW()
       WHERE id = $5`,
      [username || null, hashedPassword, role || null, companyId || null, id]
    );

    await query(
      `INSERT INTO "AuditLog" (id, user, action, "adminId", timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [generateId(), session.username, `Updated user: ${username || existing.username}`, session.userId || null]
    );

    const user = await queryOne<Record<string, unknown>>(
      `SELECT u.id, u.username, u.role, u."companyId", u."createdAt", u."updatedAt",
              c.name as "companyName", c.code as "companyCode"
       FROM "User" u
       JOIN "Company" c ON u."companyId" = c.id
       WHERE u.id = $1`,
      [id]
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error('User PUT error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
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
    const existing = await queryOne<{ id: string; username: string }>(
      'SELECT id, username FROM "User" WHERE id = $1',
      [id]
    );
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await query('DELETE FROM "User" WHERE id = $1', [id]);

    await query(
      `INSERT INTO "AuditLog" (id, user, action, "adminId", timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [generateId(), session.username, `Deleted user: ${existing.username}`, session.userId || null]
    );

    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('User DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
