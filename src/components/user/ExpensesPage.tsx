'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getAuthHeaders } from './shared';

interface ExpenseRecord {
  id: string;
  date: string;
  description: string;
  category: string;
  paymentMethod: string;
  amount: number;
  vatRate: number;
}

export default function ExpensesPage() {
  const { locale } = useAppStore();
  const cur = t('common.currency', locale);

  const [items, setItems] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Salary');
  const [formDescription, setFormDescription] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Card');
  const [formVatRate, setFormVatRate] = useState('25.5');

  const loadItems = async () => {
    try {
      const res = await fetch('/api/user/expenses', { headers: getAuthHeaders() });
      if (res.ok) setItems(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadItems(); }, []);

  const resetForm = () => {
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormAmount('');
    setFormCategory('Salary');
    setFormDescription('');
    setFormPaymentMethod('Card');
    setFormVatRate('25.5');
  };

  const openNew = () => { setEditingId(null); resetForm(); setDialogOpen(true); };

  const openEdit = (item: ExpenseRecord) => {
    setEditingId(item.id);
    setFormDate(item.date.slice(0, 10));
    setFormAmount(String(item.amount));
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormPaymentMethod(item.paymentMethod);
    setFormVatRate(String(item.vatRate));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formAmount || parseFloat(formAmount) <= 0) return;
    setSaving(true);
    try {
      const body = {
        date: formDate,
        amount: parseFloat(formAmount),
        category: formCategory,
        description: formDescription,
        paymentMethod: formPaymentMethod,
        vatRate: parseFloat(formVatRate),
      };
      const url = editingId ? `/api/user/expenses/${editingId}` : '/api/user/expenses';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) { setDialogOpen(false); fetchItems(); }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/user/expenses/${deleteId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) { setDeleteId(null); fetchItems(); }
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('expense.title', locale)}</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 me-2" />
          {t('expense.addNew', locale)}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[calc(100vh-220px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t('income.date', locale)}</TableHead>
                  <TableHead>{t('income.description', locale)}</TableHead>
                  <TableHead>{t('income.paymentMethod', locale)}</TableHead>
                  <TableHead>{t('expense.amount', locale)}</TableHead>
                  <TableHead>{t('common.actions', locale)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center">{t('common.loading', locale)}</TableCell></TableRow>
                ) : items.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center">{t('common.noData', locale)}</TableCell></TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.id.slice(0, 8)}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                      <TableCell><Badge variant="outline">{item.paymentMethod}</Badge></TableCell>
                      <TableCell className="font-semibold text-red-600">{item.amount.toFixed(2)}{cur}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? t('common.edit', locale) : t('expense.addNew', locale)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('income.date', locale)}</Label>
                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('expense.amount', locale)}</Label>
                <Input type="number" step="0.01" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('income.category', locale)}</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salary">{t('expense.salary', locale)}</SelectItem>
                  <SelectItem value="Rent">{t('expense.rent', locale)}</SelectItem>
                  <SelectItem value="Utilities">{t('expense.utilities', locale)}</SelectItem>
                  <SelectItem value="Supplies">{t('expense.supplies', locale)}</SelectItem>
                  <SelectItem value="Marketing">{t('expense.marketing', locale)}</SelectItem>
                  <SelectItem value="Other">{t('income.other', locale)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('income.description', locale)}</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('income.paymentMethod', locale)}</Label>
                <Select value={formPaymentMethod} onValueChange={setFormPaymentMethod}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Card">{t('income.card', locale)}</SelectItem>
                    <SelectItem value="Cash">{t('income.cash', locale)}</SelectItem>
                    <SelectItem value="Bill">{t('income.bill', locale)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('income.vatRate', locale)}</Label>
                <Select value={formVatRate} onValueChange={setFormVatRate}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25.5">25.5%</SelectItem>
                    <SelectItem value="14">14%</SelectItem>
                    <SelectItem value="13.5">13.5%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel', locale)}</Button>
            <Button onClick={handleSave} disabled={saving}>{t('common.save', locale)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm', locale)}</AlertDialogTitle>
            <AlertDialogDescription>{t('common.delete', locale)}?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', locale)}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('common.delete', locale)}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
