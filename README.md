# Lehrstellen App

SwiftUI-native iOS app that matches Swiss students with Lehrstellen (apprenticeships) based on personality profiles — like Tinder, but for careers.

## Current Version: V3

### What's New in V3
- **Map View** — Interactive map with pins for Lehrstellen and Berufsschulen across Switzerland, filterable by category, radius, and canton
- **Search with Lehrstellen** — Search tab now defaults to Lehrstellen search (company, beruf, city, canton), plus Berufe and Schulen tabs
- **Passende Berufe** — RIASEC-based profession matching after personality quiz, with radar chart comparison and match explanations
- **31 Demo Lehrstellen** — Covering 12 fields and 10 cantons with real Swiss companies for investor demo
- **UI Fixes** — Fixed invisible nav bar icons and tab bar icons (missing color assets), fixed scroll issues

### V2 Highlights
- Profile = Bewerbung system (one-way application flow)
- Build Your Day personality quiz with gamification (XP, levels, badges)
- Feed filters (canton, category, education type)
- RIASEC matching algorithm with cosine similarity

## To-Dos

- [x] Map Funktion
- [x] Such Funktion
- [x] Lehrstellen Overview / Berufswahl
- [ ] Firmenregistrierung
- [ ] Lehrstellen aus dem Internet (Lehrstellen aus Internet hochladen)
- [ ] Firmen Lehrstellen erstellen

## Tech Stack

- **Frontend:** SwiftUI (iOS 17+)
- **Backend:** Supabase (PostgreSQL, Auth, REST API)
- **Architecture:** MVVM with `@Observable`, `NavigationRouter` per-tab stacks
- **Matching:** RIASEC/Holland Codes with cosine similarity (O*NET data)

## Project Structure

```
LehrMatch/
├── App/                    # MainTabView, NavigationRouter, AppState
├── Core/
│   ├── Networking/         # APIClient, Endpoints
│   └── Services/           # Geocoding, Commute
├── DesignSystem/           # Theme (colors, typography, spacing)
├── Features/
│   ├── Discovery/          # Swipe feed, card detail, filters
│   ├── Map/                # Map view, pins, preview sheets
│   ├── Search/             # Lehrstellen/Berufe/Schulen search
│   ├── PassendeBerufe/     # RIASEC matching, radar charts
│   ├── Onboarding/         # Personality quiz, reveal animation
│   ├── Profile/            # Profile builder, settings
│   └── Bewerbungen/        # Application tracking
├── Resources/              # Assets (colors, app icon)
scripts/                    # O*NET import, seed data scripts
supabase/                   # Migrations, seed data, config
```

## Running the App

1. Open `LehrMatch.xcodeproj` in Xcode 16+
2. Select an iPhone simulator (iOS 17+)
3. Build and run — the app works in demo mode with sample data (no backend required)
