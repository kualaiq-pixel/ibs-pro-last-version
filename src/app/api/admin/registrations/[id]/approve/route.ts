import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';
import { hashPassword } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const registration = await db.registration.findUnique({ where: { id } });
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (registration.status !== 'pending') {
      return NextResponse.json({ error: 'Registration is not pending' }, { status: 400 });
    }

    // Create company from registration data
    const companyCode = registration.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 10) + Date.now().toString().slice(-4);

    const company = await db.company.create({
      data: {
        name: registration.companyName,
        code: companyCode,
        businessId: registration.businessId,
        vatId: registration.vatId,
        iban: registration.iban,
        address: registration.address,
        zipCode: registration.zipCode,
        city: registration.city,
        country: registration.country,
        phone: registration.phone,
      },
    });

    // Create user from registration data
    const hashedPassword = await hashPassword(registration.password);
    await db.user.create({
      data: {
        username: registration.username,
        password: hashedPassword,
        role: 'Admin',
        companyId: company.id,
      },
    });

    // Update registration status
    await db.registration.update({
      where: { id },
      data: {
        status: 'approved',
        reviewedBy: session.username,
      },
    });

    await db.auditLog.create({
      data: {
        user: session.username,
        action: `Approved registration: ${registration.companyName} by ${registration.username}`,
        adminId: session.userId || null,
      },
    });

    return NextResponse.json({
      message: 'Registration approved',
      company,
    });
  } catch (error) {
    console.error('Registration approve error:', error);
    return NextResponse.json({ error: 'Failed to approve registration' }, { status: 500 });
  }
}
