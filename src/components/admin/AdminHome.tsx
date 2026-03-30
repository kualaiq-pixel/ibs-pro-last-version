'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore, t } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Users, UserCheck, FileText } from 'lucide-react';

interface Stats {
  totalCompanies: number;
  totalUsers: number;
  totalCustomers: number;
  recentLogs: { id: string; timestamp: string; user: string; action: string }[];
}

export default function AdminHome() {
  const { locale } = useAppStore();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStats(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load dashboard stats', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: t('admin.totalCompanies', locale), value: stats?.totalCompanies ?? 0, icon: Building2, color: 'text-blue-600 bg-blue-100' },
    { label: t('admin.totalUsers', locale), value: stats?.totalUsers ?? 0, icon: Users, color: 'text-emerald-600 bg-emerald-100' },
    { label: t('admin.totalCustomers', locale), value: stats?.totalCustomers ?? 0, icon: UserCheck, color: 'text-amber-600 bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">{t('admin.dashboard', locale)}</h3>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Audit Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{t('admin.latestLogs', locale)}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : stats?.recentLogs && stats.recentLogs.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.timestamp', locale)}</TableHead>
                    <TableHead>{t('admin.user', locale)}</TableHead>
                    <TableHead>{t('admin.action', locale)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">{t('common.noData', locale)}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
