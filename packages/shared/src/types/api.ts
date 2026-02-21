// ============================================
// AUTH
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'STUDENT' | 'COMPANY';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: 'STUDENT' | 'COMPANY' | 'ADMIN';
    hasProfile: boolean;
    hasCompletedQuiz: boolean;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ============================================
// STUDENT PROFILE
// ============================================

export interface StudentProfileDTO {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  canton: string;
  city: string;
  bio?: string;
  profilePhoto?: string;
  oceanScores: OceanScores;
  riasecScores: RiasecScores;
  quizCompleted: boolean;
  desiredFields: string[];
}

export interface UpdateStudentProfileRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  canton?: string;
  city?: string;
  bio?: string;
  desiredFields?: string[];
}

export interface OceanScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface RiasecScores {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

// ============================================
// COMPANY PROFILE
// ============================================

export interface CompanyPhotoDTO {
  id: string;
  url: string;
  caption?: string;
  sortOrder: number;
}

export interface CompanyLinkDTO {
  id: string;
  label: string;
  url: string;
  sortOrder: number;
}

export interface CompanyProfileDTO {
  id: string;
  companyName: string;
  description: string;
  industry: string;
  companySize: string;
  website?: string;
  logoUrl?: string;
  videoUrl?: string;
  canton: string;
  city: string;
  address?: string;
  contactPersonName: string;
  contactPersonRole?: string;
  isVerified: boolean;
  listingsCount?: number;
  photos: CompanyPhotoDTO[];
  links: CompanyLinkDTO[];
  listings?: ListingDTO[];
}

export interface UpdateCompanyProfileRequest {
  companyName?: string;
  description?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  videoUrl?: string | null;
  canton?: string;
  city?: string;
  address?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  links?: { label: string; url: string }[];
}

// ============================================
// LISTINGS
// ============================================

export interface ListingDTO {
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

export interface ListingWithScoreDTO extends ListingDTO {
  compatibilityScore: number;
  scoreBreakdown: ScoreBreakdown[];
}

export interface ScoreBreakdown {
  label: string;
  score: number;
  weight: number;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  field: string;
  berufsfeld?: string;
  requiredSchoolLevel?: string;
  requiredLanguages?: string[];
  startDate?: string;
  durationYears?: number;
  spotsAvailable?: number;
  canton: string;
  city: string;
  idealOceanOpenness?: number;
  idealOceanConscientiousness?: number;
  idealOceanExtraversion?: number;
  idealOceanAgreeableness?: number;
  idealOceanNeuroticism?: number;
  idealRiasecRealistic?: number;
  idealRiasecInvestigative?: number;
  idealRiasecArtistic?: number;
  idealRiasecSocial?: number;
  idealRiasecEnterprising?: number;
  idealRiasecConventional?: number;
}

// ============================================
// SWIPES
// ============================================

export interface SwipeRequest {
  listingId: string;
  direction: 'LEFT' | 'RIGHT' | 'SUPER';
}

export interface SwipeResponse {
  isMatch: boolean;
  matchId?: string;
  compatibilityScore?: number;
}

// ============================================
// MATCHES
// ============================================

export interface MatchDTO {
  id: string;
  studentId: string;
  listingId: string;
  compatibilityScore: number;
  status: string;
  createdAt: string;
  listing: ListingDTO;
  student?: StudentProfileDTO;
  lastMessage?: MessageDTO;
  unreadCount: number;
}

// ============================================
// MESSAGES
// ============================================

export interface MessageDTO {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE';
}

// ============================================
// APPLICATIONS
// ============================================

export interface ApplicationDTO {
  id: string;
  studentId: string;
  listingId: string;
  matchId: string;
  status: string;
  notes?: string;
  timeline: ApplicationTimelineEntry[];
  createdAt: string;
  updatedAt: string;
  listing: ListingDTO;
}

export interface ApplicationTimelineEntry {
  status: string;
  timestamp: string;
  note?: string;
}

export interface UpdateApplicationStatusRequest {
  status: string;
  note?: string;
}

// ============================================
// WEBSOCKET EVENTS
// ============================================

export interface WsClientEvents {
  'join-match': { matchId: string };
  'leave-match': { matchId: string };
  'send-message': { matchId: string; content: string; type?: string };
  'mark-read': { matchId: string };
  'typing-start': { matchId: string };
  'typing-stop': { matchId: string };
}

export interface WsServerEvents {
  'new-message': MessageDTO;
  'message-read': { matchId: string; readBy: string };
  'typing': { matchId: string; userId: string; isTyping: boolean };
  'match-created': { matchId: string; listing: ListingDTO };
}

// ============================================
// PAGINATION
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================
// API ERROR
// ============================================

export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}
