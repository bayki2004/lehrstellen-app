# LehrMatch — Lehrstellen App

Cross-platform mobile app (React Native Expo + SwiftUI) that matches Swiss students with Lehrstellen (apprenticeships) based on personality profiles — like Tinder, but for careers.

## Architecture Overview

This project combines two frontends and a unified backend:

| Layer | Student Side | Company Side |
|-------|-------------|--------------|
| **Frontend** | React Native Expo (iOS/Android) + SwiftUI (iOS) | React Native Expo (iOS/Android) + SwiftUI (iOS) |
| **Backend** | Express.js + Prisma ORM + Supabase | Express.js + Prisma ORM |
| **Database** | PostgreSQL (Supabase) | Same PostgreSQL via Prisma |
| **Auth** | JWT (Express middleware) + Supabase Auth | JWT (Express middleware) |
| **Real-time** | Socket.io | Socket.io |
| **State** | Zustand + React Query (TanStack v5) | Zustand + React Query |

### Branch History

- **main** — Merged from Rashad (student SwiftUI) + Kaan (company Express backend)
- **V_3** — Current development branch: full React Native Expo mobile app, unified Express API, dual data sources (Prisma + Supabase), deep bug fixes, filter overhaul

**Data model source of truth:** Prisma schema (`packages/database/prisma/schema.prisma`)

---

## Current Version: V_3

### What's New in V_3
- **React Native Expo App** — Full cross-platform mobile app (iOS/Android) alongside the original SwiftUI codebase
- **Dual Data Sources** — Swipe feed merges Prisma `listings` (company-created) and Supabase `lehrstellen` (scraped/imported apprenticeships)
- **Proxy Listings** — Swiping on a Supabase lehrstelle auto-creates a proxy in the Prisma `listings` table via `ensureLehrstelleProxy()`
- **Berufe & Berufsschulen API** — New Express endpoints for professions (with RIASEC data, salary, requirements) and vocational schools
- **Filter Overhaul** — Reworked feed filters with canton, category, and education type support
- **Scraper Service** — Backend service for importing lehrstellen from external sources
- **Info Cards** — Contextual info cards in the feed for onboarding and engagement
- **Enriched Seed Data** — Expanded berufe with Anforderungen & Lohn data, more berufsschulen and companies

### Student Features
- **Personality Quiz** — "Build Your Day" 3-phase quiz (26 questions, RIASEC scoring, gamification)
- **Swipe Feed** — Discover Lehrstellen with compatibility scores, swipe deck with animated cards
- **Map View** — Interactive map with pins for Lehrstellen and Berufsschulen, filter bar, preview sheets
- **Search** — Lehrstellen, Berufe, and Berufsschulen tabs with detail views
- **Passende Berufe** — RIASEC-based career matching with radar chart comparison
- **Bewerbungen** — Application tracking: prepare, send, track status (offen → gesendet → accepted/rejected)
- **Profile Builder** — 6-step builder: personal info, education, experience, skills/languages, documents, motivation video
- **Chat** — Messaging with matched companies (after application accepted)
- **Commute Info** — Travel time and distance to lehrstellen shown on cards

### Company Features
- **Dashboard** — KPIs: total listings, active listings, applications, pending count
- **Listings Management** — Create, edit, delete Lehrstellen with ideal personality profiles (OCEAN + RIASEC)
- **Applicant Management** — View incoming applications, compatibility scores, update status (shortlist, interview, accept/reject)
- **Company Profile** — Edit description, photo gallery, video, links, contact details
- **Company Onboarding** — Profile setup flow during first login
- **Chat** — Messaging with matched students

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Mobile App** | React Native, Expo SDK 54, expo-router v6, TypeScript |
| **iOS App (Legacy)** | SwiftUI, iOS 17+, MVVM with `@Observable` |
| **State Management** | Zustand (stores) + React Query / TanStack v5 (server state) |
| **Backend API** | Express.js, TypeScript, Prisma ORM, JWT, Socket.io |
| **Database** | PostgreSQL (Supabase), accessed via both Prisma ORM and Supabase PostgREST |
| **Matching** | RIASEC/Holland Codes + OCEAN Big Five, cosine similarity |
| **Monorepo** | pnpm + Turborepo (API + mobile + shared packages) |
| **Infrastructure** | Docker Compose (PostgreSQL + Redis), Supabase (local dev) |

---

## Project Structure

