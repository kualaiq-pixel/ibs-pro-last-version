'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Receipt, FileText, Calendar } from 'lucide-react';

interface DashboardData {
  totalIncomeThisMonth: number;
  totalExpensesThisMonth: number;
  pendingInvoices: number;
  activeBookings: number;
  recentIncome: Array<{ id: string; date: string; description: string; totalAmount: number; customerName?: string }>;
  upcomingBookings: Array<{ id: string; bookingDate: string; customerName?: string; serviceType?: string }>;
}

export default function UserHome() {
  const { locale } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('ibs-token');
      const res = await fetch('/api/user/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const cur = t('common.currency', locale);

  const summaryCards = [
    {
      title: t('user.income', locale),
      value: data ? `${data.totalIncomeThisMonth.toFixed(2)}${cur}` : '0.00',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: t('user.expenses', locale),
      value: data ? `${data.totalExpensesThisMonth.toFixed(2)}${cur}` : '0.00',
      icon: Receipt,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: t('invoice.totalPending', locale),
      value: data ? String(data.pendingInvoices) : '0',
      icon: FileText,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: t('user.bookings', locale),
      value: data ? String(data.activeBookings) : '0',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('user.home', locale)}</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2.5 rounded-lg ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading && <p className="text-muted-foreground">{t('common.loading', locale)}</p>}

      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Income */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('user.income', locale)}</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {data.recentIncome.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('common.noData', locale)}</p>
              ) : (
                <div className="space-y-3">
                  {data.recentIncome.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{item.description || item.customerName || '—'}</p>
                        <p className="text-xs text-muted-foreground">{item.date ? new Date(item.date).toLocaleDateString() : ''}</p>
                      </div>
                      <span className="font-semibold text-emerald-600">
                        {(item.totalAmount || 0).toFixed(2)}{cur}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Bookings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('user.bookings', locale)}</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {data.upcomingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('common.noData', locale)}</p>
              ) : (
                <div className="space-y-3">
                  {data.upcomingBookings.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{item.customerName || '—'}</p>
                        <p className="text-xs text-muted-foreground">{item.serviceType || ''}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.bookingDate ? new Date(item.bookingDate).toLocaleDateString() : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
