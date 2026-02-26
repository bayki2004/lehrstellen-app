import { create } from 'zustand';
import api from '../services/api';
import type { ListingDTO } from '@lehrstellen/shared';
import type { Berufsschule } from '../types/beruf.types';
import { MAP_CATEGORIES } from '../constants/mapCategories';
import { CANTON_COORDINATES } from '../constants/cantonCoordinates';

// ── Sample fallback data ────────────────────────────────────────────
const SAMPLE_LISTINGS: ListingDTO[] = [
  {
    id: 'sample-1',
    companyId: 'c1',
    companyName: 'Swisscom AG',
    companyCanton: 'BE',
    companyCity: 'Bern',
    title: 'Informatiker/in EFZ',
    description: 'Lerne die Welt der IT kennen.',
    field: 'Informatik',
    canton: 'BE',
    city: 'Bern',
    durationYears: 4,
    spotsAvailable: 2,
    requiredLanguages: ['Deutsch'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    companyId: 'c2',
    companyName: 'Inselspital',
    companyCanton: 'BE',
    companyCity: 'Bern',
    title: 'Fachfrau/-mann Gesundheit EFZ',
    description: 'Starte deine Karriere im Gesundheitswesen.',
    field: 'Gesundheit',
    canton: 'BE',
    city: 'Bern',
    durationYears: 3,
    spotsAvailable: 5,
    requiredLanguages: ['Deutsch'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    companyId: 'c3',
    companyName: 'UBS',
    companyCanton: 'ZH',
    companyCity: 'Zürich',
    title: 'Kaufmann/-frau EFZ',
    description: 'Kaufmännische Lehre bei der UBS.',
    field: 'Kaufmännisch',
    canton: 'ZH',
    city: 'Zürich',
    durationYears: 3,
    spotsAvailable: 10,
    requiredLanguages: ['Deutsch', 'Englisch'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    companyId: 'c4',
    companyName: 'SBB',
    companyCanton: 'AG',
    companyCity: 'Olten',
    title: 'Logistiker/in EFZ',
    description: 'Logistik bei der SBB.',
    field: 'Logistik',
    canton: 'AG',
    city: 'Olten',
    durationYears: 3,
    spotsAvailable: 3,
    requiredLanguages: ['Deutsch'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-5',
    companyId: 'c5',
    companyName: 'Migros',
    companyCanton: 'ZH',
    companyCity: 'Zürich',
    title: 'Detailhandelsfachmann/-frau EFZ',
    description: 'Detailhandel bei der Migros.',
    field: 'Detailhandel',
    canton: 'ZH',
    city: 'Zürich',
    durationYears: 3,
    spotsAvailable: 8,
    requiredLanguages: ['Deutsch'],
    createdAt: new Date().toISOString(),
  },
];

const SAMPLE_SCHOOLS: Berufsschule[] = [
  {
    id: 'school-1',
    name: 'Gewerblich-Industrielle Berufsschule Bern',
    city: 'Bern',
    canton: 'BE',
    address: 'Lorrainestrasse 1, 3013 Bern',
    website: 'https://www.gibb.ch',
    lat: 46.955,
    lng: 7.44,
    specializations: ['Informatik', 'Technik'],
  },
  {
    id: 'school-2',
    name: 'Berufsbildungszentrum Zürich',
    city: 'Zürich',
    canton: 'ZH',
    address: 'Ausstellungsstrasse 70, 8005 Zürich',
    website: 'https://www.bbzh.ch',
    lat: 47.388,
    lng: 8.532,
    specializations: ['Kaufmännisch', 'Detailhandel'],
  },
  {
    id: 'school-3',
    name: 'Berufsfachschule Gesundheit',
    city: 'Bern',
    canton: 'BE',
    address: 'Murtenstrasse 20, 3008 Bern',
    lat: 46.943,
    lng: 7.425,
    specializations: ['Gesundheit', 'Soziales'],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────

/** Produce a coordinate for a listing (canton center + small random offset). */
export function getListingCoordinate(listing: ListingDTO) {
  const canton = listing.canton?.toUpperCase();
  const coords = CANTON_COORDINATES[canton];
  if (!coords) return null;
  const offset = () => (Math.random() - 0.5) * 0.02;
  return {
    latitude: coords.latitude + offset(),
    longitude: coords.longitude + offset(),
  };
}

/** Produce a coordinate for a school. */
export function getSchoolCoordinate(school: Berufsschule) {
  if (school.lat && school.lng) {
    return { latitude: school.lat, longitude: school.lng };
  }
  const canton = school.canton?.toUpperCase();
  const coords = CANTON_COORDINATES[canton];
  if (!coords) return null;
  const offset = () => (Math.random() - 0.5) * 0.015;
  return {
    latitude: coords.latitude + offset(),
    longitude: coords.longitude + offset(),
  };
}

// ── Store ───────────────────────────────────────────────────────────

interface MapState {
  listings: ListingDTO[];
  schools: Berufsschule[];
  selectedCategories: string[];
  showSchools: boolean;
  radiusKm: number;
  selectedListing: ListingDTO | null;
  selectedSchool: Berufsschule | null;
  isLoading: boolean;
  lastLoadedAt: number | null;

  // Derived
  filteredListings: () => ListingDTO[];

  // Actions
  loadMapData: () => Promise<void>;
  toggleCategory: (category: string) => void;
  toggleSchools: () => void;
  setRadius: (km: number) => void;
  selectListing: (listing: ListingDTO | null) => void;
  selectSchool: (school: Berufsschule | null) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  listings: [],
  schools: [],
  selectedCategories: MAP_CATEGORIES.map((c) => c.key), // all selected by default
  showSchools: false,
  radiusKm: 25,
  selectedListing: null,
  selectedSchool: null,
  isLoading: false,
  lastLoadedAt: null,

  filteredListings: () => {
    const { listings, selectedCategories } = get();
    if (selectedCategories.length === 0) return listings;
    return listings.filter((l) => selectedCategories.includes(l.field));
  },

  loadMapData: async () => {
    const { lastLoadedAt, listings } = get();
    if (lastLoadedAt && listings.length > 0 && Date.now() - lastLoadedAt < 5 * 60 * 1000) {
      return; // Use cached data
    }
    set({ isLoading: true });
    let listingsData: ListingDTO[] = [];
    let schoolsData: Berufsschule[] = [];

    // Fetch listings
    try {
      const res = await api.get('/listings');
      const raw = (res.data as any).data || res.data;
      listingsData = Array.isArray(raw) ? raw : [];
    } catch {
      // fallback
      listingsData = SAMPLE_LISTINGS;
    }

    // Fetch schools
    try {
      const res = await api.get('/berufsschulen');
      const raw = (res.data as any).data || res.data;
      schoolsData = Array.isArray(raw) ? raw : [];
    } catch {
      // fallback
      schoolsData = SAMPLE_SCHOOLS;
    }

    // If API returned empty, use samples
    if (listingsData.length === 0) listingsData = SAMPLE_LISTINGS;
    if (schoolsData.length === 0) schoolsData = SAMPLE_SCHOOLS;

    set({ listings: listingsData, schools: schoolsData, isLoading: false, lastLoadedAt: Date.now() });
  },

  toggleCategory: (category: string) => {
    set((state) => {
      const selected = state.selectedCategories;
      const isSelected = selected.includes(category);
      return {
        selectedCategories: isSelected
          ? selected.filter((c) => c !== category)
          : [...selected, category],
      };
    });
  },

  toggleSchools: () => {
    set((state) => ({ showSchools: !state.showSchools }));
  },

  setRadius: (km: number) => {
    set({ radiusKm: km });
  },

  selectListing: (listing: ListingDTO | null) => {
    set({ selectedListing: listing, selectedSchool: null });
  },

  selectSchool: (school: Berufsschule | null) => {
    set({ selectedSchool: school, selectedListing: null });
  },
}));
