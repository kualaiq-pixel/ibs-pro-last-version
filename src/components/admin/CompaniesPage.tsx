'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore, t } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  code: string;
  businessId: string | null;
  vatId: string | null;
  iban: string | null;
}

interface CompanyForm {
  name: string;
  code: string;
  businessId: string;
  vatId: string;
  iban: string;
}

const emptyForm: CompanyForm = { name: '', code: '', businessId: '', vatId: '', iban: '' };

export default function CompaniesPage() {
  const { locale } = useAppStore();
  const { toast } = useToast();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/companies');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCompanies(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load companies', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const openAdd = () => {
    setEditingCompany(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditingCompany(company);
    setForm({
      name: company.name,
      code: company.code,
      businessId: company.businessId || '',
      vatId: company.vatId || '',
      iban: company.iban || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingCompany ? `/api/admin/companies/${editingCompany.id}` : '/api/admin/companies';
      const method = editingCompany ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      toast({ title: 'Success', description: editingCompany ? 'Company updated' : 'Company created' });
      setDialogOpen(false);
      fetchCompanies();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/companies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast({ title: 'Success', description: 'Company deleted' });
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast({ title: 'Error', description: 'Failed to delete company', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">{t('admin.companies', locale)}</h3>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          {t('admin.addCompany', locale)}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Building2 className="h-12 w-12 mb-3 opacity-50" />
              <p>{t('common.noData', locale)}</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.companyName', locale)}</TableHead>
                    <TableHead>{t('admin.companyCode', locale)}</TableHead>
                    <TableHead>{t('auth.iban', locale)}</TableHead>
                    <TableHead className="text-right">{t('common.actions', locale)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell><Badge variant="outline">{company.code}</Badge></TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{company.iban || '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(company)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={deletingId === company.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeletingId(company.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('admin.delete', locale)}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{company.name}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel', locale)}</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(company.id)}>
                                  {t('admin.delete', locale)}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCompany ? t('admin.edit', locale) : t('admin.addCompany', locale)}</DialogTitle>
            <DialogDescription>
              {editingCompany ? 'Update company information' : 'Fill in the new company details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t('admin.companyName', locale)} *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.companyCode', locale)} *</Label>
              <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>{t('auth.businessId', locale)} ({t('auth.optional', locale)})</Label>
              <Input value={form.businessId} onChange={(e) => setForm((f) => ({ ...f, businessId: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('auth.vatId', locale)} ({t('auth.optional', locale)})</Label>
              <Input value={form.vatId} onChange={(e) => setForm((f) => ({ ...f, vatId: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('auth.iban', locale)} ({t('auth.optional', locale)})</Label>
              <Input value={form.iban} onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel', locale)}</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.code}>
              {saving ? 'Saving...' : t('common.save', locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
