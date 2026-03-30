import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUser } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyUser(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reportType, startDate, endDate } = body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch income and expense records in the date range
    const [incomeRecords, expenseRecords] = await Promise.all([
      db.income.findMany({
        where: {
          companyId: session.companyId,
          date: { gte: start, lte: end },
        },
      }),
      db.expense.findMany({
        where: {
          companyId: session.companyId,
          date: { gte: start, lte: end },
        },
      }),
    ]);

    // Group income by category
    const incomeByCategory: Record<string, number> = {};
    let totalIncome = 0;
    for (const record of incomeRecords) {
      const cat = record.category || 'Uncategorized';
      incomeByCategory[cat] = (incomeByCategory[cat] || 0) + record.totalAmount;
      totalIncome += record.totalAmount;
    }

    // Group expenses by category
    const expenseByCategory: Record<string, number> = {};
    let totalExpenses = 0;
    for (const record of expenseRecords) {
      const cat = record.category || 'Uncategorized';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + record.amount;
      totalExpenses += record.amount;
    }

    // Build monthly data
    const monthlyData: { month: string; income: number; expenses: number }[] = [];
    const currentMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (currentMonth <= endMonth) {
      const monthStart = new Date(currentMonth);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthIncome = incomeRecords
        .filter((r) => r.date >= monthStart && r.date <= monthEnd)
        .reduce((sum, r) => sum + r.totalAmount, 0);

      const monthExpenses = expenseRecords
        .filter((r) => r.date >= monthStart && r.date <= monthEnd)
        .reduce((sum, r) => sum + r.amount, 0);

      const monthLabel = currentMonth.toLocaleString('en-US', { year: 'numeric', month: 'short' });
      monthlyData.push({ month: monthLabel, income: monthIncome, expenses: monthExpenses });

      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    return NextResponse.json({
      incomeByCategory: Object.entries(incomeByCategory).map(([category, amount]) => ({ category, amount })),
      expenseByCategory: Object.entries(expenseByCategory).map(([category, amount]) => ({ category, amount })),
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      monthlyData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
