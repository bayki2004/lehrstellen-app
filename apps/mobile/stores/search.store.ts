import { create } from 'zustand';
import api from '../services/api';
import type { ListingDTO } from '@lehrstellen/shared';
import type { Beruf, Berufsschule } from '../types/beruf.types';
import { SAMPLE_BERUFE } from '../constants/berufData';

export type SearchTab = 'lehrstellen' | 'berufe' | 'berufsschulen';

interface SearchState {
  activeTab: SearchTab;
  query: string;
  selectedCantons: string[];

  // Lehrstellen results
  lehrstellen: ListingDTO[];
  lehrstellenLoading: boolean;

  // Berufe results
  berufe: Beruf[];
  berufeLoading: boolean;

  // Berufsschulen results
  schulen: Berufsschule[];
  schulenLoading: boolean;

  setTab: (tab: SearchTab) => void;
  setQuery: (query: string) => void;
  toggleCanton: (code: string) => void;
  searchLehrstellen: () => Promise<void>;
  searchBerufe: () => Promise<void>;
  searchSchulen: () => Promise<void>;
  search: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  activeTab: 'lehrstellen',
  query: '',
  selectedCantons: [],

  lehrstellen: [],
  lehrstellenLoading: false,

  berufe: [],
  berufeLoading: false,

  schulen: [],
  schulenLoading: false,

  setTab: (tab) => set({ activeTab: tab }),

  setQuery: (query) => set({ query }),

  toggleCanton: (code) => {
    const { selectedCantons } = get();
    if (selectedCantons.includes(code)) {
      set({ selectedCantons: selectedCantons.filter((c) => c !== code) });
    } else {
      set({ selectedCantons: [...selectedCantons, code] });
    }
  },

  searchLehrstellen: async () => {
    const { query, selectedCantons } = get();
    set({ lehrstellenLoading: true });
    try {
      const params = new URLSearchParams();
      // Send first selected canton as API filter (API supports single canton)
      if (selectedCantons.length === 1) {
        params.append('canton', selectedCantons[0]);
      }
      const url = `/listings${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<{ data: ListingDTO[] }>(url);
      let listings = response.data.data || (response.data as any);
      if (!Array.isArray(listings)) listings = [];

      // Client-side canton filter for multi-canton selection
      if (selectedCantons.length > 1) {
        listings = listings.filter((l: ListingDTO) =>
          selectedCantons.includes(l.canton),
        );
      }

      // Client-side text filter
      if (query.trim()) {
        const q = query.toLowerCase();
        listings = listings.filter(
          (l: ListingDTO) =>
            l.title.toLowerCase().includes(q) ||
            l.description?.toLowerCase().includes(q) ||
            l.companyName?.toLowerCase().includes(q) ||
            l.field?.toLowerCase().includes(q),
        );
      }

      set({ lehrstellen: listings, lehrstellenLoading: false });
    } catch {
      set({ lehrstellen: [], lehrstellenLoading: false });
    }
  },

  searchBerufe: async () => {
    const { query } = get();
    set({ berufeLoading: true });
    try {
      let berufe: Beruf[] = [];

      // Try fetching from API first
      try {
        const response = await api.get('/berufe');
        const raw = (response.data as any)?.data ?? response.data;
        berufe = Array.isArray(raw) ? raw : [];
      } catch {
        // API failed, fall through to fallback
      }

      // Fall back to sample data if API returns empty or fails
      if (berufe.length === 0) {
        berufe = [...SAMPLE_BERUFE];
      }

      // Client-side text filter
      if (query.trim()) {
        const q = query.toLowerCase();
        berufe = berufe.filter(
          (b) =>
            b.nameDe.toLowerCase().includes(q) ||
            b.field?.toLowerCase().includes(q) ||
            b.descriptionDe?.toLowerCase().includes(q) ||
            b.educationType?.toLowerCase().includes(q),
        );
      }

      set({ berufe, berufeLoading: false });
    } catch {
      set({ berufe: [], berufeLoading: false });
    }
  },

  searchSchulen: async () => {
    const { query, selectedCantons } = get();
    set({ schulenLoading: true });
    try {
      const response = await api.get<Berufsschule[]>('/berufsschulen');
      let schulen = Array.isArray(response.data) ? response.data : [];

      // Canton filter
      if (selectedCantons.length > 0) {
        schulen = schulen.filter((s) => selectedCantons.includes(s.canton));
      }

      // Text filter
      if (query.trim()) {
        const q = query.toLowerCase();
        schulen = schulen.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.city.toLowerCase().includes(q) ||
            s.canton.toLowerCase().includes(q) ||
            s.specializations?.some((sp) => sp.toLowerCase().includes(q)),
        );
      }

      set({ schulen, schulenLoading: false });
    } catch {
      set({ schulen: [], schulenLoading: false });
    }
  },

  search: async () => {
    const { activeTab, searchLehrstellen, searchBerufe, searchSchulen } = get();
    switch (activeTab) {
      case 'lehrstellen':
        return searchLehrstellen();
      case 'berufe':
        return searchBerufe();
      case 'berufsschulen':
        return searchSchulen();
    }
  },
}));
