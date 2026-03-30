'use client';

import { create } from 'zustand';
import { translations, type Locale } from './i18n';

export type PageName = 'landing' | 'login' | 'register' | 'admin-login' | 'user-dashboard' | 'admin-dashboard';
export type AdminPageName = 'home' | 'companies' | 'users' | 'support-chat' | 'registrations' | 'data-import' | 'audit-logs' | 'settings';
export type UserPageName = 'home' | 'income' | 'expenses' | 'invoices' | 'bookings' | 'work-orders' | 'certificates' | 'shk' | 'customers' | 'reports' | 'settings';

interface UserData {
  id: string;
  username: string;
  role: string;
  companyId: string;
  companyName: string;
}

interface AppState {
  // Navigation
  currentPage: PageName;
  setPage: (page: PageName) => void;
  setCurrentPage: (page: PageName) => void; // alias

  adminPage: AdminPageName;
  setAdminPage: (page: AdminPageName) => void;

  userPage: UserPageName;
  setUserPage: (page: UserPageName) => void;

  // Locale
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Auth - User
  token: string | null;
  user: UserData | null;
  setToken: (token: string, user: UserData) => void;
  logout: () => void;

  // Auth - Admin
  adminToken: string | null;
  setAdminToken: (token: string) => void;
  adminLogout: () => void;

  // Support chat
  supportChatOpen: boolean;
  setSupportChatOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'landing',
  setPage: (page) => set({ currentPage: page }),
  setCurrentPage: (page) => set({ currentPage: page }),

  adminPage: 'home',
  setAdminPage: (page) => set({ adminPage: page }),

  userPage: 'home',
  setUserPage: (page) => set({ userPage: page }),

  locale: 'en',
  setLocale: (locale) => set({ locale }),

  token: null,
  user: null,
  setToken: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ibs-token', token);
      localStorage.setItem('ibs-user', JSON.stringify(user));
    }
    set({ token, user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ibs-token');
      localStorage.removeItem('ibs-user');
    }
    set({ token: null, user: null, currentPage: 'landing', supportChatOpen: false });
  },

  adminToken: null,
  setAdminToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ibs-admin-token', token);
    }
    set({ adminToken: token, currentPage: 'admin-dashboard' });
  },
  adminLogout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ibs-admin-token');
    }
    set({ adminToken: null, currentPage: 'landing' });
  },

  supportChatOpen: false,
  setSupportChatOpen: (open) => set({ supportChatOpen: open }),
}));

// Translation helper - can accept optional locale override
export function t(key: string, localeOverride?: string): string {
  const locale = (localeOverride as Locale) || useAppStore.getState().locale;
  return translations[locale]?.[key] || translations['en']?.[key] || key;
}
