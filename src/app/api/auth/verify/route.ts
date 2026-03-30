import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    const session = await queryOne<any>(
      'SELECT * FROM "Session" WHERE token = $1',
      [token]
    );

    if (!session) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (new Date() > new Date(session.expiresAt)) {
      await queryOne('DELETE FROM "Session" WHERE id = $1', [session.id]);
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    if (session.userType === 'admin') {
      return NextResponse.json({
        userType: 'admin',
        username: session.username,
      });
    }

    if (session.userType === 'user' && session.userId && session.companyId) {
      const user = await queryOne<any>(
        `SELECT u.*, c.name as "companyName" FROM "User" u JOIN "Company" c ON u."companyId" = c.id WHERE u.id = $1`,
        [session.userId]
      );

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }

      return NextResponse.json({
        userType: 'user',
        id: user.id,
        username: user.username,
        role: user.role,
        companyId: user.companyId,
        companyName: user.companyName,
      });
    }

    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
