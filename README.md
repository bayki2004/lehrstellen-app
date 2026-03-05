# LehrMatch — Lehrstellen App

Cross-platform mobile app (React Native Expo + SwiftUI) and company web dashboard that matches Swiss students with Lehrstellen (apprenticeships) based on personality profiles — like Tinder, but for careers.

## Architecture Overview

This project combines three frontends and a unified backend:

| Layer | Student Side | Company Side |
|-------|-------------|--------------|
| **Frontend** | React Native Expo (iOS/Android) + SwiftUI (iOS) | React Native Expo (iOS/Android) + Next.js Web Dashboard |
| **Backend** | Express.js + Prisma ORM + Supabase | Express.js + Prisma ORM |
| **Database** | PostgreSQL (Supabase) | Same PostgreSQL via Prisma |
| **Auth** | JWT (Express middleware) + Supabase Auth | JWT (Express middleware) |
| **Real-time** | Socket.io | Socket.io |
| **State** | Zustand + React Query (TanStack v5) | Zustand + React Query |

### Branch History

- **main** — Merged from Rashad (student SwiftUI) + Kaan (company Express backend)
- **V_3** — React Native Expo mobile app, unified Express API, dual data sources (Prisma + Supabase), deep bug fixes, filter overhaul
- **V_4** — Current: Company Web Dashboard, mobile feature parity, culture dimensions, stability hardening, demo seed data

**Data model source of truth:** Prisma schema (`packages/database/prisma/schema.prisma`)

---

## Current Version: V_4

### What's New in V_4

- **Company Web Dashboard** — Full Next.js 14 web app for companies: dashboard, listings CRUD, applicant management, chat, profile editor, PDF dossier generation
- **Mobile Company Feature Parity** — Edit & delete listings, motivation questions (0-5 per listing), PDF dossier download via expo-print + expo-sharing
- **Culture Dimensions** — 8-dimension culture slider (Innovation, Teamwork, Work-Life-Balance, etc.) with radar chart comparison between student and company profiles
- **Company Culture Onboarding** — Culture preset selection and slider-based profile customisation during company onboarding
- **Student Grades Tracking** — Zeugnis (school grades) and Multicheck entry with subject-level detail
- **Motivation Questions** — Companies can add custom questions to listings; students answer during application
- **Vibe Check** — New onboarding step for personality matching
- **Glassmorphism Navigation** — Floating tab bar with blur effect and dynamic island style on both student and company mobile sections
- **5 Swipes Per Day Limit** — Daily swipe cap with reset at midnight
- **Database Consolidation** — All tables (Beruf, Lehrstelle, ImportedCompany, Berufsschule, StudentFavoriteBeruf) now managed via Prisma schema; Supabase SQL migrations seed reference data, Prisma owns the schema
- **Stability Hardening** — Zod validation on swipe/application endpoints, atomic transactions for swipe+match creation, ErrorBoundary crash recovery in mobile app, error states in chat screens, improved API logging
- **Investor Demo Seed Data** — 7 realistic applications across all 3 companies with full pipeline statuses (PENDING → VIEWED → SHORTLISTED → INTERVIEW_SCHEDULED → ACCEPTED/REJECTED), chat messages, grades, and authentic Swiss-German motivation answers
- **Setup Script** — Single `bash scripts/setup-db.sh` handles full environment setup (dependencies, Supabase, migrations, Prisma, seed) with automatic cleanup of stale DB functions
- **Bug Fixes** — Presets.map error, API response unwrapping, tab bar overlap, safe area padding, feed filters, Expo stdin passthrough for dev:mobile

### What Was New in V_3