```
apps/mobile/                        # React Native Expo App (V_3)
├── app/
│   ├── (auth)/                    # Login, register, welcome screens
│   ├── (onboarding)/              # Quiz, profile setup, field selection
│   ├── (app)/
│   │   ├── (student)/             # Student tabs
│   │   │   ├── feed/              # Swipe feed, listing detail
│   │   │   ├── map/               # Map view, school/listing detail
│   │   │   ├── search/            # Search with listing/school detail
│   │   │   ├── berufe/            # Passende Berufe, quiz, detail
│   │   │   ├── bewerbungen/       # Applications, prepare flow
│   │   │   ├── matches/           # Matches list
│   │   │   ├── chat/              # Chat list, conversation
│   │   │   └── profile/           # Profile, builder, settings
│   │   └── (company)/             # Company tabs
│   │       ├── dashboard/         # KPI dashboard
│   │       ├── listings/          # Listings CRUD
│   │       ├── applicants/        # Applicant management
│   │       ├── chat/              # Chat with students
│   │       └── profile/           # Company profile editor
│   └── _layout.tsx                # Root layout
├── components/                    # Reusable components
│   ├── swipe/                     # SwipeDeck, SwipeCard
│   ├── feed/                      # FilterSheet, ActionButtons, MatchCelebration
│   ├── map/                       # Markers, preview sheets, filters
│   ├── quiz/                      # Quiz views, gamification bar
│   ├── search/                    # Row components
│   ├── charts/                    # RadarChart, ComparisonRadarChart
│   ├── profileBuilder/            # 6-step builder components
│   ├── chat/                      # ChatInput, MessageBubble
│   └── ui/                        # Button, Card, Input, ScoreRing, etc.
├── stores/                        # Zustand state stores
│   ├── auth.store.ts              # Auth state, login/register
│   ├── feed.store.ts              # Feed state, swipe actions
│   ├── map.store.ts               # Map filters, listings, schools
│   ├── search.store.ts            # Search queries, results
│   ├── quiz.store.ts              # Quiz progress, scoring
│   ├── berufe.store.ts            # Favorite berufe
│   ├── bewerbungen.store.ts       # Application actions
│   ├── chat.store.ts              # Chat messages, socket
│   └── profileBuilder.store.ts    # Multi-step profile builder
├── hooks/queries/                 # React Query hooks
├── services/                      # API client, socket, upload
├── constants/                     # Theme, quiz content, cantons
├── types/                         # TypeScript types
└── utils/                         # Scoring engines, commute utils

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
    │   ├── applications/          # Application tracking + company enrichment
    │   ├── berufe/                # Professions API (RIASEC, salary, requirements)
    │   ├── berufsschulen/         # Vocational schools API
    │   ├── quiz/                  # Personality quiz scoring
    │   └── chat/                  # Messaging + WebSocket
    ├── services/                  # Matching algorithm, scraper, token service
    └── utils/                     # Info cards

LehrMatch/                          # SwiftUI iOS App (Legacy)
├── App/                           # AppState, MainTabView, Router
├── Core/                          # Networking, Auth, Services
├── Features/                      # All feature modules
└── DesignSystem/                  # Theme

packages/
├── database/
│   └── prisma/schema.prisma      # Source-of-truth data model
└── shared/src/                    # Shared types + constants

supabase/
├── config.toml
├── migrations/                    # 16 SQL migrations (incl. proxy FK drop)
├── seed/                          # Berufe, companies, lehrstellen, berufsschulen
└── functions/                     # Edge Functions
```

---

## Database Schema (Key Entities)

**Source of truth:** `packages/database/prisma/schema.prisma`

| Entity | Description |
|--------|-------------|
| `User` | Auth record (email, role: STUDENT/COMPANY/ADMIN) |
| `StudentProfile` | Personal info, OCEAN + RIASEC scores, desired fields |
| `CompanyProfile` | Company info, photos, links, verification |
| `Listing` | Lehrstelle with ideal personality profile |
| `Swipe` | Student swipe on listing (LEFT/RIGHT/SUPER) |
| `Match` | Student-listing connection with compatibility score |
| `Application` | Formal application with status timeline |
| `Message` | Chat message within a match |

Supabase adds: `berufe`, `personality_profiles`, `bewerbungen`, `berufsschulen`, `lehrstellen_feed` (view)

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

### Company
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/companies/me` | GET/PUT | Company profile CRUD |
| `/api/companies/me/photos` | POST | Upload photos |
| `/api/companies/me/video` | POST/DELETE | Video management |
| `/api/listings` | POST | Create listing |
| `/api/listings/my` | GET | Company's listings |
| `/api/listings/:id` | PUT/DELETE | Update/delete listing |
| `/api/applications` | GET | Applications for company |

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
pnpm dev:api                      # → http://localhost:3002/api/health
```

### 3. Start Mobile App (React Native Expo)

```bash
pnpm dev:mobile                   # Starts Expo dev server
# Press 'i' for iOS simulator or 's' for Android emulator
```

### 4. SwiftUI App (Legacy, optional)

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
- [x] Company Listings CRUD
- [x] Company Applicant Management
- [x] Company Profile with Media
- [x] React Native Expo mobile app (cross-platform)
- [x] Dual data source feed (Prisma + Supabase lehrstellen)
- [x] Proxy listing system for lehrstellen
- [x] Berufe API with salary + requirements
- [x] Berufsschulen API
- [x] Company onboarding flow
- [x] Chat system (student ↔ company)
- [x] Commute info on listing cards
- [ ] Push notifications for application status changes
- [ ] Lehrstellen import from external sources (LENA)
- [ ] Profile photo/video upload in Expo app
- [ ] End-to-end testing
