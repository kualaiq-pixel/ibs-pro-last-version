'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import { getAuthHeaders } from './shared';

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  customer: string;
  total: number;
  status: 'Pending' | 'Paid';
  type: 'Receipt' | 'Invoice';
  referenceNumber?: string;
  items?: Array<{ description: string; amount: number }>;
}

export default function InvoicesPage() {
  const { locale } = useAppStore();
  const cur = t('common.currency', locale);

  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  const loadInvoices = async () => {
    try {
      const res = await fetch('/api/user/invoices', { headers: getAuthHeaders() });
      if (res.ok) setInvoices(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadInvoices(); }, []);

  const toggleStatus = async (item: InvoiceRecord) => {
    const newStatus = item.status === 'Paid' ? 'Pending' : 'Paid';
    try {
      const res = await fetch(`/api/user/invoices/${item.id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchInvoices();
    } catch { /* ignore */ }
  };

  const totalPending = invoices.filter((i) => i.status === 'Pending').reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('invoice.title', locale)}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-amber-50">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('invoice.totalPending', locale)}</p>
              <p className="text-xl font-bold">{totalPending.toFixed(2)}{cur}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-emerald-50">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('invoice.totalPaid', locale)}</p>
              <p className="text-xl font-bold">{totalPaid.toFixed(2)}{cur}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[calc(100vh-360px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>{t('income.date', locale)}</TableHead>
                  <TableHead>{t('income.customer', locale)}</TableHead>
                  <TableHead>{t('income.total', locale)}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>{t('common.actions', locale)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center">{t('common.loading', locale)}</TableCell></TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center">{t('common.noData', locale)}</TableCell></TableRow>
                ) : (
                  invoices.map((item) => (
                    <TableRow key={item.id} className="cursor-pointer" onClick={() => setSelectedInvoice(item)}>
                      <TableCell className="font-mono text-xs">{item.invoiceNumber}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.customer}</TableCell>
                      <TableCell className="font-semibold">{item.total.toFixed(2)}{cur}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'Paid' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); toggleStatus(item); }}
                        >
                          {item.status === 'Paid' ? t('invoice.markPending', locale) : t('invoice.markPaid', locale)}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedInvoice?.type === 'Receipt' ? t('invoice.receipt', locale) : t('invoice.invoice', locale)}
              {' #'}{selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('income.date', locale)}</p>
                  <p className="font-medium">{selectedInvoice.date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('income.customer', locale)}</p>
                  <p className="font-medium">{selectedInvoice.customer}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('booking.status', locale)}</p>
                  <Badge variant={selectedInvoice.status === 'Paid' ? 'default' : 'secondary'}>
                    {selectedInvoice.status}
                  </Badge>
                </div>
                {selectedInvoice.referenceNumber && (
                  <div>
                    <p className="text-muted-foreground">Reference #</p>
                    <p className="font-mono">{selectedInvoice.referenceNumber}</p>
                  </div>
                )}
              </div>
              <Separator />
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div className="space-y-1">
                  {selectedInvoice.items.map((line, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{line.description}</span>
                      <span>{line.amount.toFixed(2)}{cur}</span>
                    </div>
                  ))}
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>{t('income.total', locale)}</span>
                <span>{selectedInvoice.total.toFixed(2)}{cur}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
