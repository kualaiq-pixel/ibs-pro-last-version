import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName,
      username,
      password,
      phone,
      businessId,
      vatId,
      iban,
      address,
      zipCode,
      city,
      country,
    } = body;

    // Validate required fields
    if (!companyName || !username || !password) {
      return NextResponse.json(
        { error: 'companyName, username, and password are required' },
        { status: 400 }
      );
    }

    // Check if username already exists in Registration table
    const existingRegistration = await db.registration.findUnique({
      where: { username },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create Registration record with status "pending"
    await db.registration.create({
      data: {
        companyName,
        username,
        password: hashedPassword,
        phone: phone || null,
        businessId: businessId || null,
        vatId: vatId || null,
        iban: iban || null,
        address: address || null,
        zipCode: zipCode || null,
        city: city || null,
        country: country || null,
        status: 'pending',
      },
    });

    return NextResponse.json(
      { message: 'Registration submitted successfully. Your application is pending review.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