- **React Native Expo App** — Full cross-platform mobile app (iOS/Android) alongside the original SwiftUI codebase
- **Dual Data Sources** — Swipe feed merges Prisma `listings` (company-created) and Supabase `lehrstellen` (scraped/imported apprenticeships)
- **Proxy Listings** — Swiping on a Supabase lehrstelle auto-creates a proxy in the Prisma `listings` table via `ensureLehrstelleProxy()`
- **Berufe & Berufsschulen API** — New Express endpoints for professions (with RIASEC data, salary, requirements) and vocational schools
- **Filter Overhaul** — Reworked feed filters with canton, category, and education type support
- **Scraper Service** — Backend service for importing lehrstellen from external sources
- **Info Cards** — Contextual info cards in the feed for onboarding and engagement
- **Enriched Seed Data** — Expanded berufe with Anforderungen & Lohn data, more berufsschulen and companies

---

## Student Features

- **Personality Quiz** — "Build Your Day" 3-phase quiz (26 questions, RIASEC scoring, gamification)
- **Swipe Feed** — Discover Lehrstellen with compatibility scores, swipe deck with animated cards, 5 swipes/day limit
- **Map View** — Interactive map with pins for Lehrstellen and Berufsschulen, filter bar, preview sheets
- **Search** — Lehrstellen, Berufe, and Berufsschulen tabs with detail views
- **Passende Berufe** — RIASEC-based career matching with radar chart comparison
- **Bewerbungen** — Application tracking: prepare, send, track status (offen -> gesendet -> accepted/rejected)
- **Profile Builder** — 6-step builder: personal info, education, experience, skills/languages, documents, motivation video
- **Grades** — Zeugnis and Multicheck grade entry and tracking
- **Chat** — Messaging with matched companies (after application accepted)
- **Commute Info** — Travel time and distance to lehrstellen shown on cards

## Company Features (Mobile)

- **Dashboard** — KPIs: total listings, active listings, applications, pending count
- **Listings Management** — Create, edit, delete Lehrstellen with ideal personality profiles (OCEAN + RIASEC) and motivation questions
- **Applicant Management** — View incoming applications, compatibility scores, update status (shortlist, interview, accept/reject)
- **PDF Dossier** — Download applicant dossier as PDF (student info, grades, compatibility chart, culture radar)
- **Company Profile** — Edit description, culture dimensions, photo gallery, video, links, contact details
- **Company Onboarding** — Culture presets, culture sliders, profile setup flow during first login
- **Chat** — Messaging with matched students
- **Glassmorphism Nav** — Floating tab bar matching student section design

## Company Features (Web Dashboard)

- **Dashboard** — KPI overview with quick navigation
- **Stellen (Listings)** — Full CRUD for apprenticeship listings with motivation questions
- **Bewerber (Applicants)** — Application management with status tabs (Eingegangen/Erledigt), compatibility scores
- **PDF Dossier** — Generate and preview applicant dossiers with React-PDF
- **Chat** — Real-time messaging with accepted applicants via Socket.io
- **Profil** — Company profile editor with culture dimensions
- **Sidebar Navigation** — Clean dashboard layout with Radix UI components

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Mobile App** | React Native, Expo SDK 54, expo-router v6, TypeScript |
| **Web Dashboard** | Next.js 14, React 18, Tailwind CSS 3.4, Radix UI, React Hook Form + Zod |
| **iOS App (Legacy)** | SwiftUI, iOS 17+, MVVM with `@Observable` |
| **State Management** | Zustand (stores) + React Query / TanStack v5 (server state) |
| **Backend API** | Express.js, TypeScript, Prisma ORM, JWT, Socket.io |
| **Database** | PostgreSQL (Supabase), accessed via both Prisma ORM and Supabase PostgREST |
| **Validation** | Zod (API request validation) |
| **Matching** | RIASEC/Holland Codes + OCEAN Big Five + Culture Dimensions, cosine similarity |
| **PDF Generation** | @react-pdf/renderer (web), expo-print + expo-sharing (mobile) |
| **Monorepo** | pnpm + Turborepo (API + mobile + web + shared packages) |
| **Infrastructure** | Docker Compose (PostgreSQL + Redis), Supabase (local dev) |

---

## Project Structure

