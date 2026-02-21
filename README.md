# LehrMatch — Lehrstellen App

SwiftUI-native iOS app that matches Swiss students with Lehrstellen (apprenticeships) based on personality profiles — like Tinder, but for careers.

## Architecture Overview

This project combines two codebases into a unified platform:

| Layer | Student Side | Company Side |
|-------|-------------|--------------|
| **Frontend** | SwiftUI (iOS native) | SwiftUI (iOS native) |
| **Backend** | Supabase (PostgREST + Auth) | Express.js + Prisma ORM |
| **Database** | Supabase PostgreSQL | Same PostgreSQL via Prisma |
| **Auth** | Supabase Auth | JWT (Express middleware) |
| **Real-time** | Supabase Realtime | Socket.io |

### Branch Merge History

This main branch was created by merging two feature branches:

- **Rashad branch** (student side) — SwiftUI iOS app with personality quiz, swipe feed, map, search, Passende Berufe, Bewerbungen. Uses Supabase directly.
- **Kaan branch** (company side) — Express.js API backend with Prisma ORM, company dashboard, listings CRUD, applicant management, profile with media. Originally built as an Expo/React Native app, company UI was ported to SwiftUI.

**Data model source of truth:** Prisma schema (`packages/database/prisma/schema.prisma`)

---

## Current Version: V3 + Company Features

### Student Features (from Rashad)
- **Personality Quiz** — "Build Your Day" 3-phase quiz (26 questions, RIASEC scoring, gamification)
- **Swipe Feed** — Discover Lehrstellen with compatibility scores, filters (canton, category, education type)
- **Map View** — Interactive map with pins for Lehrstellen and Berufsschulen
- **Search** — Lehrstellen, Berufe, and Berufsschulen tabs
- **Passende Berufe** — RIASEC-based career matching with radar chart comparison
- **Bewerbungen** — One-way application tracking (sent, viewed, interview, offer, accepted)
- **Profile Builder** — Multi-step student profile with documents, motivation video

### Company Features (from Kaan)
- **Dashboard** — KPIs: total listings, active listings, applications, pending count
- **Listings Management** — Create, edit, delete Lehrstellen with ideal personality profiles (OCEAN + RIASEC)
- **Applicant Management** — View incoming applications, compatibility scores, update status (shortlist, interview, accept/reject)
- **Company Profile** — Edit description, photo gallery, video, links, contact details
- **Application Status Flow** — PENDING → VIEWED → SHORTLISTED → INTERVIEW_SCHEDULED → ACCEPTED/REJECTED

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **iOS Frontend** | SwiftUI, iOS 17+, MVVM with `@Observable` |
| **Student Backend** | Supabase (PostgreSQL, Auth, PostgREST, Realtime, Edge Functions) |
| **Company Backend** | Express.js, TypeScript, Prisma ORM, JWT, Socket.io |
| **Database** | PostgreSQL (shared, accessed via both Supabase and Prisma) |
| **Matching** | RIASEC/Holland Codes + OCEAN Big Five, cosine similarity |
| **Monorepo** | pnpm + Turborepo (for Express API + shared packages) |
| **Infrastructure** | Docker Compose (PostgreSQL + Redis) |

---

## Project Structure

