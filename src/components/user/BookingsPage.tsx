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
import { Plus, Pencil, Trash2, Play } from 'lucide-react';
import { CAR_MAKES, CAR_MODELS, ALL_SERVICES, getAuthHeaders } from './shared';

interface BookingRecord {
  id: string;
  customer: string;
  vehicle: string;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
}

export default function BookingsPage() {
  const { locale } = useAppStore();

  const [items, setItems] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);

  const [formCustomerMethod, setFormCustomerMethod] = useState<'existing' | 'individual'>('existing');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCarMake, setFormCarMake] = useState('');
  const [formCarModel, setFormCarModel] = useState('');
  const [formLicensePlate, setFormLicensePlate] = useState('');
  const [formBookingDate, setFormBookingDate] = useState('');
  const [formBookingTime, setFormBookingTime] = useState('');
  const [formServiceType, setFormServiceType] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const loadItems = async () => {
    try {
      const res = await fetch('/api/user/bookings', { headers: getAuthHeaders() });
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

  const resetForm = () => {
    setFormCustomerMethod('existing');
    setFormCustomerId('');
    setFormName('');
    setFormEmail('');
    setFormAddress('');
    setFormCarMake('');
    setFormCarModel('');
    setFormLicensePlate('');
    setFormBookingDate('');
    setFormBookingTime('');
    setFormServiceType('');
    setFormNotes('');
  };

  const openNew = () => { setEditingId(null); resetForm(); setDialogOpen(true); };

  const openEdit = (item: BookingRecord) => {
    setEditingId(item.id);
    setFormBookingDate(item.bookingDate?.slice(0, 10) || '');
    setFormBookingTime(item.bookingTime || '');
    setFormServiceType(item.serviceType);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formBookingDate || !formServiceType) return;
    setSaving(true);
    try {
      const body = {
        customerMethod: formCustomerMethod,
        customerId: formCustomerMethod === 'existing' ? formCustomerId : undefined,
        customerName: formCustomerMethod === 'individual' ? formName : undefined,
        customerEmail: formCustomerMethod === 'individual' ? formEmail : undefined,
        customerAddress: formCustomerMethod === 'individual' ? formAddress : undefined,
        carMake: formCarMake || undefined,
        carModel: formCarModel || undefined,
        licensePlate: formLicensePlate || undefined,
        bookingDate: formBookingDate,
        bookingTime: formBookingTime,
        serviceType: formServiceType,
        notes: formNotes,
      };
      const url = editingId ? `/api/user/bookings/${editingId}` : '/api/user/bookings';
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
      const res = await fetch(`/api/user/bookings/${deleteId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) { setDeleteId(null); fetchItems(); }
    } catch { /* ignore */ }
  };

  const handleStart = async (item: BookingRecord) => {
    try {
      const res = await fetch(`/api/user/bookings/${item.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'In Progress' }),
      });
      if (res.ok) fetchItems();
    } catch { /* ignore */ }
  };

  const carModels = formCarMake ? (CAR_MODELS[formCarMake] || ['Model 1', 'Model 2', 'Model 3']) : [];

  const statusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-amber-100 text-amber-800';
      case 'Completed': return 'bg-emerald-100 text-emerald-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('booking.title', locale)}</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 me-2" />
          {t('booking.addNew', locale)}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[calc(100vh-220px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t('income.customer', locale)}</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>{t('booking.dateTime', locale)}</TableHead>
                  <TableHead>{t('booking.status', locale)}</TableHead>
                  <TableHead>{t('common.actions', locale)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center">{t('common.loading', locale)}</TableCell></TableRow>
                ) : items.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center">{t('common.noData', locale)}</TableCell></TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.id.slice(0, 8)}</TableCell>
                      <TableCell>{item.customer}</TableCell>
                      <TableCell className="max-w-[120px] truncate">{item.vehicle}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{item.serviceType}</TableCell>
                      <TableCell className="text-sm">{item.bookingDate}{item.bookingTime ? ` ${item.bookingTime}` : ''}</TableCell>
                      <TableCell><Badge className={statusColor(item.status)} variant="outline">{item.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {item.status === 'Scheduled' && (
                            <Button variant="ghost" size="icon" onClick={() => handleStart(item)}><Play className="h-4 w-4" /></Button>
                          )}
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t('common.edit', locale) : t('booking.addNew', locale)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
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
              <Select value={formCustomerId} onValueChange={setFormCustomerId}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t('income.customer', locale)} /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Name</Label><Input value={formName} onChange={(e) => setFormName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} /></div>
                <div className="space-y-2"><Label>{t('auth.address', locale)}</Label><Input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} /></div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <Select value={formCarMake} onValueChange={(v) => { setFormCarMake(v); setFormCarModel(''); }}>
                <SelectTrigger><SelectValue placeholder={t('income.carMake', locale)} /></SelectTrigger>
                <SelectContent className="max-h-64">{CAR_MAKES.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
              </Select>
              <Select value={formCarModel} onValueChange={setFormCarModel}>
                <SelectTrigger><SelectValue placeholder={t('income.carModel', locale)} /></SelectTrigger>
                <SelectContent>{carModels.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
              </Select>
              <Input placeholder={t('income.licensePlate', locale)} value={formLicensePlate} onChange={(e) => setFormLicensePlate(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('booking.dateTime', locale)}</Label>
                <div className="flex gap-2">
                  <Input type="date" value={formBookingDate} onChange={(e) => setFormBookingDate(e.target.value)} className="flex-1" />
                  <Input type="time" value={formBookingTime} onChange={(e) => setFormBookingTime(e.target.value)} className="w-32" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('income.category', locale)} / Service</Label>
                <Select value={formServiceType} onValueChange={setFormServiceType}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="max-h-64">{ALL_SERVICES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('booking.notes', locale)}</Label>
              <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={2} />
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
