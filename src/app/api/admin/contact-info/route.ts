import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contactInfo = await db.contactInfo.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(contactInfo);
  } catch (error) {
    console.error('Contact info GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch contact info' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    const existing = await db.contactInfo.findUnique({ where: { key } });
    if (existing) {
      return NextResponse.json({ error: 'Key already exists' }, { status: 400 });
    }

    const contactInfo = await db.contactInfo.create({
      data: { key, value },
    });

    await db.auditLog.create({
      data: {
        user: session.username,
        action: `Created contact info: ${key}`,
        adminId: session.userId || null,
      },
    });

    return NextResponse.json(contactInfo, { status: 201 });
  } catch (error) {
    console.error('Contact info POST error:', error);
    return NextResponse.json({ error: 'Failed to create contact info' }, { status: 500 });
  }
}
