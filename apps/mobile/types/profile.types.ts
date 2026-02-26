export interface School {
  id: string;
  name: string;
  level: string;
  startYear: number;
  endYear?: number;
  isCurrent: boolean;
}

export type LanguageProficiency = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2' | 'native';

export const LANGUAGE_PROFICIENCY_CONFIG: Record<LanguageProficiency, string> = {
  a1: 'A1 - Anfänger',
  a2: 'A2 - Grundlagen',
  b1: 'B1 - Mittelstufe',
  b2: 'B2 - Gute Mittelstufe',
  c1: 'C1 - Fortgeschritten',
  c2: 'C2 - Annähernd muttersprachlich',
  native: 'Muttersprache',
};

export interface Language {
  id: string;
  name: string;
  proficiency: LanguageProficiency;
}

export interface Reference {
  id: string;
  name: string;
  role: string;
  organization: string;
  email?: string;
  phone?: string;
}

export interface SchnupperlehreEntry {
  id: string;
  companyName: string;
  beruf: string;
  canton: string;
  date: string;
  notes?: string;
}

export interface Zeugnis {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url?: string;
  uploadedAt: string;
}

export type ProfileBuilderStep =
  | 'personalInfo'
  | 'motivationVideo'
  | 'motivationLetter'
  | 'education'
  | 'experience'
  | 'skillsLanguages'
  | 'documents';

export const PROFILE_BUILDER_STEPS: { key: ProfileBuilderStep; title: string; subtitle: string }[] = [
  { key: 'personalInfo', title: 'Persönliche Angaben', subtitle: 'Name, Geburtsdatum, Wohnort' },
  { key: 'motivationVideo', title: 'Motivationsvideo', subtitle: '30-60 Sekunden über dich' },
  { key: 'motivationLetter', title: 'Motivationsschreiben', subtitle: 'Warum diese Lehrstelle?' },
  { key: 'education', title: 'Bildung', subtitle: 'Deine Schulen und Abschlüsse' },
  { key: 'experience', title: 'Erfahrung', subtitle: 'Schnupperlehren und Praktika' },
  { key: 'skillsLanguages', title: 'Skills & Sprachen', subtitle: 'Was du kannst' },
  { key: 'documents', title: 'Dokumente', subtitle: 'Zeugnisse und Lebenslauf' },
];
