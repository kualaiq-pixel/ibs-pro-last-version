import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.companyId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [incomeResult, expenseResult, pendingInvoices, activeBookings, recentIncome, upcomingBookings] =
      await Promise.all([
        db.income.aggregate({
          _sum: { totalAmount: true },
          where: {
            companyId,
            date: { gte: startOfMonth, lt: endOfMonth },
          },
        }),
        db.expense.aggregate({
          _sum: { amount: true },
          where: {
            companyId,
            date: { gte: startOfMonth, lt: endOfMonth },
          },
        }),
        db.invoice.count({
          where: { companyId, status: 'Pending' },
        }),
        db.booking.count({
          where: { companyId, status: { in: ['Scheduled', 'In Progress'] } },
        }),
        db.income.findMany({
          where: { companyId },
          include: { customer: { select: { name: true } } },
          orderBy: { date: 'desc' },
          take: 5,
        }),
        db.booking.findMany({
          where: {
            companyId,
            bookingDate: { gte: now },
            status: { in: ['Scheduled', 'In Progress'] },
          },
          include: { customer: { select: { name: true } } },
          orderBy: { bookingDate: 'asc' },
          take: 5,
        }),
      ]);

    return NextResponse.json({
      totalIncomeThisMonth: incomeResult._sum.totalAmount || 0,
      totalExpensesThisMonth: expenseResult._sum.amount || 0,
      pendingInvoices,
      activeBookings,
      recentIncome,
      upcomingBookings,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