```
apps/mobile/                        # React Native Expo App
├── app/
│   ├── (auth)/                    # Login, register, welcome screens
│   ├── (onboarding)/              # Quiz, profile setup, field selection,
│   │                              # company-culture, motivation, vibe-check
│   ├── (app)/
│   │   ├── (student)/             # Student tabs
│   │   │   ├── feed/              # Swipe feed, listing detail
│   │   │   ├── map/               # Map view, school/listing detail
│   │   │   ├── search/            # Search with listing/school detail
│   │   │   ├── berufe/            # Passende Berufe, quiz, detail
│   │   │   ├── bewerbungen/       # Applications, prepare flow
│   │   │   ├── matches/           # Matches list
│   │   │   ├── chat/              # Chat list, conversation
│   │   │   ├── grades/            # Zeugnis + Multicheck grade entry
│   │   │   └── profile/           # Profile, builder, settings
│   │   └── (company)/             # Company tabs
│   │       ├── dashboard/         # KPI dashboard
│   │       ├── listings/          # Listings CRUD (create, edit, delete)
│   │       ├── applicants/        # Applicant management + dossier
│   │       ├── chat/              # Chat with students
│   │       └── profile/           # Company profile editor
│   └── _layout.tsx                # Root layout
├── components/                    # Reusable components
│   ├── swipe/                     # SwipeDeck, SwipeCard
│   ├── feed/                      # FilterSheet, ActionButtons, MatchCelebration
│   ├── map/                       # Markers, preview sheets, filters
│   ├── quiz/                      # Quiz views, gamification bar
│   ├── search/                    # Row components
│   ├── charts/                    # RadarChart, ComparisonRadarChart, CultureRadarChart
│   ├── grades/                    # GradeCard
│   ├── profileBuilder/            # 6-step builder components
│   ├── chat/                      # ChatInput, MessageBubble
│   └── ui/                        # Button, Card, Input, ScoreRing, CultureSlider, ErrorBoundary
├── stores/                        # Zustand state stores
├── hooks/queries/                 # React Query hooks
├── services/                      # API client, socket, upload
├── constants/                     # Theme, quiz content, cantons
├── types/                         # TypeScript types
└── utils/                         # Scoring engines, commute utils, dossier HTML

apps/web/                           # Next.js Company Web Dashboard
└── src/
    ├── app/
    │   ├── login/                 # Company login page
    │   └── (dashboard)/           # Protected routes (auth guard)
    │       ├── page.tsx           # Dashboard home with stats
    │       ├── stellen/           # Listings CRUD (list, create, edit)
    │       ├── bewerber/          # Applicant management (list, detail)
    │       ├── chat/              # Chat (list, conversation)
    │       ├── profil/            # Company profile editor
    │       └── pdf-preview/       # PDF preview utility
    ├── components/
    │   ├── layout/                # Sidebar navigation
    │   ├── pdf/                   # DossierDocument, PdfRadarChart
    │   └── shared/                # Culture profile section, radar chart
    ├── hooks/                     # React Query hooks (listings, applications, matches, etc.)
    ├── stores/                    # Zustand (auth, chat)
    ├── lib/                       # API client, socket, upload, utils
    └── providers/                 # React Query provider

apps/api/                           # Express.js Backend
└── src/
    ├── app.ts                     # Express setup, routes
    ├── index.ts                   # HTTP server + Socket.io
    ├── config/                    # Environment config
    ├── middleware/                 # Auth (JWT), upload, validation
    ├── modules/
    │   ├── auth/                  # Register, login, token refresh
    │   ├── profiles/              # Student + Company CRUD
    │   ├── listings/              # Lehrstellen CRUD (+ proxy creation)
    │   ├── swipes/                # Feed generation + swipe recording
    │   ├── matches/               # Match retrieval + company enrichment
    │   ├── applications/          # Application tracking + dossier + company enrichment
    │   ├── berufe/                # Professions API (RIASEC, salary, requirements)
    │   ├── berufsschulen/         # Vocational schools API
    │   ├── grades/                # Student grades API (Zeugnis + Multicheck)
    │   ├── quiz/                  # Personality quiz scoring
    │   └── chat/                  # Messaging + WebSocket
    ├── services/                  # Matching algorithm, scraper, token service
    └── utils/                     # Info cards, ApiError, enrichLehrstellenCompany

LehrMatch/                          # SwiftUI iOS App (Legacy)
├── App/                           # AppState, MainTabView, Router
├── Core/                          # Networking, Auth, Services
├── Features/                      # All feature modules
└── DesignSystem/                  # Theme

packages/
├── database/
│   └── prisma/schema.prisma      # Source-of-truth data model
└── shared/src/                    # Shared types, constants, utils
    ├── types/                     # API types, quiz types
    ├── constants/                 # Grades, apprenticeship fields, cantons
    └── utils/                     # Culture match scoring

supabase/
├── config.toml
├── migrations/                    # 22 SQL migrations
├── seed/                          # Berufe, companies, lehrstellen, berufsschulen, motivation questions
└── functions/                     # Edge Functions
```

