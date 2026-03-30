import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const company = await db.company.findUnique({
      where: { id: session.companyId },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name, businessId, vatId, iban, phone, email, address,
      zipCode, city, country, currency,
    } = body;

    const company = await db.company.update({
      where: { id: session.companyId },
      data: {
        ...(name !== undefined && { name }),
        ...(businessId !== undefined && { businessId }),
        ...(vatId !== undefined && { vatId }),
        ...(iban !== undefined && { iban }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(zipCode !== undefined && { zipCode }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
        ...(currency !== undefined && { currency }),
      },
    });

    return NextResponse.json(company);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
