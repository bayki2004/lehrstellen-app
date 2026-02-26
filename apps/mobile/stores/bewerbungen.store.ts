import { create } from 'zustand';
import api from '../services/api';
import type { BewerbungSegment, UnifiedBewerbungItem } from '../types/bewerbung.types';

interface BewerbungenState {
  bewerbungen: UnifiedBewerbungItem[];
  isLoading: boolean;
  error: string | null;
  activeSegment: BewerbungSegment;

  fetchBewerbungen: () => Promise<void>;
  setSegment: (segment: BewerbungSegment) => void;
  applyToMatch: (matchId: string) => Promise<void>;
  withdrawBewerbung: (applicationId: string) => Promise<void>;
  filteredBewerbungen: () => UnifiedBewerbungItem[];
}

export const useBewerbungenStore = create<BewerbungenState>((set, get) => ({
  bewerbungen: [],
  isLoading: false,
  error: null,
  activeSegment: 'offen',

  fetchBewerbungen: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ data: UnifiedBewerbungItem[] }>('/applications');
      const raw = response.data;
      const list = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) ? (raw as any).data : [];
      set({ bewerbungen: list, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.message || 'Bewerbungen konnten nicht geladen werden' });
    }
  },

  setSegment: (segment: BewerbungSegment) => set({ activeSegment: segment }),

  applyToMatch: async (matchId: string) => {
    try {
      await api.post('/applications', { matchId });
      // Refresh the list to get the updated segments
      await get().fetchBewerbungen();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Bewerbung konnte nicht gesendet werden' });
    }
  },

  withdrawBewerbung: async (applicationId: string) => {
    const original = get().bewerbungen;
    // Optimistic update: move item to erledigt
    set({
      bewerbungen: original.map((b) =>
        b.applicationId === applicationId
          ? { ...b, segment: 'erledigt' as BewerbungSegment, applicationStatus: 'WITHDRAWN' }
          : b
      ),
    });
    try {
      await api.put(`/applications/${applicationId}/status`, { status: 'WITHDRAWN' });
    } catch (error: any) {
      set({ bewerbungen: original, error: error.response?.data?.message || 'Fehler beim Zurückziehen' });
    }
  },

  filteredBewerbungen: () => {
    const { bewerbungen, activeSegment } = get();
    return bewerbungen.filter((b) => b.segment === activeSegment);
  },
}));
