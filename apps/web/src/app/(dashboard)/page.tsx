'use client';

import Link from 'next/link';
import { FileText, Users, Handshake, ArrowRight, Lightbulb } from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';

const statCards = [
  { key: 'totalListings', label: 'Alle Stellen', icon: FileText, accent: 'bg-primary/8 text-primary' },
  { key: 'activeListings', label: 'Aktive Stellen', icon: FileText, accent: 'bg-success-light text-success' },
  { key: 'totalMatches', label: 'Matches', icon: Handshake, accent: 'bg-purple-50 text-accent' },
  { key: 'pendingApplications', label: 'Neue Bewerbungen', icon: Users, accent: 'bg-warning-light text-warning' },
] as const;

const quickLinks = [
  { label: 'Stellen verwalten', href: '/stellen', icon: FileText },
  { label: 'Bewerbungen prüfen', href: '/bewerber', icon: Users },
  { label: 'Profil bearbeiten', href: '/profil', icon: Handshake },
];

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-[22px] font-bold tracking-tight text-text">
          Willkommen zurück
        </h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          Hier ist die Übersicht Ihres Unternehmens
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="group rounded-2xl bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200"
          >
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${card.accent}`}>
              <card.icon className="h-[18px] w-[18px]" />
            </div>
            <p className="mt-4 text-[28px] font-bold tracking-tight text-text">
              {isLoading ? '—' : stats?.[card.key] ?? 0}
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-text-tertiary">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Quick links */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-card">
          <h2 className="text-[15px] font-semibold text-text mb-4">Schnellzugriff</h2>
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between rounded-xl px-4 py-3 text-[13px] font-medium text-text-secondary hover:bg-background transition-colors"
              >
                <span className="flex items-center gap-3">
                  <link.icon className="h-4 w-4 text-text-tertiary" />
                  {link.label}
                </span>
                <ArrowRight className="h-4 w-4 text-text-tertiary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150" />
              </Link>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4 text-warning" />
            <h2 className="text-[15px] font-semibold text-text">Tipps</h2>
          </div>
          <ul className="space-y-3 text-[13px] leading-relaxed text-text-secondary">
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
              Detaillierte Stellenbeschreibungen verbessern Ihr Matching
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
              Ideale Persönlichkeitsprofile definieren — für bessere Kandidaten
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
              Schnelle Antworten erhöhen Ihre Sichtbarkeit
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
