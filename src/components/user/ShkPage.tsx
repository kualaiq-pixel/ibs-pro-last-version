'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { getAuthHeaders } from './shared';

interface ShkLink {
  id: string;
  name: string;
  url: string;
  username: string;
  password: string;
}

export default function ShkPage() {
  const { locale } = useAppStore();

  const [links, setLinks] = useState<ShkLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');

  const loadLinks = async () => {
    try {
      const res = await fetch('/api/user/shk-links', { headers: getAuthHeaders() });
      if (res.ok) setLinks(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadLinks(); }, []);

  const resetForm = () => { setFormName(''); setFormUrl(''); setFormUsername(''); setFormPassword(''); };
  const openNew = () => { setEditingId(null); resetForm(); setDialogOpen(true); };
  const openEdit = (link: ShkLink) => {
    setEditingId(link.id);
    setFormName(link.name);
    setFormUrl(link.url);
    setFormUsername(link.username || '');
    setFormPassword('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName || !formUrl) return;
    setSaving(true);
    try {
      const body = { name: formName, url: formUrl, username: formUsername || undefined, password: formPassword || undefined };
      const url = editingId ? `/api/user/shk-links/${editingId}` : '/api/user/shk-links';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) { setDialogOpen(false); fetchLinks(); }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/user/shk-links/${deleteId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) { setDeleteId(null); fetchLinks(); }
    } catch { /* ignore */ }
  };

  const mask = (v: string) => v ? '••••••••' : '-';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('shk.title', locale)}</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 me-2" />
          {t('shk.addNew', locale)}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[calc(100vh-220px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('shk.linkName', locale)}</TableHead>
                  <TableHead>{t('shk.linkUrl', locale)}</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>{t('common.actions', locale)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center">{t('common.loading', locale)}</TableCell></TableRow>
                ) : links.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center">{t('common.noData', locale)}</TableCell></TableRow>
                ) : (
                  links.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">{link.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-blue-600">{link.url}</TableCell>
                      <TableCell><Badge variant="outline">{mask(link.username)}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{mask(link.password)}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => window.open(link.url, '_blank')}><ExternalLink className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(link)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(link.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? t('common.edit', locale) : t('shk.addNew', locale)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>{t('shk.linkName', locale)}</Label><Input value={formName} onChange={(e) => setFormName(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t('shk.linkUrl', locale)}</Label><Input value={formUrl} onChange={(e) => setFormUrl(e.target.value)} /></div>
            <div className="space-y-2"><Label>Username</Label><Input value={formUsername} onChange={(e) => setFormUsername(e.target.value)} /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder={editingId ? 'Leave blank to keep current' : ''} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel', locale)}</Button>
            <Button onClick={handleSave} disabled={saving}>{t('common.save', locale)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm', locale)}</AlertDialogTitle>
            <AlertDialogDescription>{t('common.delete', locale)}?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', locale)}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('common.delete', locale)}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
