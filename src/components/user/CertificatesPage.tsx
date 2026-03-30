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
import { Plus, Pencil, Trash2, FileDown, Printer } from 'lucide-react';
import { CAR_MAKES, CAR_MODELS, getAuthHeaders } from './shared';

interface InspectionItem { key: string; label: string; value: string; }
interface CertificateRecord {
  id: string;
  certificateNumber: string;
  issueDate: string;
  customer: string;
  vehicle: string;
  maintenanceType: string;
  validUntil: string;
  status: string;
}

const INSPECTION_KEYS: InspectionItem[] = [
  { key: 'vehicleInspection', label: 'cert.vehicleInspection', value: 'Passed' },
  { key: 'safetyChecks', label: 'cert.safetyChecks', value: 'Passed' },
  { key: 'fluidLevels', label: 'cert.fluidLevels', value: 'Passed' },
  { key: 'tireCondition', label: 'cert.tireCondition', value: 'Passed' },
  { key: 'brakeCondition', label: 'cert.brakeCondition', value: 'Passed' },
  { key: 'batteryCondition', label: 'cert.batteryCondition', value: 'Passed' },
  { key: 'filterCondition', label: 'cert.filterCondition', value: 'Passed' },
  { key: 'overall', label: 'cert.overall', value: 'Passed' },
];

