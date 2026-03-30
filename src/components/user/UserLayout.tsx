'use client';

import React from 'react';
import { useAppStore, type UserPageName } from '@/lib/store';
import { t, isRTL } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  DollarSign,
  Receipt,
  FileText,
  Calendar,
  Wrench,
  Award,
  Link,
  Users,
  BarChart3,
  Settings,
  LogOut,
  MessageSquare,
  Menu,
} from 'lucide-react';
import UserHome from './UserHome';
import IncomePage from './IncomePage';
import ExpensesPage from './ExpensesPage';
import InvoicesPage from './InvoicesPage';
import BookingsPage from './BookingsPage';
import WorkOrdersPage from './WorkOrdersPage';
import CertificatesPage from './CertificatesPage';
import ShkPage from './ShkPage';
import CustomersPage from './CustomersPage';
import ReportsPage from './ReportsPage';
import UserSettingsPage from './UserSettingsPage';
import SupportChat from './SupportChat';

const navItems: { key: UserPageName; icon: React.ElementType; labelKey: string }[] = [
  { key: 'home', icon: LayoutDashboard, labelKey: 'user.home' },
  { key: 'income', icon: DollarSign, labelKey: 'user.income' },
  { key: 'expenses', icon: Receipt, labelKey: 'user.expenses' },
  { key: 'invoices', icon: FileText, labelKey: 'user.invoices' },
  { key: 'bookings', icon: Calendar, labelKey: 'user.bookings' },
  { key: 'work-orders', icon: Wrench, labelKey: 'user.workOrders' },
  { key: 'certificates', icon: Award, labelKey: 'user.certificates' },
  { key: 'shk', icon: Link, labelKey: 'user.shkService' },
  { key: 'customers', icon: Users, labelKey: 'user.customers' },
  { key: 'reports', icon: BarChart3, labelKey: 'user.reports' },
  { key: 'settings', icon: Settings, labelKey: 'user.settings' },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { userPage, setUserPage, locale, logout } = useAppStore();
  const rtl = isRTL(locale);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">IBS</span>
        </div>
        <span className="font-semibold text-lg">IBS-Pro</span>
      </div>
      <Separator />
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = userPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setUserPage(item.key);
                  onClose?.();
                }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                dir={rtl ? 'rtl' : 'ltr'}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{t(item.labelKey, locale)}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-2">
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full transition-colors"
          dir={rtl ? 'rtl' : 'ltr'}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{t('nav.signOut', locale)}</span>
        </button>
      </div>
    </div>
  );
}

function TopBar() {
  const { userPage, locale, user, setSupportChatOpen } = useAppStore();
  const rtl = isRTL(locale);
  const currentNav = navItems.find((n) => n.key === userPage);
  const pageTitle = currentNav ? t(currentNav.labelKey, locale) : '';

  return (
    <header
      className={`sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 ${
        rtl ? 'flex-row-reverse' : ''
      }`}
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side={rtl ? 'right' : 'left'} className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onClose={() => {}} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex items-center gap-2">
        <span className="font-semibold text-sm">
          IBS-Pro {user?.companyName ? `| ${user.companyName}` : ''}
        </span>
        {pageTitle && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground text-sm">{pageTitle}</span>
          </>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSupportChatOpen(true)}
        title="Support Chat"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>

      <Button variant="ghost" size="sm" onClick={logout}>
        <LogOut className="h-4 w-4 ms-2" />
        <span>{t('nav.signOut', locale)}</span>
      </Button>
    </header>
  );
}

function PageContent() {
  const { userPage } = useAppStore();

  switch (userPage) {
    case 'home':
      return <UserHome />;
    case 'income':
      return <IncomePage />;
    case 'expenses':
      return <ExpensesPage />;
    case 'invoices':
      return <InvoicesPage />;
    case 'bookings':
      return <BookingsPage />;
    case 'work-orders':
      return <WorkOrdersPage />;
    case 'certificates':
      return <CertificatesPage />;
    case 'shk':
      return <ShkPage />;
    case 'customers':
      return <CustomersPage />;
    case 'reports':
      return <ReportsPage />;
    case 'settings':
      return <UserSettingsPage />;
    default:
      return <UserHome />;
  }
}

export default function UserLayout() {
  const { locale } = useAppStore();
  const rtl = isRTL(locale);

  return (
    <div className={`flex h-screen bg-background ${rtl ? 'flex-row-reverse' : ''}`} dir={rtl ? 'rtl' : 'ltr'}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r bg-card">
        <SidebarContent />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <PageContent />
        </main>
      </div>

      {/* Support chat */}
      <SupportChat />
    </div>
  );
}
