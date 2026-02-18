# Personality Quiz Design — "Build Your Day"

## Overview

A gamified personality assessment quiz for LehrMatch that determines a student's RIASEC/Holland Code profile through a "Build Your Day" mini-game. The quiz replaces the current 10-question sample with a 26-question, 3-phase experience targeting Swiss teenagers (14-17). Results drive Lehrstellen matching via cosine similarity against each Beruf's `personality_fit` vector.

## Target: 25-30 Questions, ~4-5 min completion

## Quiz Structure

### Phase 1: "Dein Morgen" — Activity Grid (8 picks from 16 tiles)

A 4x4 grid of square activity tiles. User taps 8 that appeal to them.

**Tiles (16 total, covering all 6 RIASEC dimensions evenly):**

| # | Label (Swiss German) | SF Symbol | Primary | Secondary |
|---|---------------------|-----------|---------|-----------|
| 1 | Maschine bedienen | gearshape.2 | R: 1.0 | I: 0.3 |
| 2 | Holz bearbeiten | hammer | R: 1.0 | A: 0.3 |
| 3 | Code schreiben | chevron.left.forwardslash.chevron.right | I: 1.0 | R: 0.3 |
| 4 | Experimente machen | flask | I: 1.0 | — |
| 5 | Logo gestalten | paintbrush | A: 1.0 | E: 0.3 |
| 6 | Musik / Video produzieren | music.note | A: 1.0 | — |
| 7 | Patienten betreuen | heart.text.clipboard | S: 1.0 | — |
| 8 | Kinder unterrichten | book | S: 1.0 | A: 0.3 |
| 9 | Kunden beraten | person.2 | S: 0.8 | E: 0.5 |
| 10 | Team leiten | person.3.sequence | E: 1.0 | S: 0.3 |
| 11 | Produkte verkaufen | storefront | E: 1.0 | — |
| 12 | Daten ordnen | tablecells | C: 1.0 | I: 0.3 |
| 13 | Büro organisieren | folder | C: 1.0 | — |
| 14 | Elektrisch installieren | bolt | R: 0.8 | I: 0.5 |
| 15 | Texte schreiben | doc.text | A: 0.5 | C: 0.5 |
| 16 | Projekte planen | calendar | E: 0.5 | C: 0.5 |

**Grid is shuffled randomly per user** to avoid position bias.

### Phase 2: "Dein Nachmittag" — Environment Grid (8 picks from 16 tiles)

Same 4x4 grid mechanic. Tiles focus on work environments and conditions.

| # | Label | SF Symbol | Primary | Secondary |
|---|-------|-----------|---------|-----------|
| 1 | Draussen arbeiten | sun.max | R: 1.0 | — |
| 2 | In der Werkstatt | wrench.and.screwdriver | R: 1.0 | — |
| 3 | Im Labor / Techraum | desktopcomputer | I: 1.0 | — |
| 4 | Probleme analysieren | magnifyingglass | I: 1.0 | C: 0.3 |
| 5 | Im Atelier / Studio | paintpalette | A: 1.0 | — |
| 6 | Auf der Bühne / vor Kamera | video | A: 0.8 | E: 0.5 |
| 7 | Im Spital / Praxis | cross.case | S: 1.0 | — |
| 8 | Menschen zuhören | ear | S: 1.0 | — |
| 9 | Verhandlungen führen | bubble.left.and.bubble.right | E: 1.0 | — |
| 10 | Präsentationen halten | person.and.background.dotted | E: 0.8 | A: 0.3 |
| 11 | Listen und Tabellen führen | list.clipboard | C: 1.0 | — |
| 12 | Abläufe kontrollieren | checklist | C: 1.0 | — |
| 13 | Körperlich aktiv sein | figure.run | R: 0.8 | S: 0.3 |
| 14 | Mit Zahlen arbeiten | function | I: 0.5 | C: 0.5 |
| 15 | Events organisieren | party.popper | E: 0.5 | S: 0.5 |
| 16 | Tiere / Pflanzen pflegen | leaf | R: 0.7 | S: 0.3 |

### Phase 3: "Was zählt für dich?" — 10 Scenario Questions

Multiple choice, 4 options each. One question at a time with slide animation. Measures both RIASEC and WorkValues.

**Question 1:**
"Dein Kollege hat Stress mit einer Aufgabe. Was machst du?"
- "Ich helfe sofort mit" → S: 1.0, teamwork: 0.8
- "Ich zeige einen effizienteren Weg" → I: 0.8, independence: 0.5
- "Ich motiviere und muntere auf" → E: 0.8, social: 0.5
- "Ich mache mein eigenes Ding weiter" → C: 0.5, independence: 1.0

