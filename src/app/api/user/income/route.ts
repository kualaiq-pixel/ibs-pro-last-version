import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, generateId } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';
import { generateFinnishReferenceNumber } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await query(
      `SELECT i.*, c.name AS "customerName"
       FROM "Income" i
       LEFT JOIN "Customer" c ON i."customerId" = c.id
       WHERE i."companyId" = $1
       ORDER BY i.date DESC`,
      [session.companyId]
    );

    return NextResponse.json(records.rows);
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
      date, category, customerId, customerName, customerEmail, customerAddress,
      vehicleMake, vehicleModel, licensePlate, services, totalAmount, vatRate,
      paymentMethod, description, invoiceId,
    } = body;

    // If customerId not provided but customerName is, create a new customer
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

    // Auto-create invoice/receipt based on payment method
    let autoInvoiceId = invoiceId || null;
    if (paymentMethod === 'Card' || paymentMethod === 'Cash') {
      const invoiceId2 = generateId();
      const countResult = await queryOne<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM "Invoice" WHERE "companyId" = $1`,
        [session.companyId]
      );
      const invoiceNumber = `RCV-${String((parseInt(countResult?.count || '0') + 1)).padStart(6, '0')}`;
      await query(
        `INSERT INTO "Invoice" (id, "invoiceNumber", date, "customerId", total, "vatRate", status, "paymentMethod", "companyId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [invoiceId2, invoiceNumber, new Date(date).toISOString(), finalCustomerId, totalAmount, vatRate || 25.5, 'Paid', paymentMethod, session.companyId]
      );
      autoInvoiceId = invoiceId2;
    } else if (paymentMethod === 'Bill') {
      const invoiceId2 = generateId();
      const countResult = await queryOne<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM "Invoice" WHERE "companyId" = $1`,
        [session.companyId]
      );
      const invoiceNumber = `INV-${String((parseInt(countResult?.count || '0') + 1)).padStart(6, '0')}`;
      const referenceNumber = generateFinnishReferenceNumber();
      await query(
        `INSERT INTO "Invoice" (id, "invoiceNumber", date, "customerId", total, "vatRate", status, "paymentMethod", "referenceNumber", "companyId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [invoiceId2, invoiceNumber, new Date(date).toISOString(), finalCustomerId, totalAmount, vatRate || 25.5, 'Pending', paymentMethod, referenceNumber, session.companyId]
      );
      autoInvoiceId = invoiceId2;
    }

    const id = generateId();
    const servicesStr = typeof services === 'string' ? services : JSON.stringify(services || {});
    const result = await query(
      `INSERT INTO "Income" (id, date, description, category, "customerId", "vehicleMake", "vehicleModel", "licensePlate", services, "totalAmount", "vatRate", "paymentMethod", "invoiceId", "companyId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
       RETURNING *`,
      [id, new Date(date).toISOString(), description || null, category, finalCustomerId, vehicleMake || null, vehicleModel || null, licensePlate || null, servicesStr, totalAmount, vatRate || 25.5, paymentMethod, autoInvoiceId, session.companyId]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
