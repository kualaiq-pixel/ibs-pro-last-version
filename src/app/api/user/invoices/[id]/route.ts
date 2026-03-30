import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (status !== 'Pending' && status !== 'Paid') {
      return NextResponse.json({ error: 'Invalid status. Must be Pending or Paid' }, { status: 400 });
    }

    const result = await query(
      `UPDATE "Invoice" SET status = $1, "updatedAt" = NOW() WHERE id = $2 AND "companyId" = $3 RETURNING *`,
      [status, id, session.companyId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
