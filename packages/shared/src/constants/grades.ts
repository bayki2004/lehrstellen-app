// Canton-specific Zeugnis subjects (Swiss school report cards)
// Each canton may have different subject names and counts
export const ZEUGNIS_SUBJECTS: Record<string, { key: string; label: string }[]> = {
  ZH: [
    { key: 'mathematik', label: 'Mathematik' },
    { key: 'deutsch', label: 'Deutsch' },
    { key: 'franzoesisch', label: 'Französisch' },
    { key: 'englisch', label: 'Englisch' },
    { key: 'natur_und_technik', label: 'Natur und Technik' },
    { key: 'raum_zeit_gesellschaft', label: 'Räume, Zeiten, Gesellschaften' },
    { key: 'bildnerisches_gestalten', label: 'Bildnerisches Gestalten' },
    { key: 'musik', label: 'Musik' },
    { key: 'sport', label: 'Bewegung und Sport' },
  ],
  BE: [
    { key: 'mathematik', label: 'Mathematik' },
    { key: 'deutsch', label: 'Deutsch' },
    { key: 'franzoesisch', label: 'Französisch' },
    { key: 'englisch', label: 'Englisch' },
    { key: 'natur_mensch_gesellschaft', label: 'Natur, Mensch, Gesellschaft' },
    { key: 'bildnerisches_gestalten', label: 'Bildnerisches Gestalten' },
    { key: 'textiles_technisches_gestalten', label: 'Textiles und Technisches Gestalten' },
    { key: 'musik', label: 'Musik' },
    { key: 'sport', label: 'Bewegung und Sport' },
  ],
  AG: [
    { key: 'mathematik', label: 'Mathematik' },
    { key: 'deutsch', label: 'Deutsch' },
    { key: 'franzoesisch', label: 'Französisch' },
    { key: 'englisch', label: 'Englisch' },
    { key: 'realien', label: 'Realien' },
    { key: 'bildnerisches_gestalten', label: 'Bildnerisches Gestalten' },
    { key: 'musik', label: 'Musik' },
    { key: 'sport', label: 'Sport' },
  ],
  // Fallback for cantons not yet mapped
  DEFAULT: [
    { key: 'mathematik', label: 'Mathematik' },
    { key: 'deutsch', label: 'Deutsch' },
    { key: 'franzoesisch', label: 'Französisch' },
    { key: 'englisch', label: 'Englisch' },
    { key: 'natur_und_technik', label: 'Natur und Technik' },
    { key: 'geschichte', label: 'Geschichte' },
    { key: 'bildnerisches_gestalten', label: 'Bildnerisches Gestalten' },
    { key: 'musik', label: 'Musik' },
    { key: 'sport', label: 'Sport' },
  ],
};

export function getZeugnisSubjects(canton: string) {
  return ZEUGNIS_SUBJECTS[canton] ?? ZEUGNIS_SUBJECTS.DEFAULT;
}

export const MULTICHECK_VARIANTS = [
  'Multicheck ICT',
  'Multicheck Gewerbe',
  'Multicheck Gesundheit & Soziales',
  'Multicheck Kaufmännisch',
  'Multicheck Technisch',
  'Basic-Check',
] as const;

export type MulticheckVariant = (typeof MULTICHECK_VARIANTS)[number];

export const MULTICHECK_SCHULISCHES_WISSEN = [
  { key: 'mathematik', label: 'Mathematik' },
  { key: 'deutsch', label: 'Deutsch' },
  { key: 'franzoesisch', label: 'Französisch' },
  { key: 'englisch', label: 'Englisch' },
] as const;

export const MULTICHECK_POTENZIAL = [
  { key: 'logisches_denken', label: 'Logisches Denken' },
  { key: 'konzentration', label: 'Konzentration' },
  { key: 'merkfaehigkeit', label: 'Merkfähigkeit' },
  { key: 'raeumliches_denken', label: 'Räumliches Denken' },
] as const;

export const NIVEAUS = [
  'Sek A',
  'Sek B',
  'Sek C',
  'Bezirksschule',
  'Realschule',
  'Oberschule',
] as const;

export type Niveau = (typeof NIVEAUS)[number];
