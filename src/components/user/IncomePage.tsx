'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { CAR_MAKES, CAR_MODELS, ALL_SERVICES, getAuthHeaders } from './shared';

interface ServiceItem { service: string; price: string; }
interface IncomeRecord {
  id: string;
  date: string;
  description: string;
  category: string;
  paymentMethod: string;
  amount: number;
  vatRate: number;
}

export default function IncomePage() {
  const { locale } = useAppStore();
  const cur = t('common.currency', locale);

  const [items, setItems] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);

  // Form state
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formCategory, setFormCategory] = useState('Service');
  const [formCustomerMethod, setFormCustomerMethod] = useState<'existing' | 'individual'>('existing');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCarMake, setFormCarMake] = useState('');
  const [formCarModel, setFormCarModel] = useState('');
  const [formLicensePlate, setFormLicensePlate] = useState('');
  const [formServices, setFormServices] = useState<ServiceItem[]>([]);
  const [formServiceName, setFormServiceName] = useState('');
  const [formServicePrice, setFormServicePrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Card');
  const [formVatRate, setFormVatRate] = useState('25.5');

  const loadItems = async () => {
    try {
      const res = await fetch('/api/user/income', { headers: getAuthHeaders() });
      if (res.ok) setItems(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/user/customers', { headers: getAuthHeaders() });
      if (res.ok) setCustomers(await res.json());
    } catch { /* ignore */ }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadItems(); loadCustomers(); }, []);

  const openNew = () => {
    setEditingId(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (item: IncomeRecord) => {
    setEditingId(item.id);
    setFormDate(item.date.slice(0, 10));
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormPaymentMethod(item.paymentMethod);
    setFormVatRate(String(item.vatRate));
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormCategory('Service');
    setFormCustomerMethod('existing');
    setFormCustomerId('');
    setFormName('');
    setFormEmail('');
    setFormAddress('');
    setFormCarMake('');
    setFormCarModel('');
    setFormLicensePlate('');
    setFormServices([]);
    setFormServiceName('');
    setFormServicePrice('');
    setFormDescription('');
    setFormPaymentMethod('Card');
    setFormVatRate('25.5');
  };

  const addServiceItem = () => {
    if (formServiceName) {
      setFormServices([...formServices, { service: formServiceName, price: formServicePrice }]);
      setFormServiceName('');
      setFormServicePrice('');
    }
  };

  const removeServiceItem = (idx: number) => {
    setFormServices(formServices.filter((_, i) => i !== idx));
  };

  const totalAmount = formServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        date: formDate,
        category: formCategory,
        customerMethod: formCustomerMethod,
        customerId: formCustomerMethod === 'existing' ? formCustomerId : undefined,
        customerName: formCustomerMethod === 'individual' ? formName : undefined,
        customerEmail: formCustomerMethod === 'individual' ? formEmail : undefined,
        customerAddress: formCustomerMethod === 'individual' ? formAddress : undefined,
        carMake: formCarMake || undefined,
        carModel: formCarModel || undefined,
        licensePlate: formLicensePlate || undefined,
        services: formServices,
        total: totalAmount,
        description: formDescription,
        paymentMethod: formPaymentMethod,
        vatRate: parseFloat(formVatRate),
      };

      const url = editingId ? `/api/user/income/${editingId}` : '/api/user/income';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setDialogOpen(false);
        fetchItems();
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/user/income/${deleteId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setDeleteId(null);
        fetchItems();
      }
    } catch { /* ignore */ }
  };

  const carModels = formCarMake ? (CAR_MODELS[formCarMake] || ['Model 1', 'Model 2', 'Model 3']) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('income.title', locale)}</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 me-2" />
          {t('income.addNew', locale)}
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
                  <TableHead>{t('income.amount', locale)}</TableHead>
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
                      <TableCell className="font-semibold">{item.amount.toFixed(2)}{cur}</TableCell>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t('common.edit', locale) : t('income.addNew', locale)}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Date & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('income.date', locale)}</Label>
                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('income.category', locale)}</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Service">{t('income.service', locale)}</SelectItem>
                    <SelectItem value="Product Sale">{t('income.productSale', locale)}</SelectItem>
                    <SelectItem value="Subscription">{t('income.subscription', locale)}</SelectItem>
                    <SelectItem value="Other">{t('income.other', locale)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <Label>{t('income.customer', locale)}</Label>
              <Select value={formCustomerMethod} onValueChange={(v) => setFormCustomerMethod(v as 'existing' | 'individual')}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="existing">{t('income.customer', locale)}</SelectItem>
                  <SelectItem value="individual">{t('income.individual', locale)}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formCustomerMethod === 'existing' ? (
              <div className="space-y-2">
                <Select value={formCustomerId} onValueChange={setFormCustomerId}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t('income.customer', locale)} /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.address', locale)}</Label>
                  <Input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
                </div>
              </div>
            )}

            {/* Vehicle */}
            <div className="space-y-2">
              <Label>{t('income.vehicleDetails', locale)}</Label>
              <div className="grid grid-cols-3 gap-4">
                <Select value={formCarMake} onValueChange={(v) => { setFormCarMake(v); setFormCarModel(''); }}>
                  <SelectTrigger><SelectValue placeholder={t('income.carMake', locale)} /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    {CAR_MAKES.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={formCarModel} onValueChange={setFormCarModel}>
                  <SelectTrigger><SelectValue placeholder={t('income.carModel', locale)} /></SelectTrigger>
                  <SelectContent>
                    {carModels.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Input placeholder={t('income.licensePlate', locale)} value={formLicensePlate} onChange={(e) => setFormLicensePlate(e.target.value)} />
              </div>
            </div>

            {/* Services */}
            <div className="space-y-2">
              <Label>{t('income.services', locale)}</Label>
              <div className="flex gap-2">
                <Select value={formServiceName} onValueChange={setFormServiceName}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder={t('income.service', locale)} /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    {ALL_SERVICES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Input type="number" placeholder={t('income.price', locale)} value={formServicePrice} onChange={(e) => setFormServicePrice(e.target.value)} className="w-32" />
                <Button type="button" variant="outline" onClick={addServiceItem}>{t('income.addService', locale)}</Button>
              </div>
              {formServices.length > 0 && (
                <div className="border rounded-lg p-2 space-y-1 max-h-32 overflow-y-auto">
                  {formServices.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span>{s.service}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{parseFloat(s.price || '0').toFixed(2)}{cur}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeServiceItem(i)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-1 border-t">
                    <span>{t('income.total', locale)}</span>
                    <span>{totalAmount.toFixed(2)}{cur}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>{t('income.description', locale)}</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={2} />
            </div>

            {/* Payment & VAT */}
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
            <Button onClick={handleSave} disabled={saving || totalAmount === 0}>{t('common.save', locale)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
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