**Question 2:**
"Dein Traum-Arbeitsweg sieht so aus:"
- "Mit dem Velo zur Baustelle / Werkstatt" → R: 1.0, physicalActivity: 0.8
- "Zu Fuss ins Büro in der Stadt" → C: 0.5, stability: 0.8
- "Homeoffice, Laptop auf" → I: 0.8, independence: 0.8
- "Egal, Hauptsache mit coolen Leuten" → S: 0.8, teamwork: 1.0

**Question 3:**
"Du gewinnst 1000 CHF. Was machst du?"
- "Neues Werkzeug oder Gadget kaufen" → R: 0.8, technology: 0.8
- "In einen Online-Kurs investieren" → I: 1.0, independence: 0.5
- "Ein kreatives Projekt starten" → A: 1.0, creativity: 1.0
- "Etwas mit Freunden unternehmen" → S: 0.8, teamwork: 0.5

**Question 4:**
"Welchen Social-Media-Kanal würdest du am liebsten betreiben?"
- "DIY / Handwerk Tutorials" → R: 0.8, creativity: 0.5
- "Tech Reviews / Science Content" → I: 1.0, technology: 0.8
- "Design / Art / Fotografie" → A: 1.0, creativity: 1.0
- "Lifestyle / People / Vlogs" → S: 0.5, E: 0.5, helpingOthers: 0.5

**Question 5:**
"Was nervt dich am meisten?"
- "Den ganzen Tag stillsitzen" → R: 1.0, physicalActivity: 1.0, variety: 0.5
- "Immer das Gleiche machen" → A: 0.5, E: 0.5, variety: 1.0
- "Alleine arbeiten ohne Teamkontakt" → S: 1.0, teamwork: 1.0
- "Chaos ohne klare Struktur" → C: 1.0, stability: 1.0

**Question 6:**
"Ein neues Schulprojekt steht an. Du übernimmst am liebsten:"
- "Den praktischen Teil (bauen, basteln)" → R: 1.0, independence: 0.5
- "Die Recherche und Analyse" → I: 1.0, independence: 0.8
- "Das Design und die Gestaltung" → A: 1.0, creativity: 1.0
- "Die Koordination im Team" → E: 0.8, teamwork: 0.8

**Question 7:**
"Stell dir vor, du könntest ein Problem der Welt lösen. Welches?"
- "Kaputte Infrastruktur reparieren" → R: 1.0, helpingOthers: 0.5
- "Eine Krankheit heilen" → I: 0.8, S: 0.5, helpingOthers: 1.0
- "Mehr Zugang zu Kunst und Kultur schaffen" → A: 1.0, helpingOthers: 0.8
- "Einsamkeit bekämpfen" → S: 1.0, helpingOthers: 1.0

**Question 8:**
"Wie lernst du am besten?"
- "Learning by Doing — einfach ausprobieren" → R: 1.0, independence: 0.5
- "Selber recherchieren und lesen" → I: 1.0, independence: 1.0
- "Mir Notizen skizzieren oder Mindmaps machen" → A: 0.8, creativity: 0.5
- "Im Gespräch mit anderen" → S: 1.0, teamwork: 0.8

**Question 9:**
"Dein Chef sagt: 'Mach einfach, wie du willst.' Wie reagierst du?"
- "Super, ich lege direkt los!" → R: 0.5, E: 0.5, independence: 1.0
- "Ich mache erstmal einen Plan" → C: 1.0, stability: 0.8
- "Ich frage Kollegen, was sie denken" → S: 0.8, teamwork: 1.0
- "Ich probiere was Kreatives aus" → A: 1.0, creativity: 1.0

**Question 10:**
"In 10 Jahren willst du:"
- "Mein eigenes Unternehmen führen" → E: 1.0, independence: 1.0
- "Expert/in in meinem Fachgebiet sein" → I: 0.8, R: 0.5, stability: 0.5
- "Einen Job haben, der Menschen hilft" → S: 1.0, helpingOthers: 1.0
- "Kreative Projekte verwirklichen" → A: 1.0, creativity: 1.0

## Scoring Model

### Raw Score Accumulation
```
For each selected grid tile:
  hollandScores[dimension] += score

For each scenario answer:
  hollandScores[dimension] += score
  workValues[dimension] += score
```

### Phase Weighting
- Phase 1 (Morning Grid): 30% weight
- Phase 2 (Afternoon Grid): 30% weight
- Phase 3 (Scenarios): 40% weight

