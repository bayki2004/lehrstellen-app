export const queryKeys = {
  feed: {
    all: ['feed'] as const,
    list: () => ['feed', 'list'] as const,
  },
  bewerbungen: {
    all: ['bewerbungen'] as const,
    list: () => ['bewerbungen', 'list'] as const,
  },
  berufe: {
    all: ['berufe'] as const,
    list: (filters?: Record<string, string>) => ['berufe', 'list', filters] as const,
    fields: () => ['berufe', 'fields'] as const,
    matches: () => ['berufe', 'matches'] as const,
    detail: (code: string) => ['berufe', 'detail', code] as const,
    favorites: () => ['berufe', 'favorites'] as const,
  },
  listings: {
    all: ['listings'] as const,
    list: (filters?: { query?: string; cantons?: string[] }) =>
      ['listings', 'list', filters] as const,
    detail: (id: string) => ['listings', 'detail', id] as const,
  },
  schulen: {
    all: ['schulen'] as const,
    list: (filters?: { query?: string; cantons?: string[] }) =>
      ['schulen', 'list', filters] as const,
    detail: (id: string) => ['schulen', 'detail', id] as const,
  },
  commute: {
    all: ['commute'] as const,
    route: (fromCity: string, fromCanton: string, toCity: string, toCanton: string) =>
      ['commute', fromCity, fromCanton, toCity, toCanton] as const,
  },
};
