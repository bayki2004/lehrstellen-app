export type BewerbungStatus =
  | 'sent' | 'viewed' | 'interview_invited' | 'rejected'
  | 'schnupperlehre_scheduled' | 'offer' | 'accepted' | 'withdrawn';

export const BEWERBUNG_STATUS_CONFIG: Record<BewerbungStatus, {
  displayName: string;
  icon: string;
  color: string;
  isActive: boolean;
}> = {
  sent: { displayName: 'Gesendet', icon: '📤', color: '#5A78F2', isActive: true },
  viewed: { displayName: 'Angesehen', icon: '👁️', color: '#FF9500', isActive: true },
  interview_invited: { displayName: 'Einladung', icon: '📅', color: '#34C759', isActive: true },
  rejected: { displayName: 'Abgesagt', icon: '❌', color: '#FF3B30', isActive: false },
  schnupperlehre_scheduled: { displayName: 'Schnupperlehre', icon: '🏢', color: '#AF52DE', isActive: true },
  offer: { displayName: 'Angebot', icon: '⭐', color: '#FBBA02', isActive: true },
  accepted: { displayName: 'Angenommen', icon: '✅', color: '#34C759', isActive: false },
  withdrawn: { displayName: 'Zurückgezogen', icon: '↩️', color: '#AEAEB2', isActive: false },
};

export interface Bewerbung {
  id: string;
  studentId: string;
  listingId: string;
  status: BewerbungStatus;
  sentAt: string;
  viewedAt?: string;
  respondedAt?: string;
  notes?: string;
  // Joined fields
  companyName?: string;
  berufTitle?: string;
  companyLogoUrl?: string;
  canton?: string;
  city?: string;
}

export type BewerbungSegment = 'offen' | 'gesendet' | 'erledigt';

export interface BewerbungListing {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyCanton: string;
  companyCity: string;
  title: string;
  description: string;
  field: string;
  canton: string;
  city: string;
  durationYears: number;
  startDate?: string;
  spotsAvailable: number;
  requiredSchoolLevel?: string;
  requiredLanguages: string[];
  createdAt: string;
}

export interface UnifiedBewerbungItem {
  segment: BewerbungSegment;
  matchId: string;
  listingId: string;
  studentId: string;
  compatibilityScore: number;
  listing: BewerbungListing;
  createdAt: string;
  // Present only for gesendet/erledigt
  applicationId?: string;
  applicationStatus?: string;
  notes?: string;
  timeline?: { status: string; timestamp: string; note?: string }[];
  updatedAt?: string;
  // Bewerbung content fields
  motivationsschreiben?: string;
  verfuegbarkeit?: string;
  relevanteErfahrungen?: string[];
  fragenAnBetrieb?: string;
  schnupperlehreWunsch?: boolean;
  // Student info (company side only)
  studentName?: string;
  studentPhoto?: string;
  studentCanton?: string;
  studentCity?: string;
}
