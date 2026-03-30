import { NextRequest, NextResponse } from 'next/server';
import { query, queryAll, generateId } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await queryAll(
      `SELECT b.*, c.name AS "customerName"
       FROM "Booking" b
       LEFT JOIN "Customer" c ON b."customerId" = c.id
       WHERE b."companyId" = $1
       ORDER BY b."bookingDate" DESC`,
      [session.companyId]
    );

    return NextResponse.json(records);
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
    const {
      customerId, customerName, customerEmail, customerAddress,
      vehicleMake, vehicleModel, licensePlate,
      bookingDate, serviceType, notes,
    } = body;

    let finalCustomerId = customerId || null;
    if (!finalCustomerId && customerName) {
      const newCustomerId = generateId();
      await query(
        `INSERT INTO "Customer" (id, name, email, address, "companyId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [newCustomerId, customerName, customerEmail || null, customerAddress || null, session.companyId]
      );
      finalCustomerId = newCustomerId;
    }

    const id = generateId();
    const result = await query(
      `INSERT INTO "Booking" (id, "customerId", "vehicleMake", "vehicleModel", "licensePlate", "serviceType", "bookingDate", notes, "companyId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [id, finalCustomerId, vehicleMake || null, vehicleModel || null, licensePlate || null, serviceType, new Date(bookingDate).toISOString(), notes || null, session.companyId]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
