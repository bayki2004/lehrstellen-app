'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, X, MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';
import { useListingDetail, useUpdateListing } from '@/hooks/use-listings';
import { APPRENTICESHIP_FIELDS, SWISS_CANTONS } from '@lehrstellen/shared';
import { toast } from 'sonner';

const inputClass = 'w-full rounded-xl border border-border-light bg-background/50 px-4 py-2.5 text-[14px] text-text outline-none placeholder:text-text-tertiary focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all';
const selectClass = 'w-full rounded-xl border border-border-light bg-background/50 px-4 py-2.5 text-[14px] text-text outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all';
const labelClass = 'mb-1.5 block text-[13px] font-medium text-text';

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: listing, isLoading } = useListingDetail(id);
  const updateListing = useUpdateListing();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [field, setField] = useState('');
  const [canton, setCanton] = useState('');
  const [city, setCity] = useState('');
  const [spotsAvailable, setSpotsAvailable] = useState(1);
  const [durationYears, setDurationYears] = useState(3);
  const [motivationQuestions, setMotivationQuestions] = useState<Array<{ question: string; placeholder: string }>>([]);

  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description || '');
      setField(listing.field);
      setCanton(listing.canton);
      setCity(listing.city);
      setSpotsAvailable(listing.spotsAvailable);
      setDurationYears(listing.durationYears);
      setMotivationQuestions(
        (listing.motivationQuestions || []).map((q) => ({
          question: q.question,
          placeholder: q.placeholder || '',
        })),
      );
    }
  }, [listing]);

  const addQuestion = () => {
    if (motivationQuestions.length >= 5) return;
    setMotivationQuestions([...motivationQuestions, { question: '', placeholder: '' }]);
  };

  const removeQuestion = (index: number) => {
    setMotivationQuestions(motivationQuestions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, key: 'question' | 'placeholder', value: string) => {
    setMotivationQuestions(motivationQuestions.map((q, i) =>
      i === index ? { ...q, [key]: value } : q,
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateListing.mutate(
      {
        id,
        data: {
          title: title.trim(),
          description: description.trim(),
          field,
          canton,
          city: city.trim(),
          spotsAvailable,
          durationYears,
          motivationQuestions: motivationQuestions
            .filter((q) => q.question.trim())
            .map((q) => ({ question: q.question.trim(), placeholder: q.placeholder.trim() || undefined })),
        },
      },
      {
        onSuccess: () => {
          toast.success('Stelle aktualisiert');
          router.push('/stellen');
        },
        onError: () => toast.error('Fehler beim Aktualisieren'),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link
          href="/stellen"
          className="mb-4 inline-flex items-center gap-1 text-[13px] text-text-secondary hover:text-text transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Zurück
        </Link>
        <h1 className="text-[22px] font-bold tracking-tight text-text">Stelle bearbeiten</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="rounded-2xl bg-white p-6 shadow-card space-y-5">
          <div>
            <label className={labelClass}>Titel</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Berufsfeld</label>
            <select value={field} onChange={(e) => setField(e.target.value)} className={selectClass}>
              {APPRENTICESHIP_FIELDS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Kanton</label>
              <select value={canton} onChange={(e) => setCanton(e.target.value)} className={selectClass}>
                {SWISS_CANTONS.map((c) => (
                  <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Stadt</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} required className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Plätze</label>
              <input
                type="number"
                value={spotsAvailable}
                onChange={(e) => setSpotsAvailable(Number(e.target.value))}
                min={1}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Dauer (Jahre)</label>
              <input
                type="number"
                value={durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value))}
                min={1}
                max={5}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Motivation questions */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[15px] font-semibold text-text">Motivationsfragen</h2>
            {motivationQuestions.length > 0 && (
              <span className="text-[12px] text-text-tertiary tabular-nums">
                {motivationQuestions.length}/5
              </span>
            )}
          </div>
          <p className="text-[13px] text-text-secondary mb-4">
            Fragen, die Bewerber bei der Bewerbung beantworten müssen
          </p>

          {motivationQuestions.length > 0 && (
            <div className="space-y-3 mb-4">
              {motivationQuestions.map((q, index) => (
                <div key={index} className="rounded-xl border border-border-light p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-primary/8 text-[11px] font-bold text-primary mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        value={q.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                        placeholder="z.B. Warum interessieren Sie sich für diesen Beruf?"
                        className={inputClass}
                      />
                      <input
                        value={q.placeholder}
                        onChange={(e) => updateQuestion(index, 'placeholder', e.target.value)}
                        placeholder="Platzhalter-Text für den Bewerber (optional)"
                        className={`${inputClass} text-[13px]`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-text-tertiary hover:bg-error-light hover:text-error transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {motivationQuestions.length < 5 && (
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 text-[13px] font-medium text-primary hover:text-primary-dark transition-colors"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Frage hinzufügen
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={updateListing.isPending}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-dark py-3 text-[14px] font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
        >
          {updateListing.isPending ? 'Wird gespeichert...' : 'Speichern'}
        </button>
      </form>
    </div>
  );
}
