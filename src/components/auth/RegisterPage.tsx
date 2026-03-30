'use client';

import React, { useState } from 'react';
import { useAppStore, t } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Building2, ArrowLeft, LogIn, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { setCurrentPage, locale } = useAppStore();
  const { toast } = useToast();
  const isRTL = locale === 'ar';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    companyName: '',
    username: '',
    password: '',
    phone: '',
    businessId: '',
    vatId: '',
    iban: '',
    address: '',
    zipCode: '',
    city: '',
    country: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        toast({ title: 'Error', description: data.error || 'Registration failed', variant: 'destructive' });
        return;
      }

      setSuccess(true);
      toast({ title: 'Success', description: t('auth.pendingMsg', locale) });
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Success!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">{t('auth.pendingMsg', locale)}</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => setCurrentPage('login')}>
              <LogIn className="h-4 w-4" />
              {t('auth.login', locale)}
            </Button>
            <Button variant="link" className="w-full" onClick={() => setCurrentPage('landing')}>
              <ArrowLeft className="h-4 w-4" />
              {t('common.back', locale)}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{t('auth.registerTitle', locale)}</CardTitle>
            <CardDescription>{t('auth.registerDesc', locale)}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">{t('auth.companyName', locale)} *</Label>
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">{t('auth.username', locale)} *</Label>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password', locale)} *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {t('auth.phoneNumber', locale)} <span className="text-muted-foreground">({t('auth.optional', locale)})</span>
                  </Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessId">
                    {t('auth.businessId', locale)} <span className="text-muted-foreground">({t('auth.optional', locale)})</span>
                  </Label>
                  <Input
                    id="businessId"
                    value={form.businessId}
                    onChange={(e) => updateField('businessId', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatId">
                    {t('auth.vatId', locale)} <span className="text-muted-foreground">({t('auth.optional', locale)})</span>
                  </Label>
                  <Input
                    id="vatId"
                    value={form.vatId}
                    onChange={(e) => updateField('vatId', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="iban">
                    {t('auth.iban', locale)} <span className="text-muted-foreground">({t('auth.optional', locale)})</span>
                  </Label>
                  <Input
                    id="iban"
                    value={form.iban}
                    onChange={(e) => updateField('iban', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">{t('auth.address', locale)} *</Label>
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    required
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">{t('auth.zipCode', locale)} *</Label>
                  <Input
                    id="zipCode"
                    value={form.zipCode}
                    onChange={(e) => updateField('zipCode', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{t('auth.city', locale)} *</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">{t('auth.country', locale)} *</Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-base font-semibold mt-6" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.loading', locale)}
                  </>
                ) : (
                  t('auth.submit', locale)
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setCurrentPage('login')}
            >
              <LogIn className="h-4 w-4" />
              {t('auth.login', locale)}
            </Button>
            <Button
              variant="link"
              className="w-full text-muted-foreground"
              onClick={() => setCurrentPage('landing')}
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.back', locale)}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
