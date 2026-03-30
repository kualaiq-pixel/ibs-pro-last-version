import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';
import { generateFinnishReferenceNumber } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await db.income.findMany({
      where: { companyId: session.companyId },
      include: { customer: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });

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
      date, category, customerId, customerName, customerEmail, customerAddress,
      vehicleMake, vehicleModel, licensePlate, services, totalAmount, vatRate,
      paymentMethod, description, invoiceId,
    } = body;

    // If customerId not provided but customerName is, create a new customer
    let finalCustomerId = customerId || null;
    if (!finalCustomerId && customerName) {
      const newCustomer = await db.customer.create({
        data: {
          name: customerName,
          email: customerEmail || null,
          address: customerAddress || null,
          companyId: session.companyId,
        },
      });
      finalCustomerId = newCustomer.id;
    }

    // Auto-create invoice based on payment method
    let autoInvoiceId = invoiceId || null;
    if (paymentMethod === 'Card' || paymentMethod === 'Cash') {
      const invoiceCount = await db.invoice.count({ where: { companyId: session.companyId } });
      const invoiceNumber = `RCV-${String(invoiceCount + 1).padStart(6, '0')}`;
      const invoice = await db.invoice.create({
        data: {
          invoiceNumber,
          date: new Date(date),
          customerId: finalCustomerId,
          total: totalAmount,
          vatRate: vatRate || 25.5,
          status: 'Paid',
          paymentMethod,
          companyId: session.companyId,
        },
      });
      autoInvoiceId = invoice.id;
    } else if (paymentMethod === 'Bill') {
      const invoiceCount = await db.invoice.count({ where: { companyId: session.companyId } });
      const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;
      const referenceNumber = generateFinnishReferenceNumber();
      const invoice = await db.invoice.create({
        data: {
          invoiceNumber,
          date: new Date(date),
          customerId: finalCustomerId,
          total: totalAmount,
          vatRate: vatRate || 25.5,
          status: 'Pending',
          paymentMethod,
          referenceNumber,
          companyId: session.companyId,
        },
      });
      autoInvoiceId = invoice.id;
    }

    const record = await db.income.create({
      data: {
        date: new Date(date),
        category,
        customerId: finalCustomerId,
        vehicleMake,
        vehicleModel,
        licensePlate,
        services: typeof services === 'string' ? services : JSON.stringify(services),
        totalAmount,
        vatRate: vatRate || 25.5,
        paymentMethod,
        description,
        invoiceId: autoInvoiceId,
        companyId: session.companyId,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
