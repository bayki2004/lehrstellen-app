'use client';

import { useState } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';
import type { ApplicationDossierDTO } from '@lehrstellen/shared';

const MOCK_DOSSIER: ApplicationDossierDTO = {
  application: {
    id: 'app-001',
    studentId: 'stu-001',
    listingId: 'lst-001',
    matchId: 'match-001',
    status: 'PENDING',
    timeline: [
      { status: 'PENDING', timestamp: '2026-02-15T10:30:00Z' },
    ],
    createdAt: '2026-02-15T10:30:00Z',
    updatedAt: '2026-02-15T10:30:00Z',
    listing: {
      id: 'lst-001',
      companyId: 'comp-001',
      title: 'Informatiker/in EFZ — Applikationsentwicklung',
      description: 'Spannende Lehrstelle in einem innovativen Tech-Unternehmen mit Fokus auf Webentwicklung und Cloud-Lösungen.',
      field: 'Informatik',
      canton: 'ZH',
      city: 'Zürich',
      durationYears: 4,
      spotsAvailable: 2,
      companyName: 'SwissTech Solutions AG',
      companyCanton: 'ZH',
      companyCity: 'Zürich',
      requiredLanguages: ['Deutsch', 'Englisch'],
      createdAt: '2026-01-01T00:00:00Z',
    },
    motivationAnswers: [
      {
        question: 'Warum interessieren Sie sich für eine Lehre in der Informatik?',
        answer: 'Schon als Kind habe ich mich für Computer und Technologie begeistert. In der Primarschule habe ich angefangen, kleine Webseiten zu bauen, und in der Sekundarschule habe ich mein erstes Python-Projekt programmiert — einen einfachen Chatbot für unsere Klasse. Ich möchte diese Leidenschaft zu meinem Beruf machen und die Grundlagen professionell erlernen.',
      },
      {
        question: 'Was war Ihr bisher spannendstes Projekt?',
        answer: 'Ich habe für den Schulverein eine Website mit React erstellt, auf der man Events sehen und sich anmelden kann. Dabei habe ich gelernt, wie Frontend und Backend zusammenarbeiten, und wie wichtig gutes Design für die Benutzerfreundlichkeit ist. Das Projekt wurde von der Schulleitung offiziell übernommen.',
      },
      {
        question: 'Wie stellen Sie sich Ihren idealen Arbeitsalltag vor?',
        answer: 'Ich arbeite gerne im Team und schätze den Austausch mit erfahrenen Entwicklern. Morgens würde ich mich am liebsten in ein Feature vertiefen, nachmittags im Team besprechen und Feedback einarbeiten. Ich freue mich auch auf abwechslungsreiche Aufgaben — mal Backend, mal Frontend.',
      },
    ],
    verfuegbarkeit: 'Ab August 2026, sofort verfügbar. Schulabschluss im Juli 2026.',
    relevanteErfahrungen: [
      'Scratch & Python Grundkurs',
      'Webseite für Schulverein (React)',
      'Robotik-AG (2 Jahre)',
      'Schnupperlehre bei Swisscom',
      'IT-Support in der Familie',
    ],
    fragenAnBetrieb: 'Wie ist das Ausbildungsprogramm strukturiert? Gibt es Möglichkeiten, an realen Kundenprojekten mitzuarbeiten? Werden externe Weiterbildungen unterstützt?',
    schnupperlehreWunsch: true,
  },
  student: {
    firstName: 'Luca',
    lastName: 'Meier',
    dateOfBirth: '2010-05-14',
    canton: 'ZH',
    city: 'Winterthur',
    bio: 'Technikbegeisterter Sekundarschüler mit Leidenschaft für Webentwicklung und Robotik.',
    oceanScores: {
      openness: 82,
      conscientiousness: 71,
      extraversion: 65,
      agreeableness: 78,
      neuroticism: 35,
    },
    riasecScores: {
      realistic: 55,
      investigative: 88,
      artistic: 42,
      social: 60,
      enterprising: 45,
      conventional: 52,
    },
    cultureScores: {
      hierarchyFocus: 30,
      punctualityRigidity: 55,
      resilienceGrit: 60,
      socialEnvironment: 75,
      errorCulture: 35,
      clientFacing: 45,
      digitalAffinity: 90,
      prideFocus: 70,
    },
    desiredFields: ['Informatik', 'Mediamatik'],
    motivationLetter: 'Ich bin ein neugieriger und motivierter Schüler, der sich leidenschaftlich für Technologie und Programmierung interessiert. Seit meinem ersten Kontakt mit dem Computer im Alter von 8 Jahren war ich fasziniert davon, wie Software unsere Welt formt. In meiner Freizeit entwickle ich kleine Apps und Webseiten. Ich suche eine Lehrstelle, in der ich meine Begeisterung mit professionellem Know-how verbinden kann.',
  },
  grades: [
    {
      id: 'grade-zeugnis-1',
      documentType: 'zeugnis',
      entryMethod: 'manual',
      canton: 'ZH',
      niveau: 'Sek A',
      semester: 1,
      schoolYear: '2025/2026',
      grades: {
        mathematik: 5.5,
        deutsch: 5.0,
        franzoesisch: 4.5,
        englisch: 5.5,
        natur_technik: 5.5,
        raum_zeit_gesellschaft: 5.0,
        bildnerisches_gestalten: 4.5,
        musik: 4.0,
        sport: 5.0,
      },
      isVerified: true,
      verifiedAt: '2026-02-01T09:00:00Z',
      createdAt: '2026-01-20T14:00:00Z',
    },
    {
      id: 'grade-multicheck-1',
      documentType: 'multicheck',
      entryMethod: 'manual',
      testVariant: 'Multicheck ICT',
      testDate: '2026-01-15',
      grades: {
        schulisches_wissen: {
          mathematik: 85,
          deutsch: 72,
          franzoesisch: 58,
          englisch: 80,
        },
        potenzial: {
          logisches_denken: 92,
          konzentration: 78,
          merkfaehigkeit: 70,
          raeumliches_denken: 85,
        },
      },
      isVerified: true,
      verifiedAt: '2026-02-01T09:00:00Z',
      createdAt: '2026-01-20T14:00:00Z',
    },
  ],
  compatibility: {
    totalScore: 87,
    breakdown: [
      { label: 'Persoenlichkeit', score: 91, weight: 0.3 },
      { label: 'Interessen', score: 85, weight: 0.25 },
      { label: 'Unternehmenskultur', score: 82, weight: 0.2 },
      { label: 'Berufsfeld', score: 95, weight: 0.15 },
      { label: 'Region', score: 78, weight: 0.1 },
    ],
  },
  companyCulture: {
    hierarchyFocus: 25,
    punctualityRigidity: 50,
    resilienceGrit: 55,
    socialEnvironment: 80,
    errorCulture: 30,
    clientFacing: 50,
    digitalAffinity: 95,
    prideFocus: 75,
  },
};

