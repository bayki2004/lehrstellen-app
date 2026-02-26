export interface Beruf {
  code: string;
  nameDe: string;
  field?: string;
  educationType?: string;
  durationYears?: number;
  descriptionDe?: string;
  personalityFit?: Record<string, number>;
  hollandCode?: string;
  bbId?: string;
  anforderungMathematik?: number;
  anforderungSchulsprache?: number;
  anforderungNaturwissenschaften?: number;
  anforderungFremdsprachen?: number;
  lohnLehrjahre?: number[];
}

export interface LehrstelleForBeruf {
  id: string;
  title: string;
  companyName: string;
  city: string;
  canton: string;
  positionsAvailable: number;
}

export interface ScrapedBerufData {
  description?: string;
  requirements?: string[];
  careerPaths?: string[];
  relatedProfessions?: string[];
  duration?: string;
  scrapedAt: string;
}

export interface BerufDetail extends Beruf {
  scraped?: ScrapedBerufData | null;
}

export interface FieldCount {
  field: string;
  count: number;
}

export interface Berufsschule {
  id: string;
  name: string;
  city: string;
  canton: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  lat?: number;
  lng?: number;
  institutionalStatus?: string;
  specializations?: string[];
}

export interface ScrapedSchoolData {
  about?: string;
  programs?: string[];
  contact?: { email?: string; phone?: string };
  scrapedAt: string;
}

export interface BerufsschuleDetail extends Berufsschule {
  postalCode?: string;
  scraped?: ScrapedSchoolData | null;
}

export interface CantonCount {
  canton: string;
  count: number;
}

export interface BerufMatch {
  beruf: Beruf;
  matchPercentage: number;
  sharedDimensions: SharedDimension[];
}

export interface SharedDimension {
  key: string;
  label: string;
  userScore: number;
  berufScore: number;
}
