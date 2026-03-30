import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, generateId } from '@/lib/db';
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

    const registration = await queryOne<{
      id: string;
      companyName: string;
      username: string;
      password: string;
      phone: string | null;
      businessId: string | null;
      vatId: string | null;
      iban: string | null;
      address: string | null;
      zipCode: string | null;
      city: string | null;
      country: string | null;
      status: string;
    }>(
      'SELECT * FROM "Registration" WHERE id = $1',
      [id]
    );
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (registration.status !== 'pending') {
      return NextResponse.json({ error: 'Registration is not pending' }, { status: 400 });
    }

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14);

    // Create company with trial period
    const companyCode = registration.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 10) + Date.now().toString().slice(-4);

    const companyId = generateId();
    await query(
      `INSERT INTO "Company" (id, name, code, "businessId", "vatId", iban, phone, address, "zipCode", city, country, "isActive", "trialStart", "trialEnd", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, NOW(), $12, NOW(), NOW())`,
      [companyId, registration.companyName, companyCode, registration.businessId, registration.vatId, registration.iban, registration.phone, registration.address, registration.zipCode, registration.city, registration.country, trialEnd]
    );

    // Create user from registration data
    const hashedPassword = await hashPassword(registration.password);
    await query(
      `INSERT INTO "User" (id, username, password, role, "companyId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [generateId(), registration.username, hashedPassword, 'Admin', companyId]
    );

    // Update registration status
    await query(
      `UPDATE "Registration"
       SET status = 'trial', "reviewedBy" = $1, "trialStart" = NOW(), "trialEnd" = $2, "updatedAt" = NOW()
       WHERE id = $3`,
      [session.username, trialEnd, id]
    );

    await query(
      `INSERT INTO "AuditLog" (id, user, action, "adminId", timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [generateId(), session.username, `Set trial for registration: ${registration.companyName} by ${registration.username} (14 days)`, session.userId || null]
    );

    const company = await queryOne<Record<string, unknown>>(
      'SELECT * FROM "Company" WHERE id = $1',
      [companyId]
    );

    return NextResponse.json({
      message: 'Trial period activated (14 days)',
      company,
      trialEnd,
    });
  } catch (error) {
    console.error('Registration trial error:', error);
    return NextResponse.json({ error: 'Failed to activate trial' }, { status: 500 });
  }
}
