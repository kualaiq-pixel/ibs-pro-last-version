'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore, t } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { getAdminAuthHeaders } from './shared';

interface User {
  id: string;
  username: string;
  role: string;
  companyId: string;
  companyName: string;
}

interface CompanyOption {
  id: string;
  name: string;
}

const roles = ['Admin', 'Manager', 'Accountant', 'Staff', 'Viewer'];

interface UserForm {
  username: string;
  password: string;
  role: string;
  companyId: string;
}

const emptyForm: UserForm = { username: '', password: '', role: 'Staff', companyId: '' };

export default function UsersPage() {
  const { locale } = useAppStore();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, companiesRes] = await Promise.all([
        fetch('/api/admin/users', { headers: getAdminAuthHeaders() }),
        fetch('/api/admin/companies', { headers: getAdminAuthHeaders() }),
      ]);
      if (!usersRes.ok || !companiesRes.ok) throw new Error('Failed');
      const [usersData, companiesData] = await Promise.all([usersRes.json(), companiesRes.json()]);
      setUsers(usersData);
      setCompanies(companiesData);
    } catch {
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({ username: user.username, password: '', role: user.role, companyId: user.companyId });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      toast({ title: 'Success', description: editingUser ? 'User updated' : 'User created' });
      setDialogOpen(false);
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: getAdminAuthHeaders() });
      if (!res.ok) throw new Error('Failed');
      toast({ title: 'Success', description: 'User deleted' });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const roleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-700';
      case 'Manager': return 'bg-blue-100 text-blue-700';
      case 'Accountant': return 'bg-emerald-100 text-emerald-700';
      case 'Staff': return 'bg-slate-100 text-slate-700';
      case 'Viewer': return 'bg-amber-100 text-amber-700';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">{t('admin.users', locale)}</h3>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          {t('admin.addUser', locale)}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mb-3 opacity-50" />
              <p>{t('common.noData', locale)}</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('auth.username', locale)}</TableHead>
                    <TableHead>{t('admin.role', locale)}</TableHead>
                    <TableHead>{t('admin.companyAssignment', locale)}</TableHead>
                    <TableHead className="text-right">{t('common.actions', locale)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <Badge className={roleColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.companyName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={deletingId === user.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeletingId(user.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('admin.delete', locale)}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete user &quot;{user.username}&quot;?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel', locale)}</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(user.id)}>
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
            <DialogTitle>{editingUser ? t('admin.edit', locale) : t('admin.addUser', locale)}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information' : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t('auth.username', locale)} *</Label>
              <Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>{t('auth.password', locale)} {!editingUser && '*'}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={editingUser ? 'Leave blank to keep current' : ''}
                required={!editingUser}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.role', locale)} *</Label>
              <Select value={form.role} onValueChange={(val) => setForm((f) => ({ ...f, role: val }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.companyAssignment', locale)} *</Label>
              <Select value={form.companyId} onValueChange={(val) => setForm((f) => ({ ...f, companyId: val }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('admin.companyAssignment', locale)} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel', locale)}</Button>
            <Button onClick={handleSave} disabled={saving || !form.username || !form.companyId || (!editingUser && !form.password)}>
              {saving ? 'Saving...' : t('common.save', locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