---

## Database Schema (Key Entities)

**Source of truth:** `packages/database/prisma/schema.prisma`

| Entity | Description |
|--------|-------------|
| `User` | Auth record (email, role: STUDENT/COMPANY/ADMIN) |
| `StudentProfile` | Personal info, OCEAN + RIASEC scores, desired fields, culture dimensions |
| `CompanyProfile` | Company info, photos, links, verification, culture dimensions |
| `Listing` | Lehrstelle with ideal personality profile + motivation questions |
| `Swipe` | Student swipe on listing (LEFT/RIGHT/SUPER) |
| `Match` | Student-listing connection with compatibility score |
| `Application` | Formal application with status timeline + motivation answers |
| `Message` | Chat message within a match |

| `Beruf` | Profession reference data (RIASEC, salary, requirements) |
| `ImportedCompany` | Scraped/imported company data with culture dimensions |
| `Lehrstelle` | Imported apprenticeship positions (linked to Beruf + ImportedCompany) |
| `Berufsschule` | Vocational schools with location data |
| `StudentFavoriteBeruf` | Student's saved favorite professions |

All tables are managed via Prisma ORM. Supabase SQL migrations create the reference tables; `prisma db push` creates Prisma-only tables and verifies alignment

---

## API Documentation (Express.js — `/api`)

### Auth
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register (role: STUDENT or COMPANY) |
| `/api/auth/login` | POST | Login (returns JWT) |

### Student
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/swipes/feed` | GET | Merged feed (Prisma listings + Supabase lehrstellen) |
| `/api/swipes` | POST | Record swipe (LEFT/RIGHT/SUPER), auto-creates proxy for lehrstellen |
| `/api/matches` | GET | Student matches with company enrichment |
| `/api/applications` | GET/POST | Application tracking |
| `/api/berufe` | GET | Professions with RIASEC data, salary, requirements |
| `/api/berufe/:code` | GET | Single profession detail |
| `/api/berufe/favorites` | GET/POST/DELETE | Favorite professions |
| `/api/berufsschulen` | GET | Vocational schools |
| `/api/berufsschulen/:id` | GET | School detail |
| `/api/grades` | GET/POST/PUT | Student grades (Zeugnis + Multicheck) |

### Company
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/companies/me` | GET/PUT | Company profile CRUD |
| `/api/companies/me/photos` | POST | Upload photos |
| `/api/companies/me/video` | POST/DELETE | Video management |
| `/api/companies/culture-presets` | GET | Culture dimension presets |
| `/api/listings` | POST | Create listing (with motivation questions) |
| `/api/listings/mine` | GET | Company's listings |
| `/api/listings/:id` | GET/PUT/DELETE | Listing detail, update, delete |
| `/api/applications` | GET | Applications for company |
| `/api/applications/:id/dossier` | GET | Applicant dossier (for PDF) |
| `/api/applications/:id/status` | PUT | Update application status |

