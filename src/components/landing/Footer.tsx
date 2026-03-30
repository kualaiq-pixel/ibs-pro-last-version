'use client';

import { useAppStore } from '@/lib/store';
import { t, isRTL } from '@/lib/i18n';

export default function Footer() {
  const { locale } = useAppStore();
  const rtl = isRTL(locale);

  const currentYear = new Date().getFullYear();

  return (
    <footer
      dir={rtl ? 'rtl' : 'ltr'}
      className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">IBS</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              IBS-Pro
            </span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {currentYear} IBS-Pro. {t('common.noData', locale) === 'No data available' ? 'All rights reserved.' : 'All rights reserved.'}
          </p>

          {/* Links */}
          <div className="flex items-center gap-4">
            <button
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {t('nav.contact', locale)}
            </button>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <button
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Privacy
            </button>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <button
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Terms
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
