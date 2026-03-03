'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useMatchDetail, useChatMessages } from '@/hooks/use-matches';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';

export default function ChatConversationPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { data: match } = useMatchDetail(matchId);
  const { data: initialMessages } = useChatMessages(matchId);
  const { user, accessToken } = useAuthStore();
  const {
    messages: storeMessages,
    isConnected,
    connect,
    sendMessage,
    joinMatch,
    leaveMatch,
    setMessages,
    markRead,
  } = useChatStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (accessToken && !isConnected) {
      connect(accessToken);
    }
  }, [accessToken, isConnected, connect]);

  useEffect(() => {
    if (matchId && isConnected) {
      joinMatch(matchId);
      markRead(matchId);
    }
    return () => {
      if (matchId) leaveMatch(matchId);
    };
  }, [matchId, isConnected, joinMatch, leaveMatch, markRead]);

  useEffect(() => {
    if (initialMessages && matchId) {
      setMessages(matchId, initialMessages);
    }
  }, [initialMessages, matchId, setMessages]);

  const messages = storeMessages[matchId] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(matchId, text);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col -my-8 -mx-6">
      <div className="flex items-center gap-3 border-b border-border-light bg-surface px-6 py-4">
        <Link href="/chat" className="text-text-secondary hover:text-text">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
          {match?.student?.firstName?.[0] || 'S'}
        </div>
        <div>
          <p className="font-medium text-text text-sm">
            {match?.student
              ? `${match.student.firstName} ${match.student.lastName}`
              : 'Student'}
          </p>
          <p className="text-xs text-text-tertiary">{match?.listing?.title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-background">
        {messages.length === 0 && (
          <p className="text-center text-sm text-text-tertiary py-8">
            Schreiben Sie die erste Nachricht!
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                  isOwn
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-surface text-text shadow-sm rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`mt-1 text-xs ${
                    isOwn ? 'text-white/70' : 'text-text-tertiary'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString('de-CH', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border-light bg-surface px-6 py-3">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nachricht schreiben..."
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
