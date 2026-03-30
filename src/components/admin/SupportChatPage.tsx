'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAppStore, t } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Building2, MessageCircle } from 'lucide-react';
import { getAdminAuthHeaders } from './shared';

interface CompanyChat {
  id: string;
  name: string;
  code: string;
}

interface Message {
  id: string;
  sender: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export default function SupportChatPage() {
  const { locale } = useAppStore();
  const { toast } = useToast();

  const [companies, setCompanies] = useState<CompanyChat[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/support/companies', { headers: getAdminAuthHeaders() });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCompanies(data);
      if (data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data[0].id);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load companies', variant: 'destructive' });
    } finally {
      setLoadingCompanies(false);
    }
  }, [toast, selectedCompanyId]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  useEffect(() => {
    if (!selectedCompanyId) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/admin/support/messages/${selectedCompanyId}`, { headers: getAdminAuthHeaders() });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setMessages(data);
      } catch {
        toast({ title: 'Error', description: 'Failed to load messages', variant: 'destructive' });
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedCompanyId, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedCompanyId) return;
    setSending(true);
    try {
      const res = await fetch('/api/admin/support/send', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ companyId: selectedCompanyId, message: newMessage.trim() }),
      });
      if (!res.ok) throw new Error('Failed to send');
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
    } catch {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">{t('admin.supportChat', locale)}</h3>

      <Card className="overflow-hidden">
        <CardContent className="p-0 h-[600px] flex">
          {/* Company List */}
          <div className="w-72 border-r bg-muted/30 shrink-0 hidden md:block">
            <div className="p-3 border-b">
              <h4 className="font-semibold text-sm text-muted-foreground px-2">Companies</h4>
            </div>
            <ScrollArea className="h-[calc(600px-49px)]">
              {loadingCompanies ? (
                <div className="p-3 space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {companies.map((company) => (
                    <Button
                      key={company.id}
                      variant={selectedCompanyId === company.id ? 'secondary' : 'ghost'}
                      className="w-full h-auto py-3 px-3 justify-start gap-3"
                      onClick={() => setSelectedCompanyId(company.id)}
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {company.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left min-w-0">
                        <p className="font-medium text-sm truncate">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.code}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            {selectedCompany && (
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {selectedCompany.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{selectedCompany.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedCompany.code}</p>
                </div>
              </div>
            )}

            {/* Mobile Company Selector */}
            <div className="md:hidden p-2 border-b overflow-x-auto">
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-1">
                  {companies.map((company) => (
                    <Button
                      key={company.id}
                      size="sm"
                      variant={selectedCompanyId === company.id ? 'secondary' : 'outline'}
                      onClick={() => setSelectedCompanyId(company.id)}
                      className="shrink-0"
                    >
                      {company.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-3/4" />)}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mb-3 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-xs mt-1">Start a conversation with this company</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg px-4 py-2.5 ${isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-xs font-medium mb-1 opacity-80">{msg.senderName}</p>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isAdmin ? 'opacity-70' : 'text-muted-foreground'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  disabled={sending || !selectedCompanyId}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim() || !selectedCompanyId}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
