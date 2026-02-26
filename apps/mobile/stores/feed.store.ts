import { create } from 'zustand';
import api from '../services/api';
import type { ListingWithScoreDTO, SwipeResponse } from '@lehrstellen/shared';

interface FeedState {
  cards: ListingWithScoreDTO[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  lastMatch: SwipeResponse | null;
  lastFetchedAt: number | null;
  feedMode: 'matching' | 'explore';

  fetchFeed: () => Promise<void>;
  swipe: (direction: 'LEFT' | 'RIGHT', listingId: string) => Promise<SwipeResponse>;
  nextCard: () => void;
  clearMatch: () => void;
  setFeedMode: (mode: 'matching' | 'explore') => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  cards: [],
  currentIndex: 0,
  isLoading: false,
  error: null,
  lastMatch: null,
  lastFetchedAt: null,
  feedMode: 'matching',

  fetchFeed: async () => {
    const { lastFetchedAt, cards } = get();
    if (lastFetchedAt && cards.length > 0 && Date.now() - lastFetchedAt < 5 * 60 * 1000) {
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ data: ListingWithScoreDTO[] }>('/swipes/feed');
      const raw = response.data;
      const feed = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) ? (raw as any).data : [];
      set({
        cards: feed,
        currentIndex: 0,
        isLoading: false,
        lastFetchedAt: Date.now(),
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Feed konnte nicht geladen werden';
      set({ isLoading: false, error: message });
    }
  },

  swipe: async (direction: 'LEFT' | 'RIGHT', listingId: string) => {
    try {
      const response = await api.post<SwipeResponse>('/swipes/', {
        listingId,
        direction,
      });

      if (response.data.isMatch) {
        set({ lastMatch: response.data });
      }

      return response.data;
    } catch (error: any) {
      console.error('Swipe error:', error);
      throw error;
    }
  },

  nextCard: () => {
    set((state) => ({
      currentIndex: state.currentIndex + 1,
    }));
  },

  clearMatch: () => set({ lastMatch: null }),

  setFeedMode: (mode: 'matching' | 'explore') => set({ feedMode: mode }),
}));
