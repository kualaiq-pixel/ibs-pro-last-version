import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Find session by token
    const session = await db.session.findUnique({
      where: { token },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      // Clean up expired session
      await db.session.delete({
        where: { id: session.id },
      });
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    // Admin session
    if (session.userType === 'admin') {
      return NextResponse.json({
        userType: 'admin',
        username: session.username,
      });
    }

    // User session — look up the full user + company details
    if (session.userType === 'user' && session.userId && session.companyId) {
      const user = await db.user.findUnique({
        where: { id: session.userId },
        include: {
          company: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        userType: 'user',
        id: user.id,
        username: user.username,
        role: user.role,
        companyId: user.companyId,
        companyName: user.company.name,
      });
    }

    // Fallback — shouldn't happen with proper data
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
