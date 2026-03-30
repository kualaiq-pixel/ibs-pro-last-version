'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageSquare, Send, X } from 'lucide-react';
import { getAuthHeaders } from './shared';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'support';
  createdAt: string;
}

export default function SupportChat() {
  const { locale, supportChatOpen, setSupportChatOpen } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (supportChatOpen) {
      const load = async () => {
        try {
          const res = await fetch('/api/user/support/messages', { headers: getAuthHeaders() });
          if (res.ok) setMessages(await res.json());
        } catch { /* ignore */ }
      };
      load();
    }
  }, [supportChatOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const msg = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await fetch('/api/user/support/send', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: msg }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data]);
      }
    } catch { /* ignore */ }
    setSending(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setSupportChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
        title="Support Chat"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Chat dialog */}
      <Dialog open={supportChatOpen} onOpenChange={setSupportChatOpen}>
        <DialogContent className="sm:max-w-md p-0 h-[500px] flex flex-col">
          <DialogHeader className="p-4 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('admin.supportChat', locale)}
              </DialogTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSupportChatOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center mt-8">
                {t('common.noData', locale)}
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-muted'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-emerald-200' : 'text-muted-foreground'}`}>
                    {msg.createdAt}
                  </p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-end">
                <div className="bg-emerald-600 text-white rounded-lg px-3 py-2 text-sm animate-pulse">
                  ...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 pt-2 border-t flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim() || sending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