### Shared
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/:matchId/messages` | GET/POST | Chat messages |
| `/api/matches/:id` | GET | Single match detail |

---

## Quick Start

```bash
bash scripts/setup-db.sh          # Does everything: install, Supabase, migrations, Prisma, seed
```

## Development

```bash
pnpm dev:api                      # Terminal 1 → http://localhost:3002
pnpm dev:mobile                   # Terminal 2 → Expo (press 'i' for iOS, 'a' for Android)
pnpm dev:web                      # Terminal 3 → http://localhost:3000
```

The web dashboard requires `apps/web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
```

## Test Accounts (password: `Test1234!`)

| Role | Email |
|------|-------|
| Student | lena.mueller@test.ch, marco.bianchi@test.ch, sara.keller@test.ch, noah.schmid@test.ch, emma.weber@test.ch |
| Company | hr@swisstech.ch, ausbildung@muellerag.ch, jobs@gesundheitszentrum-bern.ch |

## Setup Details

`bash scripts/setup-db.sh` handles the full first-time setup and can be re-run anytime for a clean slate:

1. `pnpm install` — installs all dependencies (installs pnpm via corepack if needed)
2. Creates `.env` and `apps/web/.env.local` if missing
3. Starts Supabase if not running
4. `supabase db reset` — applies all SQL migrations + seeds reference data (berufe, companies, lehrstellen, berufsschulen)
5. Drops all public schema functions (prevents stale function dependencies from blocking table changes)
6. `prisma generate` + `prisma db push` — generates client, creates/syncs all Prisma-managed tables
7. Drops the `listings.companyId` FK constraint (enables proxy listings for Supabase lehrstellen)
8. Runs `seed.ts` — creates 5 test students, 3 test companies, sample listings, 7 demo applications across all pipeline stages, and chat messages

### SwiftUI App (Legacy, optional)

1. Open `LehrMatch.xcodeproj` in Xcode 16+
2. Select an iPhone simulator (iOS 17+)
3. Build and run

---

## Matching Algorithm

**5-factor compatibility scoring:**

| Factor | Weight | Method |
|--------|--------|--------|
| Personality (OCEAN) | 25% | Cosine similarity between student and listing ideal |
| Interest (RIASEC) | 25% | Cosine similarity, field-based fallback |
| Culture Fit | 25% | 8-dimension culture match with dealbreaker logic |
| Field Match | 15% | Exact match on desired apprenticeship field |
| Location | 10% | Same canton bonus |

Culture dimensions: Innovation, Teamwork, Work-Life-Balance, Hierarchie, Nachhaltigkeit, Diversität, Weiterbildung, Eigenverantwortung. Dealbreaker threshold: >60 point gap on any dimension caps the culture score.

Minimum score: 30% to appear in feed. Top 50 returned per request.

---

## To-Dos

- [x] Personality Quiz (Build Your Day)
- [x] Swipe Feed with filters
- [x] Map View with Lehrstellen + Berufsschulen
- [x] Search (Lehrstellen, Berufe, Schulen)
- [x] Passende Berufe (RIASEC matching)
- [x] Student Bewerbungen + Prepare Flow
- [x] Company Dashboard
- [x] Company Listings CRUD (create, edit, delete)
- [x] Company Applicant Management
- [x] Company Profile with Media
- [x] React Native Expo mobile app (cross-platform)
- [x] Dual data source feed (Prisma + Supabase lehrstellen)
- [x] Proxy listing system for lehrstellen
- [x] Berufe API with salary + requirements
- [x] Berufsschulen API
- [x] Company onboarding flow
- [x] Chat system (student <-> company)
- [x] Commute info on listing cards
- [x] Company Web Dashboard (Next.js)
- [x] Culture dimensions + culture matching
- [x] Student grades (Zeugnis + Multicheck)
- [x] Motivation questions for listings
- [x] PDF dossier download (mobile + web)
- [x] 5 swipes per day limit
- [x] Database consolidation (all tables via Prisma)
- [x] API input validation (Zod)
- [x] Atomic swipe transactions
- [x] Mobile ErrorBoundary crash recovery
- [x] Investor demo seed data (7 applications, full pipeline)
- [x] One-command setup script (`scripts/setup-db.sh`)
- [ ] Push notifications for application status changes
- [ ] Lehrstellen import from external sources (LENA)
- [ ] Profile photo/video upload in Expo app
- [ ] End-to-end testing
