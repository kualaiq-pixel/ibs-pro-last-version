import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyCode, username, password } = body;

    if (!companyCode || !username || !password) {
      return NextResponse.json(
        { error: 'companyCode, username, and password are required' },
        { status: 400 }
      );
    }

    // Find user by username and company code
    const user = await queryOne<any>(
      `SELECT u.*, c.name as "companyName", c."isActive" as "companyActive",
              c."trialEnd" as "companyTrialEnd"
       FROM "User" u
       JOIN "Company" c ON u."companyId" = c.id
       WHERE u.username = $1 AND c.code = $2`,
      [username, companyCode]
    );

    if (!user) {
      return NextResponse.json({ error: 'invalidCredentials' }, { status: 401 });
    }

    if (!user.companyActive) {
      return NextResponse.json({ error: 'accountRejected' }, { status: 403 });
    }

    if (user.companyTrialEnd && new Date() > new Date(user.companyTrialEnd)) {
      return NextResponse.json({ error: 'accountRejected' }, { status: 403 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'invalidCredentials' }, { status: 401 });
    }

    // Create session
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await queryOne(
      `INSERT INTO "Session" (id, "userId", "userType", username, "companyId", token, "expiresAt", "createdAt")
       VALUES ($1, $2, 'user', $3, $4, $5, $6, NOW())`,
      [crypto.randomUUID(), user.id, user.username, user.companyId, token, expiresAt]
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        companyId: user.companyId,
        companyName: user.companyName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
