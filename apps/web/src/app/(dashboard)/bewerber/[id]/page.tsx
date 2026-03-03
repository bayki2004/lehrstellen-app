'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, X, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  useApplicationDetail,
  useApplicationDossier,
  useUpdateApplicationStatus,
} from '@/hooks/use-applications';
import { toast } from 'sonner';

const FINAL_STATUSES = ['ACCEPTED', 'REJECTED', 'WITHDRAWN'];

export default function BewerberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: app, isLoading } = useApplicationDetail(id);
  const updateStatus = useUpdateApplicationStatus();

  const [dossierRequested, setDossierRequested] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { data: dossierData } = useApplicationDossier(id, dossierRequested);

  const pendingDownload = useRef(false);

  const generateAndDownload = useCallback(async (data: typeof dossierData) => {
    if (!data) return;
    setGenerating(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: DossierDocument } = await import(
        '@/components/pdf/DossierDocument'
      );
      const blob = await pdf(<DossierDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const studentName = `${data.student.firstName}_${data.student.lastName}`;
      const listing = data.application.listing.title.replace(/\s+/g, '_');
      a.download = `Bewerbung_${studentName}_${listing}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Dossier heruntergeladen');
    } catch {
      toast.error('Fehler beim Erstellen des Dossiers');
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleDownloadDossier = useCallback(() => {
    if (dossierData) {
      generateAndDownload(dossierData);
    } else {
      pendingDownload.current = true;
      setDossierRequested(true);
      toast.info('Dossier wird vorbereitet...');
    }
  }, [dossierData, generateAndDownload]);

  // Auto-trigger download once dossier data arrives after request
  useEffect(() => {
    if (dossierData && pendingDownload.current) {
      pendingDownload.current = false;
      generateAndDownload(dossierData);
    }
  }, [dossierData, generateAndDownload]);

  const handleAccept = () => {
    if (!confirm('Bewerbung annehmen? Der Chat wird freigeschaltet.')) return;
    updateStatus.mutate(
      { id, data: { status: 'ACCEPTED' } },
      {
        onSuccess: () => {
          toast.success('Bewerbung angenommen');
          router.push('/bewerber');
        },
        onError: () => toast.error('Fehler'),
      },
    );
  };

  const handleReject = () => {
    if (!confirm('Bewerbung wirklich absagen? Dies kann nicht rückgängig gemacht werden.')) return;
    updateStatus.mutate(
      { id, data: { status: 'REJECTED' } },
      {
        onSuccess: () => {
          toast.success('Bewerbung abgesagt');
          router.push('/bewerber');
        },
        onError: () => toast.error('Fehler'),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="py-12 text-center text-text-secondary">
        Bewerbung nicht gefunden
      </div>
    );
  }

  const student = (app as any).student;
  const isFinal = FINAL_STATUSES.includes(app.status);

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/bewerber"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Link>
        <button
          onClick={handleDownloadDossier}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Dossier herunterladen
        </button>
      </div>

      <div className="rounded-2xl bg-surface p-6 shadow-sm border border-border-light mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
            {student?.firstName?.[0] || 'B'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">
              {student ? `${student.firstName} ${student.lastName}` : 'Bewerber'}
            </h1>
            {student?.canton && (
              <p className="text-sm text-text-secondary">
                {student.canton}, {student.city}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Section title="Lehrstelle">
          <p className="text-sm text-text">{app.listing?.title}</p>
          {app.listing && (
            <p className="text-sm text-text-secondary">
              {app.listing.canton}, {app.listing.city}
            </p>
          )}
        </Section>

        {app.motivationAnswers && app.motivationAnswers.length > 0 && (
          <Section title="Motivationsfragen">
            {app.motivationAnswers.map((qa: { question: string; answer: string }, idx: number) => (
              <div key={idx} className={idx < app.motivationAnswers!.length - 1 ? 'mb-4' : ''}>
                <p className="text-sm font-semibold text-text mb-1">{qa.question}</p>
                <p className="text-sm text-text whitespace-pre-wrap">{qa.answer}</p>
              </div>
            ))}
          </Section>
        )}

        {app.verfuegbarkeit && (
          <Section title="Verfügbarkeit">
            <p className="text-sm text-text">{app.verfuegbarkeit}</p>
          </Section>
        )}

        {app.relevanteErfahrungen && app.relevanteErfahrungen.length > 0 && (
          <Section title="Relevante Erfahrungen">
            <div className="flex flex-wrap gap-2">
              {app.relevanteErfahrungen.map((exp, i) => (
                <span
                  key={i}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-dark"
                >
                  {exp}
                </span>
              ))}
            </div>
          </Section>
        )}

        {app.fragenAnBetrieb && (
          <Section title="Fragen an den Betrieb">
            <p className="text-sm text-text whitespace-pre-wrap">
              {app.fragenAnBetrieb}
            </p>
          </Section>
        )}

        {app.schnupperlehreWunsch && (
          <Section title="Schnupperlehre">
            <p className="text-sm text-success font-medium">
              Wünscht eine Schnupperlehre
            </p>
          </Section>
        )}
      </div>

      {!isFinal && (
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleReject}
            disabled={updateStatus.isPending}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-error py-3 text-sm font-semibold text-error hover:bg-error/5 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Absagen
          </button>
          <button
            onClick={handleAccept}
            disabled={updateStatus.isPending}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-success py-3 text-sm font-semibold text-white hover:bg-success/90 transition-colors disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Annehmen
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-sm border border-border-light">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
        {title}
      </h2>
      {children}
    </div>
  );
}
