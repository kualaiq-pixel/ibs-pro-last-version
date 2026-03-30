import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyCode, username, password } = body;

    // Validate required fields
    if (!companyCode || !username || !password) {
      return NextResponse.json(
        { error: 'companyCode, username, and password are required' },
        { status: 400 }
      );
    }

    // Find User by username and companyCode (via company relation)
    const user = await db.user.findFirst({
      where: {
        username,
        company: {
          code: companyCode,
        },
      },
      include: {
        company: true,
      },
    });

    // If not found, return 401
    if (!user) {
      return NextResponse.json(
        { error: 'invalidCredentials' },
        { status: 401 }
      );
    }

    // Check if company is active
    if (!user.company.isActive) {
      return NextResponse.json(
        { error: 'accountRejected' },
        { status: 403 }
      );
    }

    // Check if trial is not expired
    if (user.company.trialEnd && new Date() > user.company.trialEnd) {
      return NextResponse.json(
        { error: 'accountRejected' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'invalidCredentials' },
        { status: 401 }
      );
    }

    // Create session token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.session.create({
      data: {
        userId: user.id,
        userType: 'user',
        username: user.username,
        companyId: user.companyId,
        token,
        expiresAt,
      },
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        companyId: user.companyId,
        companyName: user.company.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
