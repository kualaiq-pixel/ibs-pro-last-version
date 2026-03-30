import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne, generateId } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';
import { hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await queryAll<Record<string, unknown>>(
      `SELECT u.id, u.username, u.role, u."companyId", u."createdAt", u."updatedAt",
              c.name as "companyName", c.code as "companyCode"
       FROM "User" u
       JOIN "Company" c ON u."companyId" = c.id
       ORDER BY u."createdAt" DESC`
    );

    return NextResponse.json(users);
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, password, role, companyId } = body;

    if (!username || !password || !companyId) {
      return NextResponse.json({ error: 'Username, password, and companyId are required' }, { status: 400 });
    }

    const company = await queryOne<{ id: string; name: string }>(
      'SELECT id, name FROM "Company" WHERE id = $1',
      [companyId]
    );
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const existingUser = await queryOne<{ id: string }>(
      'SELECT id FROM "User" WHERE username = $1',
      [username]
    );
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const id = generateId();
    const userRole = role || 'Staff';

    await query(
      `INSERT INTO "User" (id, username, password, role, "companyId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [id, username, hashedPassword, userRole, companyId]
    );

    await query(
      `INSERT INTO "AuditLog" (id, user, action, "adminId", timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [generateId(), session.username, `Created user: ${username} (${userRole}) in company: ${company.name}`, session.userId || null]
    );

    const user = await queryOne<Record<string, unknown>>(
      `SELECT u.id, u.username, u.role, u."companyId", u."createdAt", u."updatedAt",
              c.name as "companyName", c.code as "companyCode"
       FROM "User" u
       JOIN "Company" c ON u."companyId" = c.id
       WHERE u.id = $1`,
      [id]
    );

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Users POST error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
