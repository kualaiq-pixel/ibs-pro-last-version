import { queryOne } from '@/lib/db';
import { NextRequest } from 'next/server';

export interface SessionRow {
  id: string;
  userId: string | null;
  userType: string;
  username: string;
  companyId: string | null;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export async function verifyAdmin(request: NextRequest): Promise<SessionRow | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const session = await queryOne<SessionRow>(
    'SELECT * FROM "Session" WHERE token = $1 AND "userType" = \'admin\'',
    [token]
  );
  if (!session || new Date(session.expiresAt) < new Date()) return null;
  return session;
}

export async function verifyUser(request: NextRequest): Promise<SessionRow | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const session = await queryOne<SessionRow>(
    'SELECT * FROM "Session" WHERE token = $1 AND "userType" = \'user\'',
    [token]
  );
  if (!session || new Date(session.expiresAt) < new Date()) return null;
  return session;
}
