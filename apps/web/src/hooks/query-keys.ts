export const queryKeys = {
  companyProfile: {
    all: ['companyProfile'] as const,
    me: () => ['companyProfile', 'me'] as const,
  },
  listings: {
    all: ['listings'] as const,
    mine: () => ['listings', 'mine'] as const,
    detail: (id: string) => ['listings', 'detail', id] as const,
  },
  applications: {
    all: ['applications'] as const,
    list: () => ['applications', 'list'] as const,
    detail: (id: string) => ['applications', 'detail', id] as const,
  },
  matches: {
    all: ['matches'] as const,
    list: () => ['matches', 'list'] as const,
    detail: (id: string) => ['matches', 'detail', id] as const,
  },
  chat: {
    messages: (matchId: string) => ['chat', matchId, 'messages'] as const,
  },
  culturePresets: {
    all: () => ['culturePresets'] as const,
  },
  dashboard: {
    stats: () => ['dashboard', 'stats'] as const,
  },
};
