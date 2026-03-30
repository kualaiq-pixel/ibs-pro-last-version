import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const company = await queryOne(
      `SELECT * FROM "Company" WHERE id = $1`,
      [session.companyId]
    );

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

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (businessId !== undefined) {
      setClauses.push(`"businessId" = $${paramIndex++}`);
      values.push(businessId);
    }
    if (vatId !== undefined) {
      setClauses.push(`"vatId" = $${paramIndex++}`);
      values.push(vatId);
    }
    if (iban !== undefined) {
      setClauses.push(`iban = $${paramIndex++}`);
      values.push(iban);
    }
    if (phone !== undefined) {
      setClauses.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (email !== undefined) {
      setClauses.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (address !== undefined) {
      setClauses.push(`address = $${paramIndex++}`);
      values.push(address);
    }
    if (zipCode !== undefined) {
      setClauses.push(`"zipCode" = $${paramIndex++}`);
      values.push(zipCode);
    }
    if (city !== undefined) {
      setClauses.push(`city = $${paramIndex++}`);
      values.push(city);
    }
    if (country !== undefined) {
      setClauses.push(`country = $${paramIndex++}`);
      values.push(country);
    }
    if (currency !== undefined) {
      setClauses.push(`currency = $${paramIndex++}`);
      values.push(currency);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    setClauses.push(`"updatedAt" = NOW()`);
    values.push(session.companyId);

    const sql = `UPDATE "Company" SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
