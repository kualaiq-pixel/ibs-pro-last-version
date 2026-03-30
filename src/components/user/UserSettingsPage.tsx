'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { getAuthHeaders } from './shared';

interface CompanySettings {
  name: string;
  code: string;
  businessId: string;
  vatId: string;
  phone: string;
  email: string;
  iban: string;
  address: string;
  zipCode: string;
  city: string;
  country: string;
  currency: string;
}

export default function UserSettingsPage() {
  const { locale } = useAppStore();

  const [settings, setSettings] = useState<CompanySettings>({
    name: '', code: '', businessId: '', vatId: '', phone: '', email: '',
    iban: '', address: '', zipCode: '', city: '', country: '', currency: 'EUR',
  });
  const [services, setServices] = useState<string[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newService, setNewService] = useState('');
  const [newIncomeCat, setNewIncomeCat] = useState('');
  const [newExpenseCat, setNewExpenseCat] = useState('');

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/user/settings', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.company) setSettings(data.company);
        if (data.services) setServices(data.services);
        if (data.incomeCategories) setIncomeCategories(data.incomeCategories);
        if (data.expenseCategories) setExpenseCategories(data.expenseCategories);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadSettings(); }, []);

  const handleSaveCompany = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      if (res.ok) fetchSettings();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const addService = async () => {
    if (!newService.trim()) return;
    try {
      const res = await fetch('/api/user/services', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newService.trim() }),
      });
      if (res.ok) { setNewService(''); fetchSettings(); }
    } catch { /* ignore */ }
  };

  const deleteService = async (name: string) => {
    try {
      const res = await fetch('/api/user/services', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
      });
      if (res.ok) fetchSettings();
    } catch { /* ignore */ }
  };

  const addCategory = async (type: 'income' | 'expense', name: string) => {
    if (!name.trim()) return;
    try {
      const res = await fetch('/api/user/categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type, name: name.trim() }),
      });
      if (res.ok) fetchSettings();
    } catch { /* ignore */ }
  };

  const deleteCategory = async (type: 'income' | 'expense', name: string) => {
    try {
      const res = await fetch('/api/user/categories', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type, name }),
      });
      if (res.ok) fetchSettings();
    } catch { /* ignore */ }
  };

  const updateField = (field: keyof CompanySettings, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('settings.title', locale)}</h1>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">{t('settings.companyDetails', locale)}</TabsTrigger>
          <TabsTrigger value="services">{t('settings.manageServices', locale)}</TabsTrigger>
          <TabsTrigger value="categories">{t('settings.manageCategories', locale)}</TabsTrigger>
        </TabsList>

        {/* Company Details */}
        <TabsContent value="company" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('auth.companyName', locale)}</Label>
                  <Input value={settings.name} onChange={(e) => updateField('name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.companyCode', locale)}</Label>
                  <Input value={settings.code} onChange={(e) => updateField('code', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.businessId', locale)}</Label>
                  <Input value={settings.businessId} onChange={(e) => updateField('businessId', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.vatId', locale)}</Label>
                  <Input value={settings.vatId} onChange={(e) => updateField('vatId', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.phoneNumber', locale)}</Label>
                  <Input value={settings.phone} onChange={(e) => updateField('phone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={settings.email} onChange={(e) => updateField('email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.iban', locale)}</Label>
                  <Input value={settings.iban} onChange={(e) => updateField('iban', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.address', locale)}</Label>
                  <Input value={settings.address} onChange={(e) => updateField('address', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.zipCode', locale)}</Label>
                  <Input value={settings.zipCode} onChange={(e) => updateField('zipCode', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.city', locale)}</Label>
                  <Input value={settings.city} onChange={(e) => updateField('city', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.country', locale)}</Label>
                  <Input value={settings.country} onChange={(e) => updateField('country', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.currency', locale)}</Label>
                  <Input value={settings.currency} onChange={(e) => updateField('currency', e.target.value)} disabled />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveCompany} disabled={saving}>{t('common.save', locale)}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t('settings.addService', locale)}
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addService()}
                  className="flex-1"
                />
                <Button onClick={addService}>
                  <Plus className="h-4 w-4 me-2" />
                  {t('settings.addService', locale)}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {services.map((service) => (
                  <Badge key={service} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                    <span>{service}</span>
                    <button onClick={() => deleteService(service)} className="ms-1 hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {services.length === 0 && <p className="text-sm text-muted-foreground">{t('common.noData', locale)}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">{t('settings.incomeCategories', locale)}</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add category..."
                    value={newIncomeCat}
                    onChange={(e) => setNewIncomeCat(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCategory('income', newIncomeCat)}
                    className="flex-1"
                  />
                  <Button onClick={() => { addCategory('income', newIncomeCat); setNewIncomeCat(''); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {incomeCategories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                      <span>{cat}</span>
                      <button onClick={() => deleteCategory('income', cat)} className="ms-1 hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">{t('settings.expenseCategories', locale)}</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add category..."
                    value={newExpenseCat}
                    onChange={(e) => setNewExpenseCat(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCategory('expense', newExpenseCat)}
                    className="flex-1"
                  />
                  <Button onClick={() => { addCategory('expense', newExpenseCat); setNewExpenseCat(''); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {expenseCategories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                      <span>{cat}</span>
                      <button onClick={() => deleteCategory('expense', cat)} className="ms-1 hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
