'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { getAuthHeaders } from './shared';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ReportData {
  incomeByCategory: Array<{ category: string; total: number }>;
  expenseByCategory: Array<{ category: string; total: number }>;
  netProfit: number;
  monthlyData: Array<{ month: string; income: number; expenses: number }>;
}

export default function ReportsPage() {
  const { locale } = useAppStore();
  const cur = t('common.currency', locale);

  const [reportType, setReportType] = useState('full');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(0);
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/reports', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reportType, startDate, endDate }),
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('report.title', locale)}</h1>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>{t('report.type', locale)}</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">{t('report.fullFinancial', locale)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('report.startDate', locale)}</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('report.endDate', locale)}</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button onClick={generateReport} disabled={loading}>
              <BarChart3 className="h-4 w-4 me-2" />
              {t('report.generate', locale)}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && <p className="text-muted-foreground">{t('common.loading', locale)}</p>}

      {report && (
        <>
          {/* Net Profit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-emerald-50">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('user.income', locale)}</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {report.incomeByCategory.reduce((s, c) => s + c.total, 0).toFixed(2)}{cur}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-red-50">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('user.expenses', locale)}</p>
                  <p className="text-xl font-bold text-red-600">
                    {report.expenseByCategory.reduce((s, c) => s + c.total, 0).toFixed(2)}{cur}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2.5 rounded-lg ${report.netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <BarChart3 className={`h-5 w-5 ${report.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Profit/Loss</p>
                  <p className={`text-xl font-bold ${report.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {report.netProfit.toFixed(2)}{cur}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          {report.monthlyData && report.monthlyData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t('user.income', locale)} vs {t('user.expenses', locale)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number) => `${value.toFixed(2)}${cur}`}
                      />
                      <Legend />
                      <Bar dataKey="income" fill="#10b981" name={t('user.income', locale)} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill="#ef4444" name={t('user.expenses', locale)} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('user.income', locale)} by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.incomeByCategory.map((item) => (
                    <div key={item.category} className="flex justify-between items-center text-sm">
                      <span>{item.category}</span>
                      <span className="font-semibold">{item.total.toFixed(2)}{cur}</span>
                    </div>
                  ))}
                  {report.incomeByCategory.length === 0 && (
                    <p className="text-sm text-muted-foreground">{t('common.noData', locale)}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('user.expenses', locale)} by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.expenseByCategory.map((item) => (
                    <div key={item.category} className="flex justify-between items-center text-sm">
                      <span>{item.category}</span>
                      <span className="font-semibold">{item.total.toFixed(2)}{cur}</span>
                    </div>
                  ))}
                  {report.expenseByCategory.length === 0 && (
                    <p className="text-sm text-muted-foreground">{t('common.noData', locale)}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
