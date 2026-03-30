import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companies = await db.company.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true, customers: true },
        },
      },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Companies GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, code, businessId, vatId, iban, phone, email, address, zipCode, city, country } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    const existing = await db.company.findFirst({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: 'Company code already exists' }, { status: 400 });
    }

    const company = await db.company.create({
      data: {
        name,
        code,
        businessId: businessId || null,
        vatId: vatId || null,
        iban: iban || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        zipCode: zipCode || null,
        city: city || null,
        country: country || null,
      },
    });

    await db.auditLog.create({
      data: {
        user: session.username,
        action: `Created company: ${name} (${code})`,
        adminId: session.userId || null,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Companies POST error:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}
