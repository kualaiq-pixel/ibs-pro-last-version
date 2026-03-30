import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const session = await db.session.findFirst({ where: { token, userType: 'admin' } });
  if (!session || session.expiresAt < new Date()) return null;
  return session;
}

export async function verifyUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const session = await db.session.findFirst({ where: { token, userType: 'user' } });
  if (!session || session.expiresAt < new Date()) return null;
  return session;
}
