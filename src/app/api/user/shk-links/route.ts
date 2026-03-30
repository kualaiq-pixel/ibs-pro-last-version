import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const links = await db.shkLink.findMany({
      where: { companyId: session.companyId },
    });

    return NextResponse.json(links);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, url, username, password } = body;

    // Check if SHK link already exists for this company
    const existing = await db.shkLink.findFirst({
      where: { companyId: session.companyId },
    });

    if (existing) {
      // Update existing
      const updated = await db.shkLink.update({
        where: { id: existing.id },
        data: { name, url, username, password },
      });
      return NextResponse.json(updated);
    }

    const link = await db.shkLink.create({
      data: {
        name,
        url,
        username,
        password,
        companyId: session.companyId,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