export default function CertificatesPage() {
  const { locale } = useAppStore();

  const [items, setItems] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [workOrders, setWorkOrders] = useState<Array<{ id: string; customer: string; vehicle: string }>>([]);

  const [formCustomerSource, setFormCustomerSource] = useState<'workOrder' | 'existing' | 'individual'>('existing');
  const [formWorkOrderId, setFormWorkOrderId] = useState('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCarMake, setFormCarMake] = useState('');
  const [formCarModel, setFormCarModel] = useState('');
  const [formLicensePlate, setFormLicensePlate] = useState('');
  const [formIssueDate, setFormIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formValidUntil, setFormValidUntil] = useState('');
  const [formMaintenanceType, setFormMaintenanceType] = useState('Regular Maintenance');
  const [formNextMaintenance, setFormNextMaintenance] = useState('');
  const [formInterval, setFormInterval] = useState('');
  const [formCertifiedTech, setFormCertifiedTech] = useState('');
  const [formInspections, setFormInspections] = useState<Record<string, string>>({});
  const [formTechNotes, setFormTechNotes] = useState('');
  const [formRecommendations, setFormRecommendations] = useState('');
  const [formServiceHistory, setFormServiceHistory] = useState('');
  const [formRemarks, setFormRemarks] = useState('');

  const loadItems = async () => {
    try {
      const res = await fetch('/api/user/certificates', { headers: getAuthHeaders() });
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

  const loadWorkOrders = async () => {
    try {
      const res = await fetch('/api/user/work-orders', { headers: getAuthHeaders() });
      if (res.ok) setWorkOrders(await res.json());
    } catch { /* ignore */ }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadItems(); loadCustomers(); loadWorkOrders(); }, []);

  const resetForm = () => {
    setFormCustomerSource('existing');
    setFormWorkOrderId('');
    setFormCustomerId('');
    setFormName('');
    setFormEmail('');
    setFormAddress('');
    setFormCarMake('');
    setFormCarModel('');
    setFormLicensePlate('');
    setFormIssueDate(new Date().toISOString().slice(0, 10));
    setFormValidUntil('');
    setFormMaintenanceType('Regular Maintenance');
    setFormNextMaintenance('');
    setFormInterval('');
    setFormCertifiedTech('');
    setFormInspections({});
    setFormTechNotes('');
    setFormRecommendations('');
    setFormServiceHistory('');
    setFormRemarks('');
  };

  const openNew = () => { setEditingId(null); resetForm(); setDialogOpen(true); };
  const openEdit = (item: CertificateRecord) => { setEditingId(item.id); setDialogOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        customerSource: formCustomerSource,
        workOrderId: formCustomerSource === 'workOrder' ? formWorkOrderId : undefined,
        customerId: formCustomerSource === 'existing' ? formCustomerId : undefined,
        customerName: formCustomerSource === 'individual' ? formName : undefined,
        customerEmail: formCustomerSource === 'individual' ? formEmail : undefined,
        customerAddress: formCustomerSource === 'individual' ? formAddress : undefined,
        carMake: formCarMake || undefined,
        carModel: formCarModel || undefined,
        licensePlate: formLicensePlate || undefined,
        issueDate: formIssueDate,
        validUntil: formValidUntil,
        maintenanceType: formMaintenanceType,
        nextMaintenanceDate: formNextMaintenance,
        interval: formInterval,
        certifiedTechnician: formCertifiedTech,
        inspections: formInspections,
        technicianNotes: formTechNotes,
        recommendations: formRecommendations,
        serviceHistory: formServiceHistory,
        additionalRemarks: formRemarks,
      };
      const url = editingId ? `/api/user/certificates/${editingId}` : '/api/user/certificates';
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
      const res = await fetch(`/api/user/certificates/${deleteId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) { setDeleteId(null); fetchItems(); }
    } catch { /* ignore */ }
  };

  const carModels = formCarMake ? (CAR_MODELS[formCarMake] || ['Model 1', 'Model 2', 'Model 3']) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('cert.title', locale)}</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 me-2" />
          {t('cert.addNew', locale)}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[calc(100vh-220px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cert #</TableHead>
                  <TableHead>{t('cert.issueDate', locale)}</TableHead>
                  <TableHead>{t('income.customer', locale)}</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>{t('cert.maintenanceType', locale)}</TableHead>
                  <TableHead>{t('cert.validUntil', locale)}</TableHead>
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
                      <TableCell className="font-mono text-xs">{item.certificateNumber}</TableCell>
                      <TableCell>{item.issueDate}</TableCell>
                      <TableCell>{item.customer}</TableCell>
                      <TableCell className="max-w-[100px] truncate">{item.vehicle}</TableCell>
                      <TableCell>{item.maintenanceType}</TableCell>
                      <TableCell>{item.validUntil}</TableCell>
                      <TableCell><Badge variant="outline">{item.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><FileDown className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><Printer className="h-4 w-4" /></Button>
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
            <DialogTitle>{editingId ? t('common.edit', locale) : t('cert.addNew', locale)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>{t('income.customer', locale)}</Label>
              <Select value={formCustomerSource} onValueChange={(v) => setFormCustomerSource(v as 'workOrder' | 'existing' | 'individual')}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="workOrder">{t('workOrder.selectFromBooking', locale).replace('Booking', 'Work Order')}</SelectItem>
                  <SelectItem value="existing">{t('workOrder.selectExisting', locale)}</SelectItem>
                  <SelectItem value="individual">{t('workOrder.addIndividual', locale)}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formCustomerSource === 'workOrder' && (
              <Select value={formWorkOrderId} onValueChange={setFormWorkOrderId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select work order..." /></SelectTrigger>
                <SelectContent>
                  {workOrders.map((w) => (<SelectItem key={w.id} value={w.id}>{w.customer} - {w.vehicle}</SelectItem>))}
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>{t('cert.issueDate', locale)}</Label><Input type="date" value={formIssueDate} onChange={(e) => setFormIssueDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('cert.validUntil', locale)}</Label><Input type="date" value={formValidUntil} onChange={(e) => setFormValidUntil(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('cert.nextMaintenance', locale)}</Label><Input type="date" value={formNextMaintenance} onChange={(e) => setFormNextMaintenance(e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('cert.interval', locale)}</Label><Input value={formInterval} onChange={(e) => setFormInterval(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('cert.certifiedTech', locale)}</Label><Input value={formCertifiedTech} onChange={(e) => setFormCertifiedTech(e.target.value)} /></div>
            </div>

            {/* Inspection */}
            <div className="space-y-3">
              <Label className="font-semibold">{t('cert.inspection', locale)}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {INSPECTION_KEYS.map((item) => (
                  <div key={item.key} className="space-y-1">
                    <Label className="text-xs">{t(item.label, locale)}</Label>
                    <Select value={formInspections[item.key] || 'Passed'} onValueChange={(v) => setFormInspections({ ...formInspections, [item.key]: v })}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Passed">{t('cert.passed', locale)}</SelectItem>
                        <SelectItem value="Failed">{t('cert.failed', locale)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('workOrder.technicianNotes', locale)}</Label><Textarea value={formTechNotes} onChange={(e) => setFormTechNotes(e.target.value)} rows={2} /></div>
              <div className="space-y-2"><Label>{t('workOrder.recommendations', locale)}</Label><Textarea value={formRecommendations} onChange={(e) => setFormRecommendations(e.target.value)} rows={2} /></div>
            </div>
            <div className="space-y-2"><Label>Service History</Label><Textarea value={formServiceHistory} onChange={(e) => setFormServiceHistory(e.target.value)} rows={2} /></div>
            <div className="space-y-2"><Label>Additional Remarks</Label><Input value={formRemarks} onChange={(e) => setFormRemarks(e.target.value)} /></div>
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
