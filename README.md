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
- **V_4** — Current: Company Web Dashboard, mobile feature parity, culture dimensions, student grades, glassmorphism UI

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
- **Bug Fixes** — Presets.map error, API response unwrapping, tab bar overlap, safe area padding, feed filters

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
| **Matching** | RIASEC/Holland Codes + OCEAN Big Five, cosine similarity |
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
│   └── ui/                        # Button, Card, Input, ScoreRing, CultureSlider, etc.
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
    └── utils/                     # Info cards, ApiError

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
├── migrations/                    # 19 SQL migrations
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

Supabase adds: `berufe`, `personality_profiles`, `bewerbungen`, `berufsschulen`, `lehrstellen_feed` (view), `culture_dimensions`, `student_grades`, `motivation_questions`

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

## Running the App

### 1. Start Supabase (Database)

```bash
supabase start       # Starts local Supabase (PostgreSQL, Auth, PostgREST)
supabase db reset    # Apply migrations + seed data
```

### 2. Start Express API (Backend)

```bash
cp .env.example .env              # Configure DATABASE_URL, SUPABASE_URL, etc.
pnpm install                      # Install all dependencies
cd packages/database && pnpm prisma migrate deploy && pnpm prisma db seed
pnpm dev:api                      # -> http://localhost:3002/api/health
```

### 3. Start Mobile App (React Native Expo)

```bash
pnpm dev:mobile                   # Starts Expo dev server
# Press 'i' for iOS simulator or 'a' for Android emulator
```

### 4. Start Company Web Dashboard (Next.js)

```bash
# Create apps/web/.env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:3002/api
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3002

pnpm dev:web                      # -> http://localhost:3000
```

Login with a company account. The dashboard requires the Express API to be running.

### 5. SwiftUI App (Legacy, optional)

1. Open `LehrMatch.xcodeproj` in Xcode 16+
2. Select an iPhone simulator (iOS 17+)
3. Build and run

---

## Matching Algorithm

**Compatibility scoring** (from Kaan's matching service):

| Factor | Weight | Method |
|--------|--------|--------|
| Personality (OCEAN) | 35% | Cosine similarity between student and listing ideal |
| Interest (RIASEC) | 35% | Cosine similarity, field-based fallback |
| Field Match | 20% | Exact match on desired field |
| Location | 10% | Same canton bonus |

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
- [ ] Push notifications for application status changes
- [ ] Lehrstellen import from external sources (LENA)
- [ ] Profile photo/video upload in Expo app
- [ ] End-to-end testing
