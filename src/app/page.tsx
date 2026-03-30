'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { useAppStore, type UserPageName, type AdminPageName } from '@/lib/store';
import { isRTL } from '@/lib/i18n';

// Landing
import LandingPage from '@/components/landing/LandingPage';
// Auth
import LoginPage from '@/components/auth/LoginPage';
import RegisterPage from '@/components/auth/RegisterPage';
import AdminLoginPage from '@/components/auth/AdminLoginPage';
// Admin pages
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHome from '@/components/admin/AdminHome';
import CompaniesPage from '@/components/admin/CompaniesPage';
import UsersPage from '@/components/admin/UsersPage';
import RegistrationsPage from '@/components/admin/RegistrationsPage';
import DataImportPage from '@/components/admin/DataImportPage';
import AuditLogsPage from '@/components/admin/AuditLogsPage';
import AdminSettingsPage from '@/components/admin/AdminSettingsPage';
import SupportChatPage from '@/components/admin/SupportChatPage';
// User layout (handles its own routing internally)
import UserLayout from '@/components/user/UserLayout';

function AdminPageRouter() {
  const { adminPage } = useAppStore();
  const pages: Record<AdminPageName, React.ReactNode> = {
    'home': <AdminHome />,
    'companies': <CompaniesPage />,
    'users': <UsersPage />,
    'support-chat': <SupportChatPage />,
    'registrations': <RegistrationsPage />,
    'data-import': <DataImportPage />,
    'audit-logs': <AuditLogsPage />,
    'settings': <AdminSettingsPage />,
  };
  return <>{pages[adminPage]}</>;
}

function AppContent() {
  const { currentPage, locale, token, adminToken } = useAppStore();
  const dir = isRTL(locale) ? 'rtl' : 'ltr';

  useEffect(() => {
    // Check for secret admin URL path
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('sec-ad-admin')) {
        useAppStore.getState().setPage('admin-login');
        window.history.replaceState({}, '', '/');
        return;
      }
    }

    const storedToken = localStorage.getItem('ibs-token');
    const storedUser = localStorage.getItem('ibs-user');
    const storedAdminToken = localStorage.getItem('ibs-admin-token');

    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        useAppStore.getState().setToken(storedToken, user);
        useAppStore.getState().setPage('user-dashboard');
      } catch { /* ignore */ }
    } else if (storedAdminToken) {
      useAppStore.getState().setAdminToken(storedAdminToken);
    }
  }, []);

  return (
    <div dir={dir} className="min-h-screen bg-background text-foreground">
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'register' && <RegisterPage />}
      {currentPage === 'admin-login' && <AdminLoginPage />}
      {currentPage === 'admin-dashboard' && adminToken && (
        <AdminLayout>
          <AdminPageRouter />
        </AdminLayout>
      )}
      {currentPage === 'user-dashboard' && token && <UserLayout />}
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AppContent />
    </ThemeProvider>
  );
}
