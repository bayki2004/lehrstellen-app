import { create } from 'zustand';
import api from '../services/api';
import type { ListingWithScoreDTO, SwipeResponse } from '@lehrstellen/shared';

interface FeedState {
  cards: ListingWithScoreDTO[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  lastMatch: SwipeResponse | null;

  fetchFeed: () => Promise<void>;
  swipe: (direction: 'LEFT' | 'RIGHT', listingId: string) => Promise<SwipeResponse>;
  nextCard: () => void;
  clearMatch: () => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  cards: [],
  currentIndex: 0,
  isLoading: false,
  error: null,
  lastMatch: null,

  fetchFeed: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ListingWithScoreDTO[]>('/feed');
      set({
        cards: response.data,
        currentIndex: 0,
        isLoading: false,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Feed konnte nicht geladen werden';
      set({ isLoading: false, error: message });
    }
  },

  swipe: async (direction: 'LEFT' | 'RIGHT', listingId: string) => {
    try {
      const response = await api.post<SwipeResponse>('/swipes', {
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
}));
