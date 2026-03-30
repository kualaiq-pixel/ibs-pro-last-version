import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne, generateId } from '@/lib/db';
import { verifyAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companies = await queryAll<
      Record<string, unknown> & {
        id: string;
        name: string;
        code: string;
        businessId: string | null;
        vatId: string | null;
        iban: string | null;
        phone: string | null;
        email: string | null;
        address: string | null;
        zipCode: string | null;
        city: string | null;
        country: string | null;
        currency: string;
        trialStart: Date | null;
        trialEnd: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userCount: number;
        customerCount: number;
      }
    >(
      `SELECT c.*,
        (SELECT COUNT(*) FROM "User" WHERE "companyId" = c.id)::int as "userCount",
        (SELECT COUNT(*) FROM "Customer" WHERE "companyId" = c.id)::int as "customerCount"
       FROM "Company" c
       ORDER BY c."createdAt" DESC`
    );

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

    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM "Company" WHERE code = $1',
      [code]
    );
    if (existing) {
      return NextResponse.json({ error: 'Company code already exists' }, { status: 400 });
    }

    const id = generateId();
    await query(
      `INSERT INTO "Company" (id, name, code, "businessId", "vatId", iban, phone, email, address, "zipCode", city, country, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
      [id, name, code, businessId || null, vatId || null, iban || null, phone || null, email || null, address || null, zipCode || null, city || null, country || null]
    );

    await query(
      `INSERT INTO "AuditLog" (id, user, action, "adminId", timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [generateId(), session.username, `Created company: ${name} (${code})`, session.userId || null]
    );

    const company = await queryOne<Record<string, unknown>>(
      'SELECT * FROM "Company" WHERE id = $1',
      [id]
    );

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Companies POST error:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}
