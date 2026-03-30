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
    const { name, code, businessId, vatId, iban, phone, email, address, zipCode, city, country, isActive } = body;

    const existing = await db.company.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (code && code !== existing.code) {
      const codeExists = await db.company.findFirst({ where: { code } });
      if (codeExists) {
        return NextResponse.json({ error: 'Company code already exists' }, { status: 400 });
      }
    }

    const company = await db.company.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        code: code ?? existing.code,
        businessId: businessId !== undefined ? businessId : existing.businessId,
        vatId: vatId !== undefined ? vatId : existing.vatId,
        iban: iban !== undefined ? iban : existing.iban,
        phone: phone !== undefined ? phone : existing.phone,
        email: email !== undefined ? email : existing.email,
        address: address !== undefined ? address : existing.address,
        zipCode: zipCode !== undefined ? zipCode : existing.zipCode,
        city: city !== undefined ? city : existing.city,
        country: country !== undefined ? country : existing.country,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    await db.auditLog.create({
      data: {
        user: session.username,
        action: `Updated company: ${company.name} (${company.code})`,
        adminId: session.userId || null,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Company PUT error:', error);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
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
    const existing = await db.company.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    await db.company.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        user: session.username,
        action: `Deleted company: ${existing.name} (${existing.code})`,
        adminId: session.userId || null,
      },
    });

    return NextResponse.json({ message: 'Company deleted' });
  } catch (error) {
    console.error('Company DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}
