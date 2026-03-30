'use client';

import React, { useState } from 'react';
import { useAppStore, t } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Shield, ArrowLeft, User, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const { setCurrentPage, locale } = useAppStore();
  const { toast } = useToast();
  const isRTL = locale === 'ar';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ title: t('auth.invalidCredentials', locale), variant: 'destructive' });
        return;
      }

      useAppStore.getState().setAdminToken(data.token);
      setCurrentPage('admin-dashboard');
      toast({ title: 'Success', description: 'Admin login successful' });
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-slate-950 p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-sm">
        <Card className="shadow-2xl border-slate-800 bg-slate-900 text-white">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
              <Shield className="h-6 w-6 text-amber-500" />
            </div>
            <CardTitle className="text-xl font-bold text-white">Admin Access</CardTitle>
            <p className="text-xs text-slate-400">IBS-Pro System Administration</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-user" className="text-slate-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <Input
                  id="admin-user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  placeholder="admin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-pass" className="text-slate-300 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="admin-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.loading', locale)}
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            <Separator className="my-4 bg-slate-700" />
            <Button
              variant="ghost"
              className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => setCurrentPage('landing')}
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.back', locale)}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
