'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, ChevronRight } from 'lucide-react';
import { useApplications } from '@/hooks/use-applications';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING: { label: 'Neu', color: 'text-primary', bg: 'bg-primary/8', dot: 'bg-primary' },
  VIEWED: { label: 'Angesehen', color: 'text-warning', bg: 'bg-warning-light', dot: 'bg-warning' },
  SHORTLISTED: { label: 'Vorauswahl', color: 'text-warning', bg: 'bg-warning-light', dot: 'bg-warning' },
  INTERVIEW_SCHEDULED: { label: 'Einladung', color: 'text-success', bg: 'bg-success-light', dot: 'bg-success' },
  ACCEPTED: { label: 'Angenommen', color: 'text-success', bg: 'bg-success-light', dot: 'bg-success' },
  REJECTED: { label: 'Abgesagt', color: 'text-error', bg: 'bg-error-light', dot: 'bg-error' },
  WITHDRAWN: { label: 'Zurückgezogen', color: 'text-text-tertiary', bg: 'bg-background', dot: 'bg-text-tertiary' },
};

const ACTIVE_STATUSES = ['PENDING', 'VIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'];
const FINAL_STATUSES = ['ACCEPTED', 'REJECTED', 'WITHDRAWN'];

export default function BewerberPage() {
  const { data: applications, isLoading } = useApplications();
  const [tab, setTab] = useState<'eingegangen' | 'erledigt'>('eingegangen');

  const filtered = (applications as any[])?.filter((app) => {
    const status = app.applicationStatus ?? app.status;
    return tab === 'eingegangen'
      ? ACTIVE_STATUSES.includes(status)
      : FINAL_STATUSES.includes(status);
  });

  const activeCount = (applications as any[])?.filter((app) => {
    const status = app.applicationStatus ?? app.status;
    return ACTIVE_STATUSES.includes(status);
  })?.length ?? 0;

  const finalCount = (applications as any[])?.filter((app) => {
    const status = app.applicationStatus ?? app.status;
    return FINAL_STATUSES.includes(status);
  })?.length ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[22px] font-bold tracking-tight text-text">
          Bewerber
        </h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          Verwalten Sie eingehende Bewerbungen
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-background p-1">
        {([
          { key: 'eingegangen' as const, label: 'Eingegangen', count: activeCount },
          { key: 'erledigt' as const, label: 'Erledigt', count: finalCount },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-[13px] font-medium transition-all duration-150',
              tab === t.key
                ? 'bg-white text-text shadow-card font-semibold'
                : 'text-text-secondary hover:text-text',
            )}
          >
            {t.label}
            {!isLoading && (
              <span className={cn(
                'ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold',
                tab === t.key ? 'bg-primary/10 text-primary' : 'bg-background-secondary text-text-tertiary',
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
        </div>
      ) : !filtered?.length ? (
        <div className="rounded-2xl bg-white p-14 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-background">
            <Users className="h-6 w-6 text-text-tertiary" />
          </div>
          <p className="text-[16px] font-semibold text-text">
            Keine Bewerbungen
          </p>
          <p className="mt-1 text-[13px] text-text-secondary">
            {tab === 'eingegangen'
              ? 'Noch keine neuen Bewerbungen eingegangen'
              : 'Keine erledigten Bewerbungen'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                  Bewerber
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                  Stelle
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                  Status
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                  Datum
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light/60">
              {filtered.map((app: any) => {
                const appStatus = app.applicationStatus ?? app.status;
                const statusCfg = STATUS_CONFIG[appStatus] || STATUS_CONFIG.PENDING;
                const appId = app.applicationId ?? app.id;
                const initial = app.studentName?.[0] ?? 'B';
                return (
                  <tr key={appId} className="group hover:bg-background/40 transition-colors duration-100">
                    <td className="px-6 py-4">
                      <Link href={`/bewerber/${appId}`} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-[13px] font-semibold text-primary">
                          {initial}
                        </div>
                        <span className="text-[14px] font-medium text-text">
                          {app.studentName || 'Bewerber'}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-text-secondary">
                        {app.listing?.title || 'Lehrstelle'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                        statusCfg.bg, statusCfg.color,
                      )}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] text-text-tertiary tabular-nums">
                        {new Date(app.createdAt).toLocaleDateString('de-CH')}
                      </span>
                    </td>
                    <td className="pr-4">
                      <Link
                        href={`/bewerber/${appId}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary opacity-0 group-hover:opacity-100 hover:bg-background transition-all duration-100"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
