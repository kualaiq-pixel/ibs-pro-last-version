import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'username and password are required' },
        { status: 400 }
      );
    }

    const admin = await queryOne<any>(
      'SELECT * FROM "Admin" WHERE username = $1',
      [username]
    );

    if (!admin) {
      return NextResponse.json({ error: 'invalidCredentials' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'invalidCredentials' }, { status: 401 });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await queryOne(
      `INSERT INTO "Session" (id, "userId", "userType", username, "companyId", token, "expiresAt", "createdAt")
       VALUES ($1, NULL, 'admin', $2, NULL, $3, $4, NOW())`,
      [crypto.randomUUID(), admin.username, token, expiresAt]
    );

    return NextResponse.json({ token, username: admin.username });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