### Normalization
```
For each RIASEC dimension:
  normalized = weighted_raw_score / max_possible_weighted_score

Result: 6 floats in range [0.0, 1.0]
```

### Matching
Cosine similarity between student's `HollandCodes.asVector` and each Beruf's `personality_fit` vector. Score mapped to 0-100% compatibility.

## Gamification System

### XP & Levels
- Grid tile selection: +10 XP per pick
- Scenario answer: +15 XP
- Speed bonus (answer within 5s): +5 XP
- Total possible: ~310-340 XP

**Levels:**
| Level | XP Threshold | Title | Badge |
|-------|-------------|-------|-------|
| 1 | 0 | Entdecker/in | magnifyingglass.circle.fill |
| 2 | 120 | Profi | star.circle.fill |
| 3 | 250 | Persoenlichkeits-Guru | crown.fill |

Level-up triggers: particle burst animation + haptic (`.success`) + badge toast

### Phase Completion Celebrations
- Phase 1 complete → confetti particles + "Morgen geplant!" badge + haptic
- Phase 2 complete → different particle color + "Tag komplett!" badge + haptic
- Phase 3 complete → big celebration + "Typ erkannt!" badge + haptic

### Progressive Personality Reveal
- After Phase 1: Blurred radar chart, text "Dein Profil nimmt Form an..."
- After Phase 2: Radar chart 60% visible, 2 strongest dimensions shown
- After Phase 3: Full reveal with unblur animation

### Speed Bonus
- Timer starts when scenario question appears
- Answer within 5 seconds → "+5 XP" toast in corner
- No penalty for slow answers, purely a bonus

### Final Reveal Ceremony
- Card-pack opening animation for top-3 matching Berufsfelder
- Cards flip one by one: Gold (best match) → Silver → Bronze
- Each card shows: Beruf name, match %, Berufsfeld icon
- Share button: generates image "Mein Typ: [CODE] — [Title]"

## Data Model Changes

### New QuizPhase enum
```swift
enum QuizPhase: Int, CaseIterable {
    case morning = 1   // Grid picks
    case afternoon = 2 // Grid picks
    case scenarios = 3 // Multiple choice
}
```

### New ActivityTile model
```swift
struct ActivityTile: Identifiable {
    let id: String
    let label: String
    let iconName: String
    let scores: [QuizDimension: Double]
    var isSelected: Bool = false
}
```

### Updated QuizDimension
Add WorkValue cases:
```swift
enum QuizDimension {
    // RIASEC
    case realistic, investigative, artistic, social, enterprising, conventional
    // Work Values
    case teamwork, independence, creativity, stability
    case variety, helpingOthers, physicalActivity, technology
}
```

### Gamification State
```swift
struct QuizGamificationState {
    var xp: Int = 0
    var level: Int = 1
    var earnedBadges: [QuizBadge] = []
    var currentPhase: QuizPhase = .morning
    var phaseCompleted: [QuizPhase: Bool] = [:]
    var speedBonusCount: Int = 0
}
```

## Files to Create/Modify

### New files:
- `LehrMatch/Features/Onboarding/Models/QuizContent.swift` — All 32 grid tiles + 10 scenario questions
- `LehrMatch/Features/Onboarding/Models/ActivityTile.swift` — ActivityTile model
- `LehrMatch/Features/Onboarding/Models/QuizGamification.swift` — XP, levels, badges
- `LehrMatch/Features/Onboarding/Views/ActivityGridView.swift` — 4x4 tappable grid
- `LehrMatch/Features/Onboarding/Views/ActivityTileView.swift` — Single tile component
- `LehrMatch/Features/Onboarding/Views/QuizProgressHeader.swift` — XP bar, level, phase indicator
- `LehrMatch/Features/Onboarding/Views/PersonalityRevealView.swift` — Radar chart + card-pack reveal
- `LehrMatch/Features/Onboarding/Views/PhaseTransitionView.swift` — Celebration animation between phases
- `LehrMatch/Features/Onboarding/Views/RadarChartView.swift` — Hexagonal RIASEC radar chart

### Modified files:
- `LehrMatch/Features/Onboarding/Models/PersonalityProfile.swift` — Add new QuizDimension cases, ActivityTile model
- `LehrMatch/Features/Onboarding/ViewModels/PersonalityQuizViewModel.swift` — Rewrite for 3-phase flow, grid scoring, gamification state
- `LehrMatch/Features/Onboarding/Views/PersonalityQuizView.swift` — Orchestrate 3 phases + gamification UI
