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
import { Plus, Pencil, Trash2, Eye, Award } from 'lucide-react';
import { CAR_MAKES, CAR_MODELS, getAuthHeaders } from './shared';

interface PartItem { name: string; partNumber: string; quantity: string; unitPrice: string; }
interface WorkOrderRecord {
  id: string;
  workOrderNumber: string;
  date: string;
  customer: string;
  vehicle: string;
  technician: string;
  totalCost: number;
  status: string;
}

export default function WorkOrdersPage() {
  const { locale } = useAppStore();
  const cur = t('common.currency', locale);

  const [items, setItems] = useState<WorkOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [bookings, setBookings] = useState<Array<{ id: string; customer: string; vehicle: string }>>([]);

  const [formCustomerSource, setFormCustomerSource] = useState<'booking' | 'existing' | 'individual'>('existing');
  const [formBookingId, setFormBookingId] = useState('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCarMake, setFormCarMake] = useState('');
  const [formCarModel, setFormCarModel] = useState('');
  const [formLicensePlate, setFormLicensePlate] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formTechnician, setFormTechnician] = useState('');
  const [formEstHours, setFormEstHours] = useState('');
  const [formActualHours, setFormActualHours] = useState('');
  const [formMileage, setFormMileage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParts, setFormParts] = useState<PartItem[]>([]);
  const [formPartName, setFormPartName] = useState('');
  const [formPartNumber, setFormPartNumber] = useState('');
  const [formPartQty, setFormPartQty] = useState('1');
  const [formPartPrice, setFormPartPrice] = useState('');
  const [formLaborCost, setFormLaborCost] = useState('0');
  const [formRecommendations, setFormRecommendations] = useState('');
  const [formNextService, setFormNextService] = useState('');
  const [formGuarantee, setFormGuarantee] = useState('');
  const [formWarranty, setFormWarranty] = useState('');
  const [formQualityCheck, setFormQualityCheck] = useState('');
  const [formTechNotes, setFormTechNotes] = useState('');

  const loadItems = async () => {
    try {
      const res = await fetch('/api/user/work-orders', { headers: getAuthHeaders() });
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

  const loadBookings = async () => {
    try {
      const res = await fetch('/api/user/bookings', { headers: getAuthHeaders() });
      if (res.ok) setBookings(await res.json());
    } catch { /* ignore */ }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadItems(); loadCustomers(); loadBookings(); }, []);

  const resetForm = () => {
    setFormCustomerSource('existing');
    setFormBookingId('');
    setFormCustomerId('');
    setFormName('');
    setFormEmail('');
    setFormAddress('');
    setFormCarMake('');
    setFormCarModel('');
    setFormLicensePlate('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormTechnician('');
    setFormEstHours('');
    setFormActualHours('');
    setFormMileage('');
    setFormDescription('');
    setFormParts([]);
    setFormPartName('');
    setFormPartNumber('');
    setFormPartQty('1');
    setFormPartPrice('');
    setFormLaborCost('0');
    setFormRecommendations('');
    setFormNextService('');
    setFormGuarantee('');
    setFormWarranty('');
    setFormQualityCheck('');
    setFormTechNotes('');
  };

  const openNew = () => { setEditingId(null); resetForm(); setDialogOpen(true); };
  const openEdit = (item: WorkOrderRecord) => { setEditingId(item.id); setDialogOpen(true); };

  const addPart = () => {
    if (formPartName) {
      setFormParts([...formParts, { name: formPartName, partNumber: formPartNumber, quantity: formPartQty, unitPrice: formPartPrice }]);
      setFormPartName('');
      setFormPartNumber('');
      setFormPartQty('1');
      setFormPartPrice('');
    }
  };

  const partsCost = formParts.reduce((s, p) => s + (parseFloat(p.quantity) || 0) * (parseFloat(p.unitPrice) || 0), 0);
  const totalCost = partsCost + (parseFloat(formLaborCost) || 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        customerSource: formCustomerSource,
        bookingId: formCustomerSource === 'booking' ? formBookingId : undefined,
        customerId: formCustomerSource === 'existing' ? formCustomerId : undefined,
        customerName: formCustomerSource === 'individual' ? formName : undefined,
        customerEmail: formCustomerSource === 'individual' ? formEmail : undefined,
        customerAddress: formCustomerSource === 'individual' ? formAddress : undefined,
        carMake: formCarMake || undefined,
        carModel: formCarModel || undefined,
        licensePlate: formLicensePlate || undefined,
        date: formDate,
        technician: formTechnician,
        estimatedHours: formEstHours ? parseFloat(formEstHours) : undefined,
        actualHours: formActualHours ? parseFloat(formActualHours) : undefined,
        mileage: formMileage ? parseFloat(formMileage) : undefined,
        description: formDescription,
        parts: formParts,
        laborCost: parseFloat(formLaborCost) || 0,
        totalCost,
        recommendations: formRecommendations,
        nextServiceDue: formNextService,
        guarantee: formGuarantee,
        warranty: formWarranty,
        qualityCheck: formQualityCheck,
        technicianNotes: formTechNotes,
      };
      const url = editingId ? `/api/user/work-orders/${editingId}` : '/api/user/work-orders';
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
      const res = await fetch(`/api/user/work-orders/${deleteId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) { setDeleteId(null); fetchItems(); }
    } catch { /* ignore */ }
  };

  const carModels = formCarMake ? (CAR_MODELS[formCarMake] || ['Model 1', 'Model 2', 'Model 3']) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('workOrder.title', locale)}</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 me-2" />
          {t('workOrder.addNew', locale)}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[calc(100vh-220px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WO #</TableHead>
                  <TableHead>{t('workOrder.date', locale)}</TableHead>
                  <TableHead>{t('income.customer', locale)}</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>{t('workOrder.technician', locale)}</TableHead>
                  <TableHead>{t('workOrder.totalCost', locale)}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>{t('common.actions', locale)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center">{t('common.loading', locale)}</TableCell></TableRow>
                ) : items.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center">{t('common.noData', locale)}</TableCell></TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.workOrderNumber}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.customer}</TableCell>
                      <TableCell className="max-w-[100px] truncate">{item.vehicle}</TableCell>
                      <TableCell>{item.technician}</TableCell>
                      <TableCell className="font-semibold">{item.totalCost.toFixed(2)}{cur}</TableCell>
                      <TableCell><Badge variant="outline">{item.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Award className="h-4 w-4" /></Button>
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
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t('common.edit', locale) : t('workOrder.addNew', locale)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Customer source */}
            <div className="space-y-2">
              <Label>{t('income.customer', locale)}</Label>
              <Select value={formCustomerSource} onValueChange={(v) => setFormCustomerSource(v as 'booking' | 'existing' | 'individual')}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking">{t('workOrder.selectFromBooking', locale)}</SelectItem>
                  <SelectItem value="existing">{t('workOrder.selectExisting', locale)}</SelectItem>
                  <SelectItem value="individual">{t('workOrder.addIndividual', locale)}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formCustomerSource === 'booking' && (
              <Select value={formBookingId} onValueChange={setFormBookingId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select booking..." /></SelectTrigger>
                <SelectContent>
                  {bookings.map((b) => (<SelectItem key={b.id} value={b.id}>{b.customer} - {b.vehicle}</SelectItem>))}
                </SelectContent>
              </Select>
            )}

            {formCustomerSource === 'existing' && (
              <Select value={formCustomerId} onValueChange={setFormCustomerId}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t('income.customer', locale)} /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            )}

            {formCustomerSource === 'individual' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Name</Label><Input value={formName} onChange={(e) => setFormName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} /></div>
                <div className="space-y-2"><Label>{t('auth.address', locale)}</Label><Input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} /></div>
              </div>
            )}

            {/* Vehicle */}
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

            {/* Work details */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2"><Label>{t('workOrder.date', locale)}</Label><Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('workOrder.technician', locale)}</Label><Input value={formTechnician} onChange={(e) => setFormTechnician(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('workOrder.estimatedHours', locale)}</Label><Input type="number" value={formEstHours} onChange={(e) => setFormEstHours(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('workOrder.actualHours', locale)}</Label><Input type="number" value={formActualHours} onChange={(e) => setFormActualHours(e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('workOrder.mileage', locale)}</Label><Input type="number" value={formMileage} onChange={(e) => setFormMileage(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('workOrder.laborCost', locale)}</Label><Input type="number" step="0.01" value={formLaborCost} onChange={(e) => setFormLaborCost(e.target.value)} /></div>
            </div>

            <div className="space-y-2">
              <Label>{t('workOrder.description', locale)}</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} />
            </div>

            {/* Parts */}
            <div className="space-y-2">
              <Label>{t('workOrder.partsUsed', locale)}</Label>
              <div className="flex gap-2 flex-wrap">
                <Input placeholder={t('workOrder.partName', locale)} value={formPartName} onChange={(e) => setFormPartName(e.target.value)} className="flex-1 min-w-[120px]" />
                <Input placeholder={t('workOrder.partNumber', locale)} value={formPartNumber} onChange={(e) => setFormPartNumber(e.target.value)} className="w-28" />
                <Input placeholder={t('workOrder.quantity', locale)} type="number" value={formPartQty} onChange={(e) => setFormPartQty(e.target.value)} className="w-20" />
                <Input placeholder={t('workOrder.unitPrice', locale)} type="number" value={formPartPrice} onChange={(e) => setFormPartPrice(e.target.value)} className="w-24" />
                <Button type="button" variant="outline" onClick={addPart}>{t('workOrder.addItem', locale)}</Button>
              </div>
              {formParts.length > 0 && (
                <div className="border rounded-lg p-2 space-y-1 max-h-32 overflow-y-auto">
                  {formParts.map((p, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span>{p.name} {p.partNumber ? `(${p.partNumber})` : ''} x{p.quantity}</span>
                      <div className="flex items-center gap-2">
                        <span>{((parseFloat(p.quantity) || 0) * (parseFloat(p.unitPrice) || 0)).toFixed(2)}{cur}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFormParts(formParts.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-1 border-t text-sm">
                    <span>{t('workOrder.partsCost', locale)}</span>
                    <span>{partsCost.toFixed(2)}{cur}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between font-bold">
              <span>{t('workOrder.totalCost', locale)}</span>
              <span>{totalCost.toFixed(2)}{cur}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('workOrder.recommendations', locale)}</Label><Textarea value={formRecommendations} onChange={(e) => setFormRecommendations(e.target.value)} rows={2} /></div>
              <div className="space-y-2"><Label>{t('workOrder.nextServiceDue', locale)}</Label><Input value={formNextService} onChange={(e) => setFormNextService(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('workOrder.guarantee', locale)}</Label><Textarea value={formGuarantee} onChange={(e) => setFormGuarantee(e.target.value)} rows={2} /></div>
              <div className="space-y-2"><Label>{t('workOrder.warranty', locale)}</Label><Textarea value={formWarranty} onChange={(e) => setFormWarranty(e.target.value)} rows={2} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('workOrder.qualityCheck', locale)}</Label><Textarea value={formQualityCheck} onChange={(e) => setFormQualityCheck(e.target.value)} rows={2} /></div>
              <div className="space-y-2"><Label>{t('workOrder.technicianNotes', locale)}</Label><Textarea value={formTechNotes} onChange={(e) => setFormTechNotes(e.target.value)} rows={2} /></div>
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
