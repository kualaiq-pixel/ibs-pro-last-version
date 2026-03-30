'use client';

import React, { useState, ReactNode } from 'react';
import { useAppStore, t, type AdminPageName } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageCircle,
  UserPlus,
  Database,
  FileText,
  Settings,
  LogOut,
  Menu,
  Shield,
} from 'lucide-react';

const navItems: { key: AdminPageName; icon: ReactNode; labelKey: string }[] = [
  { key: 'home', icon: <LayoutDashboard className="h-5 w-5" />, labelKey: 'admin.home' },
  { key: 'companies', icon: <Building2 className="h-5 w-5" />, labelKey: 'admin.companies' },
  { key: 'users', icon: <Users className="h-5 w-5" />, labelKey: 'admin.users' },
  { key: 'support-chat', icon: <MessageCircle className="h-5 w-5" />, labelKey: 'admin.supportChat' },
  { key: 'registrations', icon: <UserPlus className="h-5 w-5" />, labelKey: 'admin.registrations' },
  { key: 'data-import', icon: <Database className="h-5 w-5" />, labelKey: 'admin.dataImport' },
  { key: 'audit-logs', icon: <FileText className="h-5 w-5" />, labelKey: 'admin.auditLogs' },
  { key: 'settings', icon: <Settings className="h-5 w-5" />, labelKey: 'admin.settings' },
];

function SidebarNav({
  adminPage,
  setAdminPage,
  adminLogout,
  locale,
  isRTL,
  onNavigate,
}: {
  adminPage: AdminPageName;
  setAdminPage: (page: AdminPageName) => void;
  adminLogout: () => void;
  locale: string;
  isRTL: boolean;
  onNavigate?: () => void;
}) {
  const handleNav = (page: AdminPageName) => {
    setAdminPage(page);
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">IBS-Pro</h1>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant={adminPage === item.key ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-3 h-10 ${isRTL ? 'flex-row-reverse text-right' : ''}`}
              onClick={() => handleNav(item.key)}
            >
              {item.icon}
              <span className="font-medium">{t(item.labelKey, locale)}</span>
            </Button>
          ))}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-3">
        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 h-10 text-destructive hover:text-destructive hover:bg-destructive/10 ${isRTL ? 'flex-row-reverse text-right' : ''}`}
          onClick={adminLogout}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">{t('nav.signOut', locale)}</span>
        </Button>
      </div>
    </div>
  );
}

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { adminPage, setAdminPage, adminLogout, locale } = useAppStore();
  const isRTL = locale === 'ar';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentLabel = navItems.find((item) => item.key === adminPage)?.labelKey || 'admin.dashboard';

  const handleMobileNav = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`h-screen flex ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-card shrink-0">
        <SidebarNav
          adminPage={adminPage}
          setAdminPage={setAdminPage}
          adminLogout={adminLogout}
          locale={locale}
          isRTL={isRTL}
        />
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b bg-card flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? 'right' : 'left'} className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SidebarNav
                  adminPage={adminPage}
                  setAdminPage={setAdminPage}
                  adminLogout={adminLogout}
                  locale={locale}
                  isRTL={isRTL}
                  onNavigate={handleMobileNav}
                />
              </SheetContent>
            </Sheet>
            <h2 className="text-lg font-semibold">{t(currentLabel, locale)}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-muted-foreground">IBS-Pro | Admin</span>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={adminLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
