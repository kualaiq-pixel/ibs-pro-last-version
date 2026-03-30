import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

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
    const { key, value } = body;

    const existing = await db.contactInfo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Contact info not found' }, { status: 404 });
    }

    if (key && key !== existing.key) {
      const keyExists = await db.contactInfo.findUnique({ where: { key } });
      if (keyExists) {
        return NextResponse.json({ error: 'Key already exists' }, { status: 400 });
      }
    }

    const contactInfo = await db.contactInfo.update({
      where: { id },
      data: {
        key: key ?? existing.key,
        value: value !== undefined ? value : existing.value,
      },
    });

    await db.auditLog.create({
      data: {
        user: session.username,
        action: `Updated contact info: ${existing.key} -> ${contactInfo.key}`,
        adminId: session.userId || null,
      },
    });

    return NextResponse.json(contactInfo);
  } catch (error) {
    console.error('Contact info PUT error:', error);
    return NextResponse.json({ error: 'Failed to update contact info' }, { status: 500 });
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
    const existing = await db.contactInfo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Contact info not found' }, { status: 404 });
    }

    await db.contactInfo.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        user: session.username,
        action: `Deleted contact info: ${existing.key}`,
        adminId: session.userId || null,
      },
    });

    return NextResponse.json({ message: 'Contact info deleted' });
  } catch (error) {
    console.error('Contact info DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete contact info' }, { status: 500 });
  }
}
