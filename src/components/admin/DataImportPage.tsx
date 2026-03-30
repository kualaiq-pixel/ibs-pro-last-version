'use client';

import React, { useRef, useState } from 'react';
import { useAppStore, t } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, Download, Upload, AlertTriangle } from 'lucide-react';

export default function DataImportPage() {
  const { locale } = useAppStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/export');
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ibs-pro-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Success', description: 'Data exported successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to export data', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Import failed');
      }
      toast({ title: 'Success', description: 'Data imported successfully' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Import failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">{t('admin.dataImport', locale)}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Download className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{t('admin.exportData', locale)}</CardTitle>
                <CardDescription>Download all system data as a JSON file</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleExport}
              disabled={exporting}
            >
              <Database className="h-4 w-4" />
              {exporting ? 'Exporting...' : t('admin.exportData', locale)}
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Upload className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{t('admin.importData', locale)}</CardTitle>
                <CardDescription>Upload a JSON file to restore data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>{t('admin.importWarning', locale)}</AlertDescription>
            </Alert>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              className="w-full h-11 bg-amber-600 hover:bg-amber-700"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              <Upload className="h-4 w-4" />
              {importing ? 'Importing...' : t('admin.importData', locale)}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
