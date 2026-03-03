'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';
import { useCreateListing } from '@/hooks/use-listings';
import { APPRENTICESHIP_FIELDS, SWISS_CANTONS, INFO_CARD_PRESETS } from '@lehrstellen/shared';
import type { InfoCardType, InfoCard } from '@lehrstellen/shared';
import { toast } from 'sonner';

const inputClass = 'w-full rounded-xl border border-border-light bg-background/50 px-4 py-2.5 text-[14px] text-text outline-none placeholder:text-text-tertiary focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all';
const selectClass = 'w-full rounded-xl border border-border-light bg-background/50 px-4 py-2.5 text-[14px] text-text outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all';
const labelClass = 'mb-1.5 block text-[13px] font-medium text-text';

export default function CreateListingPage() {
  const router = useRouter();
  const createListing = useCreateListing();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [field, setField] = useState<string>(APPRENTICESHIP_FIELDS[0]);
  const [canton, setCanton] = useState<string>('ZH');
  const [city, setCity] = useState('');
  const [requirements, setRequirements] = useState('');
  const [spotsAvailable, setSpotsAvailable] = useState(1);
  const [durationYears, setDurationYears] = useState(3);
  const [activeCards, setActiveCards] = useState<InfoCardType[]>([]);
  const [cardItems, setCardItems] = useState<Record<InfoCardType, string[]>>({
    vorteile: [''],
    anforderungen: [''],
    aufgaben: [''],
    wir_bieten: [''],
  });

  // Motivation questions
  const [motivationQuestions, setMotivationQuestions] = useState<Array<{ question: string; placeholder: string }>>([]);

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

  const toggleCard = (type: InfoCardType) => {
    setActiveCards((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const updateCardItem = (type: InfoCardType, index: number, value: string) => {
    setCardItems((prev) => ({
      ...prev,
      [type]: prev[type].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addCardItem = (type: InfoCardType) => {
    setCardItems((prev) => ({ ...prev, [type]: [...prev[type], ''] }));
  };

  const removeCardItem = (type: InfoCardType, index: number) => {
    setCardItems((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !city.trim()) {
      toast.error('Bitte füllen Sie Titel und Stadt aus');
      return;
    }

    const cards: InfoCard[] = activeCards
      .map((type) => ({
        type,
        title: INFO_CARD_PRESETS[type].title,
        icon: INFO_CARD_PRESETS[type].icon,
        items: cardItems[type].filter((item) => item.trim()),
      }))
      .filter((card) => card.items.length > 0);

    createListing.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        field,
        canton,
        city: city.trim(),
        durationYears,
        spotsAvailable,
        cards,
        motivationQuestions: motivationQuestions
          .filter((q) => q.question.trim())
          .map((q) => ({ question: q.question.trim(), placeholder: q.placeholder.trim() || undefined })),
      },
      {
        onSuccess: () => {
          toast.success('Lehrstelle wurde erstellt!');
          router.push('/stellen');
        },
        onError: () => toast.error('Fehler beim Erstellen'),
      },
    );
  };

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
        <h1 className="text-[22px] font-bold tracking-tight text-text">Neue Lehrstelle</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="rounded-2xl bg-white p-6 shadow-card space-y-5">
          <div>
            <label className={labelClass}>Titel *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Informatiker/in EFZ"
              required
              className={inputClass}
            />
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
              <label className={labelClass}>Stadt *</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="z.B. Zürich"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Was erwartet die Lernenden?"
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className={labelClass}>Anforderungen</label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              placeholder="Eine pro Zeile"
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

        {/* Info cards */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="text-[15px] font-semibold text-text mb-4">Info-Karten</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(INFO_CARD_PRESETS) as InfoCardType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleCard(type)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-150 ${
                  activeCards.includes(type)
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-background text-text-secondary hover:bg-background-secondary'
                }`}
              >
                {INFO_CARD_PRESETS[type].icon} {INFO_CARD_PRESETS[type].title}
              </button>
            ))}
          </div>

          {activeCards.map((type) => (
            <div key={type} className="mt-4 rounded-xl border border-border-light p-4">
              <h3 className="text-[14px] font-medium text-text mb-3">
                {INFO_CARD_PRESETS[type].icon} {INFO_CARD_PRESETS[type].title}
              </h3>
              {cardItems[type].map((item, index) => (
                <div key={index} className="mb-2 flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => updateCardItem(type, index, e.target.value)}
                    placeholder={`Punkt ${index + 1}`}
                    className={`flex-1 ${inputClass}`}
                  />
                  {cardItems[type].length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCardItem(type, index)}
                      className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-xl text-text-tertiary hover:bg-error-light hover:text-error transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addCardItem(type)}
                className="mt-1 text-[13px] font-medium text-primary hover:text-primary-dark transition-colors"
              >
                + Punkt hinzufügen
              </button>
            </div>
          ))}
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
          disabled={createListing.isPending}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-dark py-3 text-[14px] font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
        >
          {createListing.isPending ? 'Wird erstellt...' : 'Lehrstelle erstellen'}
        </button>
      </form>
    </div>
  );
}
