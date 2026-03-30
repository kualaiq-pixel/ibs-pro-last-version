'use client';

import React, { useState } from 'react';
import { useAppStore, t } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Building2, User, Lock, ArrowLeft, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const { setCurrentPage, locale } = useAppStore();
  const { toast } = useToast();
  const isRTL = locale === 'ar';

  const [companyCode, setCompanyCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyCode, username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'pending') {
          toast({ title: t('auth.accountPending', locale), variant: 'destructive' });
        } else if (data.error === 'rejected') {
          toast({ title: t('auth.accountRejected', locale), variant: 'destructive' });
        } else {
          toast({ title: t('auth.invalidCredentials', locale), variant: 'destructive' });
        }
        return;
      }

      useAppStore.getState().setToken(data.token, {
        id: data.user.id,
        username: data.user.username,
        role: data.user.role,
        companyId: data.user.companyId,
        companyName: data.user.companyName,
      });
      setCurrentPage('user-dashboard');
      toast({ title: 'Success', description: 'Logged in successfully' });
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{t('auth.login', locale)}</CardTitle>
            <CardDescription>{t('hero.title', locale)}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyCode" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {t('auth.companyCode', locale)} *
                </Label>
                <Input
                  id="companyCode"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value)}
                  required
                  placeholder="e.g. ACME001"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {t('auth.username', locale)} *
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="your_username"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  {t('auth.password', locale)} *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.loading', locale)}
                  </>
                ) : (
                  t('auth.login', locale)
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setCurrentPage('register')}
            >
              <UserPlus className="h-4 w-4" />
              {t('auth.register', locale)}
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
