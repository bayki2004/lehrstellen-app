'use client';

import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useMatches } from '@/hooks/use-matches';
import { cn } from '@/lib/utils';

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Gestern';
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
}

export default function ChatPage() {
  const { data: matches, isLoading } = useMatches();

  const chats = matches?.filter((m) => m.lastMessage || m.status === 'ACTIVE') || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[22px] font-bold tracking-tight text-text">
          Chat
        </h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          Nachrichten mit Bewerbern
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
        </div>
      ) : !chats.length ? (
        <div className="rounded-2xl bg-white p-14 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-background">
            <MessageCircle className="h-6 w-6 text-text-tertiary" />
          </div>
          <p className="text-[16px] font-semibold text-text">Keine Chats</p>
          <p className="mt-1 text-[13px] text-text-secondary">
            Chats werden nach angenommenen Bewerbungen freigeschaltet
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="divide-y divide-border-light/60">
            {chats.map((match) => {
              const hasUnread = match.unreadCount > 0;
              return (
                <Link
                  key={match.id}
                  href={`/chat/${match.id}`}
                  className="group flex items-center gap-4 px-6 py-4 hover:bg-background/40 transition-colors duration-100"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-[13px] font-semibold text-primary">
                    {match.student?.firstName?.[0] || 'S'}
                    {hasUnread && (
                      <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className={cn(
                        'text-[14px] truncate',
                        hasUnread ? 'font-semibold text-text' : 'font-medium text-text',
                      )}>
                        {match.student
                          ? `${match.student.firstName} ${match.student.lastName}`
                          : 'Student'}
                      </p>
                      {match.lastMessage && (
                        <span className="flex-shrink-0 text-[11px] text-text-tertiary tabular-nums">
                          {formatTime(match.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-0.5">
                      <div className="min-w-0">
                        {match.lastMessage ? (
                          <p className={cn(
                            'text-[13px] truncate',
                            hasUnread ? 'text-text-secondary font-medium' : 'text-text-tertiary',
                          )}>
                            {match.lastMessage.content}
                          </p>
                        ) : (
                          <p className="text-[12px] text-text-tertiary">
                            {match.listing?.title}
                          </p>
                        )}
                      </div>
                      {hasUnread && (
                        <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                          {match.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
