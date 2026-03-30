import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName, username, password, phone, businessId,
      vatId, iban, address, zipCode, city, country,
    } = body;

    if (!companyName || !username || !password) {
      return NextResponse.json(
        { error: 'companyName, username, and password are required' },
        { status: 400 }
      );
    }

    // Check if username already exists in Registration table
    const existing = await queryOne(
      'SELECT id FROM "Registration" WHERE username = $1',
      [username]
    );
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    await queryOne(
      `INSERT INTO "Registration" (id, "companyName", username, password, phone, "businessId", "vatId", iban, address, "zipCode", city, country, status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending', NOW(), NOW())`,
      [id, companyName, username, hashedPassword, phone || null, businessId || null, vatId || null, iban || null, address || null, zipCode || null, city || null, country || null]
    );

    return NextResponse.json(
      { message: 'Registration submitted successfully. Your application is pending review.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
