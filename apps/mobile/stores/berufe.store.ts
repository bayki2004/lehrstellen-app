import { create } from 'zustand';
import api from '../services/api';
import type { Beruf, BerufMatch } from '../types/beruf.types';
import type { HollandCodes } from '../types/quiz.types';
import { matchBerufe } from '../utils/riasecMatchingEngine';
import { SAMPLE_BERUFE } from '../constants/berufData';

interface BerufeState {
  berufe: Beruf[];
  matches: BerufMatch[];
  isLoading: boolean;
  error: string | null;

  loadBerufe: () => Promise<void>;
  computeMatches: (userProfile: HollandCodes) => void;
}

export const useBerufeStore = create<BerufeState>((set, get) => ({
  berufe: [],
  matches: [],
  isLoading: false,
  error: null,

  loadBerufe: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/berufe');
      const raw = response.data?.data ?? response.data;
      const berufe = Array.isArray(raw) ? raw : [];
      set({ berufe: berufe.length > 0 ? berufe : SAMPLE_BERUFE, isLoading: false });
    } catch {
      set({ berufe: SAMPLE_BERUFE, isLoading: false });
    }
  },

  computeMatches: (userProfile: HollandCodes) => {
    const { berufe } = get();
    const data = berufe.length > 0 ? berufe : SAMPLE_BERUFE;
    const results = matchBerufe(userProfile, data);
    set({ matches: results });
  },
}));
