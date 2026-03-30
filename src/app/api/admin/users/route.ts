import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';
import { hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    // Return users without password hashes
    const safeUsers = users.map(({ password: _, ...user }) => user);

    return NextResponse.json(safeUsers);
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

    const company = await db.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const existingUser = await db.user.findFirst({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || 'Staff',
        companyId,
      },
    });

    await db.auditLog.create({
      data: {
        user: session.username,
        action: `Created user: ${username} (${role || 'Staff'}) in company: ${company.name}`,
        adminId: session.userId || null,
      },
    });

    // Return without password hash
    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Users POST error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
