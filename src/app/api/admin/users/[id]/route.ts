import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (username && username !== existing.username) {
      const usernameExists = await db.user.findFirst({ where: { username } });
      if (usernameExists) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }
    }

    if (companyId) {
      const company = await db.company.findUnique({ where: { id: companyId } });
      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }
    }

    const data: Record<string, unknown> = {};
    if (username) data.username = username;
    if (password) data.password = await hashPassword(password);
    if (role) data.role = role;
    if (companyId) data.companyId = companyId;

    const user = await db.user.update({
      where: { id },
      data,
    });

    await db.auditLog.create({
      data: {
        user: session.username,
        action: `Updated user: ${user.username}`,
        adminId: session.userId || null,
      },
    });

    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser);
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
    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await db.user.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        user: session.username,
        action: `Deleted user: ${existing.username}`,
        adminId: session.userId || null,
      },
    });

    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('User DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