export default function PdfPreviewPage() {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: DossierDocument } = await import(
        '@/components/pdf/DossierDocument'
      );
      const blob = await pdf(<DossierDocument data={MOCK_DOSSIER} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Bewerbung_Luca_Meier_Informatiker_EFZ.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-[22px] font-bold tracking-tight text-text">
          PDF Vorschau
        </h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          Beispiel-Bewerbungsdossier mit vollständigen Testdaten
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card mb-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-[16px] font-bold text-primary">
            L
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-text">Luca Meier</h2>
            <p className="text-[13px] text-text-secondary">ZH, Winterthur</p>
          </div>
        </div>

        <div className="rounded-xl bg-background p-4 mb-5">
          <p className="text-[13px] font-semibold text-primary mb-1">
            Informatiker/in EFZ — Applikationsentwicklung
          </p>
          <p className="text-[12px] text-text-secondary">
            SwissTech Solutions AG — Zürich
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div>
            <p className="text-text-tertiary text-[11px] font-medium uppercase tracking-wider mb-1">Inhalt Seite 1</p>
            <ul className="space-y-1 text-text-secondary">
              <li>Kandidaten-Header mit Foto</li>
              <li>Lehrstellen-Info</li>
              <li>Motivationsschreiben</li>
              <li>3 Motivationsfragen & Antworten</li>
              <li>Verfügbarkeit</li>
              <li>5 relevante Erfahrungen</li>
              <li>Fragen an den Betrieb</li>
              <li>Schnupperlehre-Wunsch</li>
            </ul>
          </div>
          <div>
            <p className="text-text-tertiary text-[11px] font-medium uppercase tracking-wider mb-1">Inhalt Seite 2</p>
            <ul className="space-y-1 text-text-secondary">
              <li>Kompatibilitäts-Score (87%)</li>
              <li>5 Score-Breakdown-Balken</li>
              <li>Kultur-Radar-Chart</li>
              <li>Zeugnis Sek A (9 Fächer)</li>
              <li>Multicheck ICT (8 Kategorien)</li>
            </ul>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={generating}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark py-3 text-[14px] font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            PDF wird generiert...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Beispiel-Dossier herunterladen
          </>
        )}
      </button>
    </div>
  );
}
