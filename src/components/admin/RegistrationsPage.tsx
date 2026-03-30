'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore, t } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserPlus, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { getAdminAuthHeaders } from './shared';

interface Registration {
  id: string;
  companyName: string;
  username: string;
  phone: string | null;
  businessId: string | null;
  vatId: string | null;
  iban: string | null;
  address: string | null;
  zipCode: string | null;
  city: string | null;
  country: string | null;
  status: string;
  createdAt: string;
}

export default function RegistrationsPage() {
  const { locale } = useAppStore();
  const { toast } = useToast();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/registrations', { headers: getAdminAuthHeaders() });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setRegistrations(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load registrations', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'trial') => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/registrations/${id}/${action}`, { method: 'POST', headers: getAdminAuthHeaders() });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Action failed');
      }
      toast({ title: 'Success', description: `Registration ${action}d` });
      fetchRegistrations();
      if (selectedReg?.id === id) setSelectedReg(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Action failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case 'approved': return <Badge className="bg-emerald-100 text-emerald-700">Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      case 'trial': return <Badge className="bg-blue-100 text-blue-700">Trial</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">{t('admin.registrations', locale)}</h3>
        <Badge variant="secondary" className="text-base px-3 py-1">
          {registrations.filter((r) => r.status === 'pending').length} pending
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : registrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <UserPlus className="h-12 w-12 mb-3 opacity-50" />
              <p>{t('common.noData', locale)}</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.companyName', locale)}</TableHead>
                    <TableHead>{t('auth.username', locale)}</TableHead>
                    <TableHead>{t('auth.phoneNumber', locale)}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">{t('common.actions', locale)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.companyName}</TableCell>
                      <TableCell>{reg.username}</TableCell>
                      <TableCell className="text-muted-foreground">{reg.phone || '—'}</TableCell>
                      <TableCell>{statusBadge(reg.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(reg.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        {reg.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" disabled={actionLoading === reg.id} onClick={() => handleAction(reg.id, 'approve')}>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {t('admin.approve', locale)}
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" disabled={actionLoading === reg.id} onClick={() => handleAction(reg.id, 'reject')}>
                              <XCircle className="h-3.5 w-3.5" />
                              {t('admin.reject', locale)}
                            </Button>
                            <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" disabled={actionLoading === reg.id} onClick={() => handleAction(reg.id, 'trial')}>
                              <Clock className="h-3.5 w-3.5" />
                              {t('admin.startTrial', locale)}
                            </Button>
                          </div>
                        ) : (
                          <Button size="icon" variant="ghost" onClick={() => setSelectedReg(reg)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReg} onOpenChange={(open) => !open && setSelectedReg(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>{selectedReg?.companyName}</DialogDescription>
          </DialogHeader>
          {selectedReg && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">{t('auth.username', locale)}:</span>
                  <p className="font-medium">{selectedReg.username}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium">{selectedReg.phone || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('auth.businessId', locale)}:</span>
                  <p className="font-medium">{selectedReg.businessId || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('auth.vatId', locale)}:</span>
                  <p className="font-medium">{selectedReg.vatId || '—'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">{t('auth.iban', locale)}:</span>
                  <p className="font-medium font-mono">{selectedReg.iban || '—'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">{t('auth.address', locale)}:</span>
                  <p className="font-medium">{selectedReg.address || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('auth.city', locale)}:</span>
                  <p className="font-medium">{selectedReg.city || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('auth.country', locale)}:</span>
                  <p className="font-medium">{selectedReg.country || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-1">{statusBadge(selectedReg.status)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{new Date(selectedReg.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {selectedReg.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={actionLoading === selectedReg.id} onClick={() => handleAction(selectedReg.id, 'approve')}>
                    <CheckCircle2 className="h-4 w-4" />
                    {t('admin.approve', locale)}
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={actionLoading === selectedReg.id} onClick={() => handleAction(selectedReg.id, 'trial')}>
                    <Clock className="h-4 w-4" />
                    Trial
                  </Button>
                  <Button className="flex-1 bg-destructive hover:bg-destructive/90" disabled={actionLoading === selectedReg.id} onClick={() => handleAction(selectedReg.id, 'reject')}>
                    <XCircle className="h-4 w-4" />
                    {t('admin.reject', locale)}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