```
LehrMatch/                          # iOS App (SwiftUI)
├── App/
│   ├── AppState.swift              # Global state (auth, student/company profile)
│   ├── MainTabView.swift           # 5 student tabs + 4 company tabs
│   ├── NavigationRouter.swift      # Per-tab NavigationPath routing
│   └── LehrMatchApp.swift          # Entry point
├── Core/
│   ├── Networking/
│   │   ├── APIClient.swift         # Supabase PostgREST client (student)
│   │   ├── Endpoints.swift         # Supabase REST endpoints
│   │   ├── ExpressAPIClient.swift  # Express.js API client (company)
│   │   ├── ExpressEndpoints.swift  # Express API endpoints
│   │   ├── SupabaseConfig.swift    # Supabase connection config
│   │   └── RealtimeClient.swift    # WebSocket subscriptions
│   ├── Auth/                       # Supabase Auth + Keychain
│   ├── Services/                   # Geocoding, Commute calculation
│   └── Storage/                    # File uploads
├── DesignSystem/
│   └── Theme.swift                 # Colors, typography, spacing, shadows
├── Features/
│   ├── Discovery/                  # Swipe feed, card detail, filters
│   ├── Map/                        # Map view, pins, preview sheets
│   ├── Search/                     # Lehrstellen/Berufe/Schulen search
│   ├── PassendeBerufe/             # RIASEC matching, radar charts
│   ├── Onboarding/                 # Personality quiz, gamification
│   ├── Profile/                    # Student profile builder, settings
│   ├── Bewerbungen/                # Student application tracking
│   ├── Company/                    # Company features (NEW)
│   │   ├── Models/                 # CompanyProfile, Listing, Application
│   │   ├── ViewModels/             # Dashboard, Listings, Bewerbungen, Profile VMs
│   │   └── Views/                  # Dashboard, Listings, Bewerbungen, Profile views
│   ├── Chat/                       # Messaging
│   └── Matching/                   # Legacy match system
└── Resources/                      # Assets (colors, app icon)

apps/                               # Express.js Backend (from Kaan)
├── api/
│   └── src/
│       ├── app.ts                  # Express setup, routes
│       ├── index.ts                # HTTP server + Socket.io
│       ├── config/                 # Environment config
│       ├── middleware/             # Auth (JWT), upload, validation
│       ├── modules/
│       │   ├── auth/              # Register, login, token refresh
│       │   ├── profiles/          # Student + Company CRUD
│       │   ├── listings/          # Lehrstellen CRUD
│       │   ├── swipes/            # Feed generation + swipe recording
│       │   ├── matches/           # Match retrieval
│       │   ├── applications/      # Application tracking
│       │   ├── quiz/              # Personality quiz scoring
│       │   └── chat/              # Messaging + WebSocket
│       └── services/              # Matching algorithm, token service

packages/                           # Shared packages
├── database/
│   └── prisma/
│       └── schema.prisma          # Source-of-truth data model
└── shared/
    └── src/
        ├── types/                 # API DTOs, quiz types
        └── constants/             # Fields, cantons

supabase/                           # Supabase Backend
├── config.toml
├── migrations/                    # 15 SQL migrations
│   ├── 00001-00010               # Core tables, RLS, triggers
│   ├── 00011-00014               # V3: Map, data import, feed, RIASEC
│   └── 00015                     # Schema alignment with Prisma
├── seed/                          # Sample data (berufe, companies, lehrstellen)
└── functions/                     # Edge Functions (recommendations)

scripts/                            # Data pipeline
├── onet_import.py                 # O*NET RIASEC data import
└── seed/                          # Enrich lehrberufe, fetch berufsschulen, geocoding

docker-compose.yml                  # PostgreSQL + Redis for Express API
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

## API Documentation

### Student Endpoints (Supabase PostgREST)

| Endpoint | Description |
|----------|-------------|
| `POST /auth/v1/signup` | Register |
| `POST /auth/v1/token` | Login |
| `GET /rest/v1/students` | Student profiles |
| `GET /rest/v1/lehrstellen_feed` | Discovery feed with scoring |
| `POST /rest/v1/bewerbungen` | Send application |
| `GET /rest/v1/berufsschulen` | Vocational schools |
| `GET /rest/v1/berufe` | Professions with RIASEC data |

### Company Endpoints (Express.js API)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register (role: COMPANY) |
| `/api/auth/login` | POST | Login (returns JWT) |
| `/api/companies/me` | GET/PUT | Company profile CRUD |
| `/api/companies/me/photos` | POST | Upload photos |
| `/api/companies/me/video` | POST/DELETE | Video management |
| `/api/listings` | POST | Create listing |
| `/api/listings/my` | GET | Company's listings |
| `/api/listings/:id` | PUT/DELETE | Update/delete listing |
| `/api/applications` | GET | Applications for company |
| `/api/matches` | GET | Matches for company |
| `/api/chat/:matchId/messages` | GET | Chat messages |

---

## Running the App

### iOS App (SwiftUI)

1. Open `LehrMatch.xcodeproj` in Xcode 16+
2. Select an iPhone simulator (iOS 17+)
3. Build and run — works in demo mode with sample data

### Express.js API (Company Backend)

```bash
# Start PostgreSQL + Redis
docker-compose up -d

# Install dependencies
pnpm install

# Set up database
cp .env.example .env
# Edit .env with your DATABASE_URL
cd packages/database && pnpm prisma migrate deploy && pnpm prisma db seed

# Start API
cd apps/api && pnpm dev
# → http://localhost:3000/api/health
```

### Supabase (Student Backend)

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

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
- [x] Map View
- [x] Search (Lehrstellen, Berufe, Schulen)
- [x] Passende Berufe (RIASEC matching)
- [x] Student Bewerbungen
- [x] Company Dashboard
- [x] Company Listings CRUD
- [x] Company Applicant Management
- [x] Company Profile with Media
- [ ] Connect Express API to Supabase PostgreSQL (shared DB)
- [ ] End-to-end company onboarding flow
- [ ] Push notifications for application status changes
- [ ] Lehrstellen import from external sources (LENA)
