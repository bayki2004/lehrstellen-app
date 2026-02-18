# "Build Your Day" Personality Quiz — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 10-question sample quiz with a gamified 26-question, 3-phase "Build Your Day" personality assessment that produces reliable RIASEC profiles for Lehrstellen matching.

**Architecture:** Three quiz phases (morning grid → afternoon grid → scenario questions) orchestrated by a single `PersonalityQuizViewModel`. Each phase has its own SwiftUI view. A gamification layer (XP, levels, badges, celebrations) runs across all phases. The scoring engine normalizes weighted RIASEC scores into a `HollandCodes` vector stored in the existing `PersonalityProfile` model.

**Tech Stack:** SwiftUI (iOS 26), Swift 6, @Observable macro, @MainActor concurrency, existing Theme design system, XCTest for unit tests.

**Design doc:** `docs/plans/2026-02-17-personality-quiz-design.md`

---

## Task 1: Add Test Target to project.yml

The project has no test target yet. We need one for TDD.

**Files:**
- Modify: `project.yml`

**Step 1: Add the test target to project.yml**

Add after the `LehrMatch` target:

```yaml
  LehrMatchTests:
    type: bundle.unit-test
    platform: iOS
    sources:
      - path: LehrMatchTests
        excludes:
          - "**/.DS_Store"
    dependencies:
      - target: LehrMatch
    settings:
      base:
        GENERATE_INFOPLIST_FILE: true
        PRODUCT_BUNDLE_IDENTIFIER: ch.lehrmatch.tests
```

**Step 2: Create test directory and placeholder**

```bash
mkdir -p LehrMatchTests
```

Create `LehrMatchTests/LehrMatchTests.swift`:

```swift
import XCTest
@testable import LehrMatch

final class LehrMatchTests: XCTestCase {
    func testPlaceholder() {
        XCTAssertTrue(true)
    }
}
```

**Step 3: Regenerate project and verify**

```bash
xcodegen generate
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatchTests -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test -quiet 2>&1 | tail -5
```

Expected: `Test Suite 'All tests' passed`

**Step 4: Commit**

```bash
git add project.yml LehrMatchTests/
git commit -m "chore: add unit test target"
```

---

## Task 2: Data Models — QuizDimension, ActivityTile, QuizPhase

Update existing models and create new ones for the 3-phase quiz.

**Files:**
- Modify: `LehrMatch/Features/Onboarding/Models/PersonalityProfile.swift`
- Create: `LehrMatch/Features/Onboarding/Models/ActivityTile.swift`
- Test: `LehrMatchTests/QuizModelsTests.swift`

**Step 1: Write tests for the new models**

Create `LehrMatchTests/QuizModelsTests.swift`:

```swift
import XCTest
@testable import LehrMatch

final class QuizModelsTests: XCTestCase {

    // MARK: - QuizDimension

    func testQuizDimensionHasAllRIASECCases() {
        let riasec: [QuizDimension] = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        XCTAssertEqual(riasec.count, 6)
    }

    func testQuizDimensionHasAllWorkValueCases() {
        let values: [QuizDimension] = [.teamwork, .independence, .creativity, .stability, .variety, .helpingOthers, .physicalActivity, .technology]
        XCTAssertEqual(values.count, 8)
    }

    func testQuizDimensionIsRIASEC() {
        XCTAssertTrue(QuizDimension.realistic.isRIASEC)
        XCTAssertTrue(QuizDimension.conventional.isRIASEC)
        XCTAssertFalse(QuizDimension.teamwork.isRIASEC)
        XCTAssertFalse(QuizDimension.technology.isRIASEC)
    }

    // MARK: - ActivityTile

    func testActivityTileStartsUnselected() {
        let tile = ActivityTile(id: "t1", label: "Test", iconName: "star", scores: [.realistic: 1.0])
        XCTAssertFalse(tile.isSelected)
    }

    func testActivityTileScores() {
        let tile = ActivityTile(id: "t1", label: "Maschine", iconName: "gearshape.2", scores: [.realistic: 1.0, .investigative: 0.3])
        XCTAssertEqual(tile.scores[.realistic], 1.0)
        XCTAssertEqual(tile.scores[.investigative], 0.3)
        XCTAssertNil(tile.scores[.artistic])
    }

    // MARK: - QuizPhase

    func testQuizPhaseOrdering() {
        XCTAssertTrue(QuizPhase.morning.rawValue < QuizPhase.afternoon.rawValue)
        XCTAssertTrue(QuizPhase.afternoon.rawValue < QuizPhase.scenarios.rawValue)
    }

    func testQuizPhaseRequiredPicks() {
        XCTAssertEqual(QuizPhase.morning.requiredPicks, 8)
        XCTAssertEqual(QuizPhase.afternoon.requiredPicks, 8)
        XCTAssertEqual(QuizPhase.scenarios.requiredPicks, 10)
    }

    func testQuizPhaseTitle() {
        XCTAssertEqual(QuizPhase.morning.title, "Dein Morgen")
        XCTAssertEqual(QuizPhase.afternoon.title, "Dein Nachmittag")
        XCTAssertEqual(QuizPhase.scenarios.title, "Was zählt für dich?")
    }
}
```

**Step 2: Run tests — verify they fail**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatchTests -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test -quiet 2>&1 | tail -10
```

Expected: Compilation errors (missing types).

**Step 3: Update QuizDimension in PersonalityProfile.swift**

Replace the existing `QuizDimension` enum in `PersonalityProfile.swift`:

```swift
enum QuizDimension: String, CaseIterable, Codable {
    // RIASEC (Holland Codes)
    case realistic, investigative, artistic, social, enterprising, conventional
    // Work Values
    case teamwork, independence, creativity, stability
    case variety, helpingOthers, physicalActivity, technology

    var isRIASEC: Bool {
        switch self {
        case .realistic, .investigative, .artistic, .social, .enterprising, .conventional:
            return true
        default:
            return false
        }
    }

    var isWorkValue: Bool { !isRIASEC }
}
```

**Step 4: Create ActivityTile.swift**

Create `LehrMatch/Features/Onboarding/Models/ActivityTile.swift`:

```swift
import Foundation

struct ActivityTile: Identifiable {
    let id: String
    let label: String
    let iconName: String
    let scores: [QuizDimension: Double]
    var isSelected: Bool = false
}

enum QuizPhase: Int, CaseIterable {
    case morning = 1
    case afternoon = 2
    case scenarios = 3

    var title: String {
        switch self {
        case .morning: "Dein Morgen"
        case .afternoon: "Dein Nachmittag"
        case .scenarios: "Was zählt für dich?"
        }
    }

    var subtitle: String {
        switch self {
        case .morning: "Am Morgen würdest du am liebsten..."
        case .afternoon: "Am Nachmittag wärst du am liebsten..."
        case .scenarios: "Ein paar Fragen zu deinen Werten"
        }
    }

    var requiredPicks: Int {
        switch self {
        case .morning: 8
        case .afternoon: 8
        case .scenarios: 10
        }
    }

    var phaseWeight: Double {
        switch self {
        case .morning: 0.3
        case .afternoon: 0.3
        case .scenarios: 0.4
        }
    }
}
```

**Step 5: Run tests — verify they pass**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatchTests -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test -quiet 2>&1 | tail -10
```

Expected: All tests pass.

**Step 6: Commit**

```bash
git add LehrMatch/Features/Onboarding/Models/ActivityTile.swift LehrMatch/Features/Onboarding/Models/PersonalityProfile.swift LehrMatchTests/QuizModelsTests.swift
git commit -m "feat: add quiz data models (QuizPhase, ActivityTile, updated QuizDimension)"
```

---

## Task 3: Gamification Models — XP, Levels, Badges

**Files:**
- Create: `LehrMatch/Features/Onboarding/Models/QuizGamification.swift`
- Test: `LehrMatchTests/QuizGamificationTests.swift`

**Step 1: Write tests**

Create `LehrMatchTests/QuizGamificationTests.swift`:

```swift
import XCTest
@testable import LehrMatch

final class QuizGamificationTests: XCTestCase {

    func testInitialState() {
        let state = QuizGamificationState()
        XCTAssertEqual(state.xp, 0)
        XCTAssertEqual(state.level, 1)
        XCTAssertEqual(state.levelTitle, "Entdecker/in")
        XCTAssertTrue(state.earnedBadges.isEmpty)
    }

    func testAddXPStaysLevel1() {
        var state = QuizGamificationState()
        let leveled = state.addXP(50)
        XCTAssertEqual(state.xp, 50)
        XCTAssertEqual(state.level, 1)
        XCTAssertFalse(leveled)
    }

    func testAddXPTriggersLevel2() {
        var state = QuizGamificationState()
        _ = state.addXP(100)
        let leveled = state.addXP(25)
        XCTAssertEqual(state.xp, 125)
        XCTAssertEqual(state.level, 2)
        XCTAssertEqual(state.levelTitle, "Profi")
        XCTAssertTrue(leveled)
    }

    func testAddXPTriggersLevel3() {
        var state = QuizGamificationState()
        _ = state.addXP(245)
        let leveled = state.addXP(10)
        XCTAssertEqual(state.level, 3)
        XCTAssertEqual(state.levelTitle, "Persönlichkeits-Guru")
        XCTAssertTrue(leveled)
    }

    func testLevelDoesNotExceed3() {
        var state = QuizGamificationState()
        _ = state.addXP(500)
        XCTAssertEqual(state.level, 3)
    }

    func testEarnBadge() {
        var state = QuizGamificationState()
        state.earnBadge(.morningComplete)
        XCTAssertEqual(state.earnedBadges.count, 1)
        XCTAssertEqual(state.earnedBadges.first, .morningComplete)
    }

    func testNoDuplicateBadges() {
        var state = QuizGamificationState()
        state.earnBadge(.morningComplete)
        state.earnBadge(.morningComplete)
        XCTAssertEqual(state.earnedBadges.count, 1)
    }

    func testXPPerGridPick() {
        XCTAssertEqual(QuizGamificationState.xpPerGridPick, 10)
    }

    func testXPPerScenarioAnswer() {
        XCTAssertEqual(QuizGamificationState.xpPerScenarioAnswer, 15)
    }

    func testXPSpeedBonus() {
        XCTAssertEqual(QuizGamificationState.xpSpeedBonus, 5)
    }

    func testProgressToNextLevel() {
        var state = QuizGamificationState()
        _ = state.addXP(60)
        // Level 1: 0-119, so progress = 60/120 = 0.5
        XCTAssertEqual(state.progressToNextLevel, 0.5, accuracy: 0.01)
    }

    func testProgressAtMaxLevel() {
        var state = QuizGamificationState()
        _ = state.addXP(300)
        XCTAssertEqual(state.progressToNextLevel, 1.0)
    }
}
```

**Step 2: Run tests — verify they fail**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatchTests -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test -quiet 2>&1 | tail -10
```

**Step 3: Create QuizGamification.swift**

Create `LehrMatch/Features/Onboarding/Models/QuizGamification.swift`:

```swift
import Foundation

struct QuizGamificationState {
    var xp: Int = 0
    var level: Int = 1
    var earnedBadges: [QuizBadge] = []
    var speedBonusCount: Int = 0

    static let xpPerGridPick = 10
    static let xpPerScenarioAnswer = 15
    static let xpSpeedBonus = 5
    static let speedBonusThreshold: TimeInterval = 5.0

    private static let levelThresholds = [0, 120, 250]
    private static let levelTitles = ["Entdecker/in", "Profi", "Persönlichkeits-Guru"]
    private static let levelIcons = ["magnifyingglass.circle.fill", "star.circle.fill", "crown.fill"]

    var levelTitle: String {
        Self.levelTitles[min(level - 1, Self.levelTitles.count - 1)]
    }

    var levelIcon: String {
        Self.levelIcons[min(level - 1, Self.levelIcons.count - 1)]
    }

    var progressToNextLevel: Double {
        let maxLevel = Self.levelThresholds.count
        guard level < maxLevel else { return 1.0 }
        let currentThreshold = Self.levelThresholds[level - 1]
        let nextThreshold = Self.levelThresholds[level]
        let range = nextThreshold - currentThreshold
        guard range > 0 else { return 1.0 }
        return Double(xp - currentThreshold) / Double(range)
    }

    /// Adds XP and returns true if a level-up occurred.
    @discardableResult
    mutating func addXP(_ amount: Int) -> Bool {
        let oldLevel = level
        xp += amount
        // Recalculate level
        let maxLevel = Self.levelThresholds.count
        for i in stride(from: maxLevel - 1, through: 0, by: -1) {
            if xp >= Self.levelThresholds[i] {
                level = i + 1
                break
            }
        }
        return level > oldLevel
    }

    mutating func earnBadge(_ badge: QuizBadge) {
        guard !earnedBadges.contains(badge) else { return }
        earnedBadges.append(badge)
    }
}

enum QuizBadge: String, CaseIterable {
    case morningComplete = "Morgen geplant!"
    case afternoonComplete = "Tag komplett!"
    case quizComplete = "Typ erkannt!"

    var iconName: String {
        switch self {
        case .morningComplete: "sunrise.fill"
        case .afternoonComplete: "sunset.fill"
        case .quizComplete: "sparkles"
        }
    }
}
```

**Step 4: Run tests — verify they pass**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatchTests -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test -quiet 2>&1 | tail -10
```

Expected: All tests pass.

**Step 5: Commit**

```bash
git add LehrMatch/Features/Onboarding/Models/QuizGamification.swift LehrMatchTests/QuizGamificationTests.swift
git commit -m "feat: add gamification model (XP, levels, badges)"
```

---

## Task 4: Quiz Content — All 32 Tiles + 10 Scenario Questions

This is the training data. All content lives in one file for easy editing.

**Files:**
- Create: `LehrMatch/Features/Onboarding/Models/QuizContent.swift`
- Test: `LehrMatchTests/QuizContentTests.swift`

**Step 1: Write tests**

Create `LehrMatchTests/QuizContentTests.swift`:

```swift
import XCTest
@testable import LehrMatch

final class QuizContentTests: XCTestCase {

    // MARK: - Grid Tiles

    func testMorningTilesCount() {
        XCTAssertEqual(QuizContent.morningTiles.count, 16)
    }

    func testAfternoonTilesCount() {
        XCTAssertEqual(QuizContent.afternoonTiles.count, 16)
    }

    func testAllTileIdsAreUnique() {
        let allTiles = QuizContent.morningTiles + QuizContent.afternoonTiles
        let ids = allTiles.map(\.id)
        XCTAssertEqual(ids.count, Set(ids).count, "Duplicate tile IDs found")
    }

    func testEachTileHasAtLeastOneScore() {
        let allTiles = QuizContent.morningTiles + QuizContent.afternoonTiles
        for tile in allTiles {
            XCTAssertFalse(tile.scores.isEmpty, "Tile '\(tile.label)' has no scores")
        }
    }

    func testMorningTilesCoverAllRIASECDimensions() {
        let dimensions = Set(QuizContent.morningTiles.flatMap { $0.scores.keys }.filter(\.isRIASEC))
        let allRIASEC: Set<QuizDimension> = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        XCTAssertEqual(dimensions, allRIASEC, "Morning tiles don't cover all RIASEC dimensions")
    }

    func testAfternoonTilesCoverAllRIASECDimensions() {
        let dimensions = Set(QuizContent.afternoonTiles.flatMap { $0.scores.keys }.filter(\.isRIASEC))
        let allRIASEC: Set<QuizDimension> = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        XCTAssertEqual(dimensions, allRIASEC, "Afternoon tiles don't cover all RIASEC dimensions")
    }

    func testEachRIASECDimensionHasMinimum2MorningTiles() {
        let riasec: [QuizDimension] = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        for dim in riasec {
            let count = QuizContent.morningTiles.filter { $0.scores[dim] != nil }.count
            XCTAssertGreaterThanOrEqual(count, 2, "Morning: dimension \(dim) only has \(count) tiles (need >=2)")
        }
    }

    func testEachRIASECDimensionHasMinimum2AfternoonTiles() {
        let riasec: [QuizDimension] = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        for dim in riasec {
            let count = QuizContent.afternoonTiles.filter { $0.scores[dim] != nil }.count
            XCTAssertGreaterThanOrEqual(count, 2, "Afternoon: dimension \(dim) only has \(count) tiles (need >=2)")
        }
    }

    // MARK: - Scenario Questions

    func testScenarioQuestionsCount() {
        XCTAssertEqual(QuizContent.scenarioQuestions.count, 10)
    }

    func testAllScenarioQuestionsHave4Options() {
        for question in QuizContent.scenarioQuestions {
            XCTAssertEqual(question.options.count, 4, "Question '\(question.text)' doesn't have 4 options")
        }
    }

    func testAllQuestionIdsAreUnique() {
        let ids = QuizContent.scenarioQuestions.map(\.id)
        XCTAssertEqual(ids.count, Set(ids).count, "Duplicate question IDs found")
    }

    func testEachOptionHasAtLeastOneScore() {
        for question in QuizContent.scenarioQuestions {
            for option in question.options {
                XCTAssertFalse(option.scores.isEmpty, "Option '\(option.text)' in question '\(question.id)' has no scores")
            }
        }
    }

    func testScenariosCoverAllRIASECDimensions() {
        let dimensions = Set(
            QuizContent.scenarioQuestions
                .flatMap { $0.options }
                .flatMap { $0.scores.keys }
                .filter(\.isRIASEC)
        )
        let allRIASEC: Set<QuizDimension> = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        XCTAssertEqual(dimensions, allRIASEC, "Scenarios don't cover all RIASEC dimensions")
    }

    // MARK: - Overall Coverage

    func testEachRIASECDimensionTestedAtLeast5TimesTotal() {
        let riasec: [QuizDimension] = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        let allTiles = QuizContent.morningTiles + QuizContent.afternoonTiles
        let allOptions = QuizContent.scenarioQuestions.flatMap(\.options)

        for dim in riasec {
            let tileCount = allTiles.filter { $0.scores[dim] != nil }.count
            let optionCount = allOptions.filter { $0.scores[dim] != nil }.count
            let total = tileCount + optionCount
            XCTAssertGreaterThanOrEqual(total, 5, "Dimension \(dim) only tested \(total) times (need >=5)")
        }
    }
}
```

**Step 2: Run tests — verify they fail**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatchTests -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test -quiet 2>&1 | tail -10
```

**Step 3: Create QuizContent.swift**

Create `LehrMatch/Features/Onboarding/Models/QuizContent.swift`:

```swift
import Foundation

/// All quiz content for the "Build Your Day" personality assessment.
/// Edit this file to change questions, tiles, or scoring.
enum QuizContent {

    // MARK: - Phase 1: Morning Activity Tiles (16 total)

    static let morningTiles: [ActivityTile] = [
        ActivityTile(id: "m01", label: "Maschine bedienen",         iconName: "gearshape.2",                                    scores: [.realistic: 1.0, .investigative: 0.3]),
        ActivityTile(id: "m02", label: "Holz bearbeiten",           iconName: "hammer",                                         scores: [.realistic: 1.0, .artistic: 0.3]),
        ActivityTile(id: "m03", label: "Code schreiben",            iconName: "chevron.left.forwardslash.chevron.right",         scores: [.investigative: 1.0, .realistic: 0.3]),
        ActivityTile(id: "m04", label: "Experimente machen",        iconName: "flask",                                          scores: [.investigative: 1.0]),
        ActivityTile(id: "m05", label: "Logo gestalten",            iconName: "paintbrush",                                     scores: [.artistic: 1.0, .enterprising: 0.3]),
        ActivityTile(id: "m06", label: "Musik / Video produzieren", iconName: "music.note",                                     scores: [.artistic: 1.0]),
        ActivityTile(id: "m07", label: "Patienten betreuen",        iconName: "heart.text.clipboard",                           scores: [.social: 1.0]),
        ActivityTile(id: "m08", label: "Kinder unterrichten",       iconName: "book",                                           scores: [.social: 1.0, .artistic: 0.3]),
        ActivityTile(id: "m09", label: "Kunden beraten",            iconName: "person.2",                                       scores: [.social: 0.8, .enterprising: 0.5]),
        ActivityTile(id: "m10", label: "Team leiten",               iconName: "person.3.sequence",                              scores: [.enterprising: 1.0, .social: 0.3]),
        ActivityTile(id: "m11", label: "Produkte verkaufen",        iconName: "storefront",                                     scores: [.enterprising: 1.0]),
        ActivityTile(id: "m12", label: "Daten ordnen",              iconName: "tablecells",                                     scores: [.conventional: 1.0, .investigative: 0.3]),
        ActivityTile(id: "m13", label: "Büro organisieren",         iconName: "folder",                                         scores: [.conventional: 1.0]),
        ActivityTile(id: "m14", label: "Elektrisch installieren",   iconName: "bolt",                                           scores: [.realistic: 0.8, .investigative: 0.5]),
        ActivityTile(id: "m15", label: "Texte schreiben",           iconName: "doc.text",                                       scores: [.artistic: 0.5, .conventional: 0.5]),
        ActivityTile(id: "m16", label: "Projekte planen",           iconName: "calendar",                                       scores: [.enterprising: 0.5, .conventional: 0.5]),
    ]

    // MARK: - Phase 2: Afternoon Environment Tiles (16 total)

    static let afternoonTiles: [ActivityTile] = [
        ActivityTile(id: "a01", label: "Draussen arbeiten",          iconName: "sun.max",                             scores: [.realistic: 1.0]),
        ActivityTile(id: "a02", label: "In der Werkstatt",           iconName: "wrench.and.screwdriver",              scores: [.realistic: 1.0]),
        ActivityTile(id: "a03", label: "Im Labor / Techraum",        iconName: "desktopcomputer",                     scores: [.investigative: 1.0]),
        ActivityTile(id: "a04", label: "Probleme analysieren",       iconName: "magnifyingglass",                     scores: [.investigative: 1.0, .conventional: 0.3]),
        ActivityTile(id: "a05", label: "Im Atelier / Studio",        iconName: "paintpalette",                        scores: [.artistic: 1.0]),
        ActivityTile(id: "a06", label: "Auf der Bühne / vor Kamera", iconName: "video",                               scores: [.artistic: 0.8, .enterprising: 0.5]),
        ActivityTile(id: "a07", label: "Im Spital / Praxis",         iconName: "cross.case",                          scores: [.social: 1.0]),
        ActivityTile(id: "a08", label: "Menschen zuhören",           iconName: "ear",                                 scores: [.social: 1.0]),
        ActivityTile(id: "a09", label: "Verhandlungen führen",       iconName: "bubble.left.and.bubble.right",        scores: [.enterprising: 1.0]),
        ActivityTile(id: "a10", label: "Präsentationen halten",      iconName: "person.and.background.dotted",        scores: [.enterprising: 0.8, .artistic: 0.3]),
        ActivityTile(id: "a11", label: "Listen und Tabellen führen", iconName: "list.clipboard",                      scores: [.conventional: 1.0]),
        ActivityTile(id: "a12", label: "Abläufe kontrollieren",      iconName: "checklist",                           scores: [.conventional: 1.0]),
        ActivityTile(id: "a13", label: "Körperlich aktiv sein",      iconName: "figure.run",                          scores: [.realistic: 0.8, .social: 0.3]),
        ActivityTile(id: "a14", label: "Mit Zahlen arbeiten",        iconName: "function",                            scores: [.investigative: 0.5, .conventional: 0.5]),
        ActivityTile(id: "a15", label: "Events organisieren",        iconName: "party.popper",                        scores: [.enterprising: 0.5, .social: 0.5]),
        ActivityTile(id: "a16", label: "Tiere / Pflanzen pflegen",   iconName: "leaf",                                scores: [.realistic: 0.7, .social: 0.3]),
    ]

    // MARK: - Phase 3: Scenario Questions (10 total)

    static let scenarioQuestions: [PersonalityQuestion] = [
        PersonalityQuestion(
            id: "s01",
            text: "Dein Kollege hat Stress mit einer Aufgabe. Was machst du?",
            options: [
                QuizOption(text: "Ich helfe sofort mit",               imageSystemName: "hand.raised",        scores: [.social: 1.0, .teamwork: 0.8]),
                QuizOption(text: "Ich zeige einen effizienteren Weg",  imageSystemName: "lightbulb",          scores: [.investigative: 0.8, .independence: 0.5]),
                QuizOption(text: "Ich motiviere und muntere auf",      imageSystemName: "megaphone",          scores: [.enterprising: 0.8, .social: 0.5]),
                QuizOption(text: "Ich mache mein eigenes Ding weiter", imageSystemName: "headphones",         scores: [.conventional: 0.5, .independence: 1.0]),
            ],
            dimension: .social
        ),
        PersonalityQuestion(
            id: "s02",
            text: "Dein Traum-Arbeitsweg sieht so aus:",
            options: [
                QuizOption(text: "Mit dem Velo zur Baustelle",         imageSystemName: "bicycle",            scores: [.realistic: 1.0, .physicalActivity: 0.8]),
                QuizOption(text: "Zu Fuss ins Büro in der Stadt",      imageSystemName: "building.2",         scores: [.conventional: 0.5, .stability: 0.8]),
                QuizOption(text: "Homeoffice, Laptop auf",             imageSystemName: "laptopcomputer",     scores: [.investigative: 0.8, .independence: 0.8]),
                QuizOption(text: "Egal, Hauptsache mit coolen Leuten", imageSystemName: "person.3.fill",      scores: [.social: 0.8, .teamwork: 1.0]),
            ],
            dimension: .realistic
        ),
        PersonalityQuestion(
            id: "s03",
            text: "Du gewinnst 1000 CHF. Was machst du?",
            options: [
                QuizOption(text: "Neues Werkzeug oder Gadget kaufen",  imageSystemName: "wrench.and.screwdriver",  scores: [.realistic: 0.8, .technology: 0.8]),
                QuizOption(text: "In einen Online-Kurs investieren",   imageSystemName: "graduationcap",           scores: [.investigative: 1.0, .independence: 0.5]),
                QuizOption(text: "Ein kreatives Projekt starten",      imageSystemName: "paintbrush.pointed",      scores: [.artistic: 1.0, .creativity: 1.0]),
                QuizOption(text: "Etwas mit Freunden unternehmen",     imageSystemName: "figure.2.and.child.holdinghands", scores: [.social: 0.8, .teamwork: 0.5]),
            ],
            dimension: .artistic
        ),
        PersonalityQuestion(
            id: "s04",
            text: "Welchen Social-Media-Kanal würdest du am liebsten betreiben?",
            options: [
                QuizOption(text: "DIY / Handwerk Tutorials",           imageSystemName: "hammer.circle",      scores: [.realistic: 0.8, .creativity: 0.5]),
                QuizOption(text: "Tech Reviews / Science Content",     imageSystemName: "cpu",                scores: [.investigative: 1.0, .technology: 0.8]),
                QuizOption(text: "Design / Art / Fotografie",          imageSystemName: "camera",             scores: [.artistic: 1.0, .creativity: 1.0]),
                QuizOption(text: "Lifestyle / People / Vlogs",         imageSystemName: "person.crop.circle", scores: [.social: 0.5, .enterprising: 0.5, .helpingOthers: 0.5]),
            ],
            dimension: .artistic
        ),
        PersonalityQuestion(
            id: "s05",
            text: "Was nervt dich am meisten?",
            options: [
                QuizOption(text: "Den ganzen Tag stillsitzen",             imageSystemName: "chair.lounge",       scores: [.realistic: 1.0, .physicalActivity: 1.0, .variety: 0.5]),
                QuizOption(text: "Immer das Gleiche machen",               imageSystemName: "repeat",             scores: [.artistic: 0.5, .enterprising: 0.5, .variety: 1.0]),
                QuizOption(text: "Alleine arbeiten ohne Teamkontakt",      imageSystemName: "person.slash",       scores: [.social: 1.0, .teamwork: 1.0]),
                QuizOption(text: "Chaos ohne klare Struktur",              imageSystemName: "exclamationmark.triangle", scores: [.conventional: 1.0, .stability: 1.0]),
            ],
            dimension: .conventional
        ),
        PersonalityQuestion(
            id: "s06",
            text: "Ein neues Schulprojekt steht an. Du übernimmst am liebsten:",
            options: [
                QuizOption(text: "Den praktischen Teil (bauen, basteln)", imageSystemName: "hammer",            scores: [.realistic: 1.0, .independence: 0.5]),
                QuizOption(text: "Die Recherche und Analyse",            imageSystemName: "doc.text.magnifyingglass", scores: [.investigative: 1.0, .independence: 0.8]),
                QuizOption(text: "Das Design und die Gestaltung",        imageSystemName: "paintbrush",         scores: [.artistic: 1.0, .creativity: 1.0]),
                QuizOption(text: "Die Koordination im Team",             imageSystemName: "person.3",           scores: [.enterprising: 0.8, .teamwork: 0.8]),
            ],
            dimension: .realistic
        ),
        PersonalityQuestion(
            id: "s07",
            text: "Stell dir vor, du könntest ein Problem der Welt lösen. Welches?",
            options: [
                QuizOption(text: "Kaputte Infrastruktur reparieren",       imageSystemName: "wrench",             scores: [.realistic: 1.0, .helpingOthers: 0.5]),
                QuizOption(text: "Eine Krankheit heilen",                  imageSystemName: "heart.text.clipboard", scores: [.investigative: 0.8, .social: 0.5, .helpingOthers: 1.0]),
                QuizOption(text: "Mehr Zugang zu Kunst und Kultur",        imageSystemName: "theatermasks",        scores: [.artistic: 1.0, .helpingOthers: 0.8]),
                QuizOption(text: "Einsamkeit bekämpfen",                   imageSystemName: "heart.circle",        scores: [.social: 1.0, .helpingOthers: 1.0]),
            ],
            dimension: .social
        ),
        PersonalityQuestion(
            id: "s08",
            text: "Wie lernst du am besten?",
            options: [
                QuizOption(text: "Learning by Doing — einfach ausprobieren", imageSystemName: "hand.point.up",     scores: [.realistic: 1.0, .independence: 0.5]),
                QuizOption(text: "Selber recherchieren und lesen",           imageSystemName: "book",               scores: [.investigative: 1.0, .independence: 1.0]),
                QuizOption(text: "Notizen skizzieren oder Mindmaps machen", imageSystemName: "scribble.variable",  scores: [.artistic: 0.8, .creativity: 0.5]),
                QuizOption(text: "Im Gespräch mit anderen",                 imageSystemName: "bubble.left.and.bubble.right", scores: [.social: 1.0, .teamwork: 0.8]),
            ],
            dimension: .investigative
        ),
        PersonalityQuestion(
            id: "s09",
            text: "Dein Chef sagt: «Mach einfach, wie du willst.» Wie reagierst du?",
            options: [
                QuizOption(text: "Super, ich lege direkt los!",        imageSystemName: "bolt.fill",          scores: [.realistic: 0.5, .enterprising: 0.5, .independence: 1.0]),
                QuizOption(text: "Ich mache erstmal einen Plan",       imageSystemName: "list.number",        scores: [.conventional: 1.0, .stability: 0.8]),
                QuizOption(text: "Ich frage Kollegen, was sie denken", imageSystemName: "person.2.wave.2",    scores: [.social: 0.8, .teamwork: 1.0]),
                QuizOption(text: "Ich probiere was Kreatives aus",     imageSystemName: "wand.and.stars",     scores: [.artistic: 1.0, .creativity: 1.0]),
            ],
            dimension: .enterprising
        ),
        PersonalityQuestion(
            id: "s10",
            text: "In 10 Jahren willst du:",
            options: [
                QuizOption(text: "Mein eigenes Unternehmen führen",   imageSystemName: "building",           scores: [.enterprising: 1.0, .independence: 1.0]),
                QuizOption(text: "Expert/in in meinem Fachgebiet sein", imageSystemName: "star",              scores: [.investigative: 0.8, .realistic: 0.5, .stability: 0.5]),
                QuizOption(text: "Einen Job, der Menschen hilft",     imageSystemName: "heart.fill",         scores: [.social: 1.0, .helpingOthers: 1.0]),
                QuizOption(text: "Kreative Projekte verwirklichen",   imageSystemName: "sparkles",           scores: [.artistic: 1.0, .creativity: 1.0]),
            ],
            dimension: .enterprising
        ),
    ]
}
```

**Step 4: Regenerate project and run tests**

```bash
xcodegen generate
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatchTests -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test -quiet 2>&1 | tail -15
```

Expected: All tests pass.

**Step 5: Commit**

```bash
git add LehrMatch/Features/Onboarding/Models/QuizContent.swift LehrMatchTests/QuizContentTests.swift
git commit -m "feat: add all quiz content (32 tiles + 10 scenario questions)"
```

---

## Task 5: Scoring Engine

The brain of the quiz. Computes weighted RIASEC + WorkValue scores from grid picks and scenario answers.

**Files:**
- Create: `LehrMatch/Features/Onboarding/Models/QuizScoringEngine.swift`
- Test: `LehrMatchTests/QuizScoringEngineTests.swift`

**Step 1: Write tests**

Create `LehrMatchTests/QuizScoringEngineTests.swift`:

```swift
import XCTest
@testable import LehrMatch

final class QuizScoringEngineTests: XCTestCase {

    func testEmptyInputProducesZeroScores() {
        let result = QuizScoringEngine.compute(
            morningPicks: [],
            afternoonPicks: [],
            scenarioAnswers: []
        )
        XCTAssertEqual(result.hollandCodes.realistic, 0)
        XCTAssertEqual(result.hollandCodes.investigative, 0)
    }

    func testSingleMorningPickScoresCorrectly() {
        // Pick tile m01: R: 1.0, I: 0.3
        let tile = QuizContent.morningTiles.first { $0.id == "m01" }!
        let result = QuizScoringEngine.compute(
            morningPicks: [tile],
            afternoonPicks: [],
            scenarioAnswers: []
        )
        // Morning weight = 0.3, so R = 1.0 * 0.3 = 0.3 (before normalization)
        XCTAssertGreaterThan(result.hollandCodes.realistic, 0)
        XCTAssertGreaterThan(result.hollandCodes.investigative, 0)
        XCTAssertEqual(result.hollandCodes.artistic, 0)
    }

    func testAllRealisticPicksMaximizeRealistic() {
        // Pick all tiles that score Realistic
        let realisticMorning = QuizContent.morningTiles.filter { $0.scores[.realistic] != nil }.prefix(8)
        let realisticAfternoon = QuizContent.afternoonTiles.filter { $0.scores[.realistic] != nil }.prefix(8)

        let result = QuizScoringEngine.compute(
            morningPicks: Array(realisticMorning),
            afternoonPicks: Array(realisticAfternoon),
            scenarioAnswers: []
        )
        // Realistic should be the highest dimension
        let codes = result.hollandCodes
        XCTAssertEqual(codes.dominantType, "R")
    }

    func testScenarioAnswerContributesToWorkValues() {
        // Answer s01, option 0: S: 1.0, teamwork: 0.8
        let answer = QuizAnswer(questionId: "s01", selectedOptionIndex: 0)
        let result = QuizScoringEngine.compute(
            morningPicks: [],
            afternoonPicks: [],
            scenarioAnswers: [answer]
        )
        XCTAssertGreaterThan(result.workValues.teamwork, 0)
        XCTAssertGreaterThan(result.hollandCodes.social, 0)
    }

    func testNormalizationStaysWithinBounds() {
        // Full quiz with 8+8 picks and 10 answers
        let morningPicks = Array(QuizContent.morningTiles.prefix(8))
        let afternoonPicks = Array(QuizContent.afternoonTiles.prefix(8))
        let answers = QuizContent.scenarioQuestions.enumerated().map { index, q in
            QuizAnswer(questionId: q.id, selectedOptionIndex: index % 4)
        }

        let result = QuizScoringEngine.compute(
            morningPicks: morningPicks,
            afternoonPicks: afternoonPicks,
            scenarioAnswers: answers
        )

        let codes = result.hollandCodes
        for value in codes.asVector {
            XCTAssertGreaterThanOrEqual(value, 0.0, "RIASEC score below 0")
            XCTAssertLessThanOrEqual(value, 1.0, "RIASEC score above 1")
        }
    }

    func testTopThreeCodesReturnsThreeLetters() {
        let morningPicks = Array(QuizContent.morningTiles.prefix(8))
        let afternoonPicks = Array(QuizContent.afternoonTiles.prefix(8))
        let result = QuizScoringEngine.compute(
            morningPicks: morningPicks,
            afternoonPicks: afternoonPicks,
            scenarioAnswers: []
        )
        XCTAssertEqual(result.hollandCodes.topThreeCodes.count, 3)
    }
}
```

**Step 2: Run tests — verify they fail**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatchTests -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test -quiet 2>&1 | tail -10
```

**Step 3: Create QuizScoringEngine.swift**

Create `LehrMatch/Features/Onboarding/Models/QuizScoringEngine.swift`:

```swift
import Foundation

enum QuizScoringEngine {

    struct Result {
        var hollandCodes: HollandCodes
        var workValues: WorkValues
    }

    /// Compute the final personality profile from all quiz phases.
    static func compute(
        morningPicks: [ActivityTile],
        afternoonPicks: [ActivityTile],
        scenarioAnswers: [QuizAnswer]
    ) -> Result {
        var rawRIASEC: [QuizDimension: Double] = [:]
        var rawWorkValues: [QuizDimension: Double] = [:]

        // Phase 1: Morning grid (weight 0.3)
        let morningWeight = QuizPhase.morning.phaseWeight
        for tile in morningPicks {
            for (dim, score) in tile.scores {
                if dim.isRIASEC {
                    rawRIASEC[dim, default: 0] += score * morningWeight
                } else {
                    rawWorkValues[dim, default: 0] += score * morningWeight
                }
            }
        }

        // Phase 2: Afternoon grid (weight 0.3)
        let afternoonWeight = QuizPhase.afternoon.phaseWeight
        for tile in afternoonPicks {
            for (dim, score) in tile.scores {
                if dim.isRIASEC {
                    rawRIASEC[dim, default: 0] += score * afternoonWeight
                } else {
                    rawWorkValues[dim, default: 0] += score * afternoonWeight
                }
            }
        }

        // Phase 3: Scenarios (weight 0.4)
        let scenarioWeight = QuizPhase.scenarios.phaseWeight
        let questions = QuizContent.scenarioQuestions
        for answer in scenarioAnswers {
            guard let question = questions.first(where: { $0.id == answer.questionId }),
                  answer.selectedOptionIndex < question.options.count else { continue }
            let option = question.options[answer.selectedOptionIndex]
            for (dim, score) in option.scores {
                if dim.isRIASEC {
                    rawRIASEC[dim, default: 0] += score * scenarioWeight
                } else {
                    rawWorkValues[dim, default: 0] += score * scenarioWeight
                }
            }
        }

        // Normalize RIASEC to [0, 1]
        // Max possible per dimension: ~8 picks * 1.0 * 0.3 (morning) + 8 * 1.0 * 0.3 (afternoon) + ~3 * 1.0 * 0.4 (scenarios) ≈ 6.0
        // Use actual max across all dimensions for relative scaling
        let maxRIASEC = max(rawRIASEC.values.max() ?? 1.0, 0.001)
        let maxWorkValue = max(rawWorkValues.values.max() ?? 1.0, 0.001)

        var holland = HollandCodes()
        holland.realistic     = min((rawRIASEC[.realistic] ?? 0) / maxRIASEC, 1.0)
        holland.investigative = min((rawRIASEC[.investigative] ?? 0) / maxRIASEC, 1.0)
        holland.artistic      = min((rawRIASEC[.artistic] ?? 0) / maxRIASEC, 1.0)
        holland.social        = min((rawRIASEC[.social] ?? 0) / maxRIASEC, 1.0)
        holland.enterprising  = min((rawRIASEC[.enterprising] ?? 0) / maxRIASEC, 1.0)
        holland.conventional  = min((rawRIASEC[.conventional] ?? 0) / maxRIASEC, 1.0)

        var values = WorkValues()
        values.teamwork        = min((rawWorkValues[.teamwork] ?? 0) / maxWorkValue, 1.0)
        values.independence    = min((rawWorkValues[.independence] ?? 0) / maxWorkValue, 1.0)
        values.creativity      = min((rawWorkValues[.creativity] ?? 0) / maxWorkValue, 1.0)
        values.stability       = min((rawWorkValues[.stability] ?? 0) / maxWorkValue, 1.0)
        values.variety         = min((rawWorkValues[.variety] ?? 0) / maxWorkValue, 1.0)
        values.helpingOthers   = min((rawWorkValues[.helpingOthers] ?? 0) / maxWorkValue, 1.0)
        values.physicalActivity = min((rawWorkValues[.physicalActivity] ?? 0) / maxWorkValue, 1.0)
        values.technology      = min((rawWorkValues[.technology] ?? 0) / maxWorkValue, 1.0)

        return Result(hollandCodes: holland, workValues: values)
    }
}
```

**Step 4: Run tests — verify they pass**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatchTests -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test -quiet 2>&1 | tail -10
```

Expected: All tests pass.

**Step 5: Commit**

```bash
git add LehrMatch/Features/Onboarding/Models/QuizScoringEngine.swift LehrMatchTests/QuizScoringEngineTests.swift
git commit -m "feat: add quiz scoring engine with weighted RIASEC normalization"
```

---

## Task 6: PersonalityQuizViewModel — 3-Phase Orchestration + Gamification

Rewrite the ViewModel to manage all 3 phases, grid state, scenario flow, gamification, and scoring.

**Files:**
- Modify: `LehrMatch/Features/Onboarding/ViewModels/PersonalityQuizViewModel.swift`
- Test: `LehrMatchTests/PersonalityQuizViewModelTests.swift`

**Step 1: Write tests**

Create `LehrMatchTests/PersonalityQuizViewModelTests.swift`:

```swift
import XCTest
@testable import LehrMatch

@MainActor
final class PersonalityQuizViewModelTests: XCTestCase {

    private func makeVM() -> PersonalityQuizViewModel {
        PersonalityQuizViewModel(apiClient: APIClient(), studentId: UUID())
    }

    func testInitialPhaseIsMorning() {
        let vm = makeVM()
        XCTAssertEqual(vm.currentPhase, .morning)
    }

    func testMorningTilesAre16AndShuffled() {
        let vm1 = makeVM()
        let vm2 = makeVM()
        XCTAssertEqual(vm1.currentTiles.count, 16)
        // Shuffled: at least *possible* the order differs (non-deterministic, but validates count)
        XCTAssertEqual(vm2.currentTiles.count, 16)
    }

    func testSelectingTileToggles() {
        let vm = makeVM()
        let tileId = vm.currentTiles[0].id
        vm.toggleTile(tileId)
        XCTAssertTrue(vm.currentTiles.first { $0.id == tileId }!.isSelected)
        vm.toggleTile(tileId)
        XCTAssertFalse(vm.currentTiles.first { $0.id == tileId }!.isSelected)
    }

    func testCannotSelectMoreThan8Tiles() {
        let vm = makeVM()
        for i in 0..<9 {
            vm.toggleTile(vm.currentTiles[i].id)
        }
        let selectedCount = vm.currentTiles.filter(\.isSelected).count
        XCTAssertEqual(selectedCount, 8, "Should cap at 8 selections")
    }

    func testSelectingTileAddsXP() {
        let vm = makeVM()
        vm.toggleTile(vm.currentTiles[0].id)
        XCTAssertEqual(vm.gamification.xp, QuizGamificationState.xpPerGridPick)
    }

    func testDeselectingTileRemovesXP() {
        let vm = makeVM()
        vm.toggleTile(vm.currentTiles[0].id)
        vm.toggleTile(vm.currentTiles[0].id)
        XCTAssertEqual(vm.gamification.xp, 0)
    }

    func testCanAdvancePhaseWhen8Selected() {
        let vm = makeVM()
        XCTAssertFalse(vm.canAdvancePhase)
        for i in 0..<8 {
            vm.toggleTile(vm.currentTiles[i].id)
        }
        XCTAssertTrue(vm.canAdvancePhase)
    }

    func testAdvanceFromMorningToAfternoon() {
        let vm = makeVM()
        for i in 0..<8 { vm.toggleTile(vm.currentTiles[i].id) }
        vm.advancePhase()
        XCTAssertEqual(vm.currentPhase, .afternoon)
        XCTAssertEqual(vm.currentTiles.count, 16)
        XCTAssertTrue(vm.gamification.earnedBadges.contains(.morningComplete))
    }

    func testAdvanceFromAfternoonToScenarios() {
        let vm = makeVM()
        // Complete morning
        for i in 0..<8 { vm.toggleTile(vm.currentTiles[i].id) }
        vm.advancePhase()
        // Complete afternoon
        for i in 0..<8 { vm.toggleTile(vm.currentTiles[i].id) }
        vm.advancePhase()
        XCTAssertEqual(vm.currentPhase, .scenarios)
        XCTAssertTrue(vm.gamification.earnedBadges.contains(.afternoonComplete))
    }

    func testScenarioAnswerAdvancesQuestion() {
        let vm = makeVM()
        // Skip to scenarios
        for i in 0..<8 { vm.toggleTile(vm.currentTiles[i].id) }
        vm.advancePhase()
        for i in 0..<8 { vm.toggleTile(vm.currentTiles[i].id) }
        vm.advancePhase()

        XCTAssertEqual(vm.currentScenarioIndex, 0)
        vm.answerScenario(optionIndex: 0)
        XCTAssertEqual(vm.currentScenarioIndex, 1)
    }

    func testCompletingAllScenariosProducesProfile() {
        let vm = makeVM()
        // Complete morning
        for i in 0..<8 { vm.toggleTile(vm.currentTiles[i].id) }
        vm.advancePhase()
        // Complete afternoon
        for i in 0..<8 { vm.toggleTile(vm.currentTiles[i].id) }
        vm.advancePhase()
        // Answer all 10 scenarios
        for _ in 0..<10 { vm.answerScenario(optionIndex: 0) }

        XCTAssertNotNil(vm.personalityProfile)
        XCTAssertTrue(vm.isComplete)
        XCTAssertTrue(vm.gamification.earnedBadges.contains(.quizComplete))
    }

    func testOverallProgress() {
        let vm = makeVM()
        XCTAssertEqual(vm.overallProgress, 0, accuracy: 0.01)

        // Select 4 morning tiles (4/26 = ~0.15)
        for i in 0..<4 { vm.toggleTile(vm.currentTiles[i].id) }
        XCTAssertEqual(vm.overallProgress, 4.0 / 26.0, accuracy: 0.01)
    }
}
```

**Step 2: Run tests — verify they fail**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatchTests -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test -quiet 2>&1 | tail -10
```

**Step 3: Rewrite PersonalityQuizViewModel.swift**

Replace the contents of `LehrMatch/Features/Onboarding/ViewModels/PersonalityQuizViewModel.swift`:

```swift
import Foundation

@MainActor
@Observable
final class PersonalityQuizViewModel {
    // MARK: - State

    private(set) var currentPhase: QuizPhase = .morning
    private(set) var morningTiles: [ActivityTile]
    private(set) var afternoonTiles: [ActivityTile]
    private(set) var scenarioAnswers: [QuizAnswer] = []
    private(set) var currentScenarioIndex = 0
    private(set) var personalityProfile: PersonalityProfile?
    var gamification = QuizGamificationState()

    // Speed bonus tracking
    private var scenarioStartTime: Date?

    private let apiClient: APIClient
    private let studentId: UUID

    // MARK: - Init

    init(apiClient: APIClient, studentId: UUID) {
        self.apiClient = apiClient
        self.studentId = studentId
        self.morningTiles = QuizContent.morningTiles.shuffled()
        self.afternoonTiles = QuizContent.afternoonTiles.shuffled()
    }

    // MARK: - Computed Properties

    var currentTiles: [ActivityTile] {
        get {
            switch currentPhase {
            case .morning: morningTiles
            case .afternoon: afternoonTiles
            case .scenarios: []
            }
        }
        set {
            switch currentPhase {
            case .morning: morningTiles = newValue
            case .afternoon: afternoonTiles = newValue
            case .scenarios: break
            }
        }
    }

    var selectedCount: Int {
        currentTiles.filter(\.isSelected).count
    }

    var canAdvancePhase: Bool {
        switch currentPhase {
        case .morning, .afternoon:
            selectedCount >= currentPhase.requiredPicks
        case .scenarios:
            false
        }
    }

    var isComplete: Bool {
        personalityProfile != nil
    }

    var currentScenarioQuestion: PersonalityQuestion? {
        guard currentPhase == .scenarios,
              currentScenarioIndex < QuizContent.scenarioQuestions.count else { return nil }
        return QuizContent.scenarioQuestions[currentScenarioIndex]
    }

    /// Overall progress across all 3 phases (0.0 to 1.0)
    var overallProgress: Double {
        let totalSteps = 26.0 // 8 + 8 + 10
        var completed = 0.0

        switch currentPhase {
        case .morning:
            completed = Double(morningTiles.filter(\.isSelected).count)
        case .afternoon:
            completed = 8 + Double(afternoonTiles.filter(\.isSelected).count)
        case .scenarios:
            completed = 16 + Double(currentScenarioIndex)
        }

        return completed / totalSteps
    }

    // MARK: - Grid Actions

    func toggleTile(_ tileId: String) {
        let tiles = currentTiles
        guard let index = tiles.firstIndex(where: { $0.id == tileId }) else { return }

        if tiles[index].isSelected {
            // Deselect
            currentTiles[index].isSelected = false
            gamification.addXP(-QuizGamificationState.xpPerGridPick)
        } else {
            // Only allow up to requiredPicks selections
            guard selectedCount < currentPhase.requiredPicks else { return }
            currentTiles[index].isSelected = true
            gamification.addXP(QuizGamificationState.xpPerGridPick)
        }
    }

    func advancePhase() {
        switch currentPhase {
        case .morning:
            gamification.earnBadge(.morningComplete)
            currentPhase = .afternoon
        case .afternoon:
            gamification.earnBadge(.afternoonComplete)
            currentPhase = .scenarios
            scenarioStartTime = .now
        case .scenarios:
            break
        }
    }

    // MARK: - Scenario Actions

    func answerScenario(optionIndex: Int) {
        guard let question = currentScenarioQuestion else { return }

        let answer = QuizAnswer(questionId: question.id, selectedOptionIndex: optionIndex)
        scenarioAnswers.append(answer)

        // XP
        var xp = QuizGamificationState.xpPerScenarioAnswer
        if let start = scenarioStartTime, Date.now.timeIntervalSince(start) < QuizGamificationState.speedBonusThreshold {
            xp += QuizGamificationState.xpSpeedBonus
            gamification.speedBonusCount += 1
        }
        gamification.addXP(xp)

        currentScenarioIndex += 1
        scenarioStartTime = .now

        // Check if all scenarios answered
        if currentScenarioIndex >= QuizContent.scenarioQuestions.count {
            computeProfile()
        }
    }

    // MARK: - Profile Computation

    private func computeProfile() {
        let morningPicks = morningTiles.filter(\.isSelected)
        let afternoonPicks = afternoonTiles.filter(\.isSelected)

        let result = QuizScoringEngine.compute(
            morningPicks: morningPicks,
            afternoonPicks: afternoonPicks,
            scenarioAnswers: scenarioAnswers
        )

        var profile = PersonalityProfile(studentId: studentId)
        profile.hollandCodes = result.hollandCodes
        profile.workValues = result.workValues
        profile.quizAnswersRaw = scenarioAnswers
        profile.computedAt = .now

        personalityProfile = profile
        gamification.earnBadge(.quizComplete)
    }

    func saveProfile() async throws {
        guard let profile = personalityProfile else { return }
        try await apiClient.requestVoid(
            endpoint: .personalityProfiles,
            method: .post,
            body: profile
        )
    }
}
```

**Step 4: Regenerate project and run tests**

```bash
xcodegen generate
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatchTests -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test -quiet 2>&1 | tail -15
```

Expected: All tests pass.

**Step 5: Commit**

```bash
git add LehrMatch/Features/Onboarding/ViewModels/PersonalityQuizViewModel.swift LehrMatchTests/PersonalityQuizViewModelTests.swift
git commit -m "feat: rewrite PersonalityQuizViewModel for 3-phase flow with gamification"
```

---

## Task 7: ActivityTileView — Single Tile Component

**Files:**
- Create: `LehrMatch/Features/Onboarding/Views/ActivityTileView.swift`

**Step 1: Create the tile view**

Create `LehrMatch/Features/Onboarding/Views/ActivityTileView.swift`:

```swift
import SwiftUI

struct ActivityTileView: View {
    let tile: ActivityTile
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: Theme.Spacing.sm) {
                Image(systemName: tile.iconName)
                    .font(.title2)
                    .foregroundStyle(tile.isSelected ? .white : Theme.Colors.primaryFallback)

                Text(tile.label)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(tile.isSelected ? .white : Theme.Colors.textPrimary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(Theme.Spacing.sm)
            .background(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.medium)
                    .fill(tile.isSelected
                          ? Theme.Colors.primaryFallback
                          : Theme.Colors.backgroundSecondary)
            )
            .scaleEffect(tile.isSelected ? 1.05 : 1.0)
            .animation(Theme.Animation.quick, value: tile.isSelected)
        }
        .sensoryFeedback(.selection, trigger: tile.isSelected)
    }
}
```

**Step 2: Verify build**

```bash
xcodegen generate
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatch -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -quiet build 2>&1 | tail -5
```

Expected: Build succeeded.

**Step 3: Commit**

```bash
git add LehrMatch/Features/Onboarding/Views/ActivityTileView.swift
git commit -m "feat: add ActivityTileView component"
```

---

## Task 8: ActivityGridView — 4x4 Tappable Grid

**Files:**
- Create: `LehrMatch/Features/Onboarding/Views/ActivityGridView.swift`

**Step 1: Create the grid view**

Create `LehrMatch/Features/Onboarding/Views/ActivityGridView.swift`:

```swift
import SwiftUI

struct ActivityGridView: View {
    let tiles: [ActivityTile]
    let requiredPicks: Int
    let selectedCount: Int
    let onToggle: (String) -> Void
    let onAdvance: () -> Void

    private let columns = Array(repeating: GridItem(.flexible(), spacing: Theme.Spacing.sm), count: 4)

    var body: some View {
        VStack(spacing: Theme.Spacing.md) {
            // Selection counter
            HStack {
                Text("\(selectedCount) von \(requiredPicks) ausgewählt")
                    .font(Theme.Typography.callout)
                    .foregroundStyle(Theme.Colors.textSecondary)

                Spacer()

                // Progress ring
                ZStack {
                    Circle()
                        .stroke(Theme.Colors.backgroundSecondary, lineWidth: 3)
                    Circle()
                        .trim(from: 0, to: CGFloat(selectedCount) / CGFloat(requiredPicks))
                        .stroke(Theme.Colors.primaryFallback, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                }
                .frame(width: 28, height: 28)
                .animation(Theme.Animation.quick, value: selectedCount)
            }
            .padding(.horizontal, Theme.Spacing.lg)

            // 4x4 Grid
            ScrollView {
                LazyVGrid(columns: columns, spacing: Theme.Spacing.sm) {
                    ForEach(tiles) { tile in
                        ActivityTileView(tile: tile) {
                            onToggle(tile.id)
                        }
                        .aspectRatio(1, contentMode: .fit)
                    }
                }
                .padding(.horizontal, Theme.Spacing.md)
            }

            // Advance button
            if selectedCount >= requiredPicks {
                PrimaryButton(title: "Weiter") {
                    onAdvance()
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .animation(Theme.Animation.swipeSpring, value: selectedCount)
    }
}
```

**Step 2: Verify build**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatch -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -quiet build 2>&1 | tail -5
```

**Step 3: Commit**

```bash
git add LehrMatch/Features/Onboarding/Views/ActivityGridView.swift
git commit -m "feat: add ActivityGridView (4x4 tappable tile grid)"
```

---

## Task 9: QuizProgressHeader — XP Bar, Level, Phase Indicator

**Files:**
- Create: `LehrMatch/Features/Onboarding/Views/QuizProgressHeader.swift`

**Step 1: Create the header view**

Create `LehrMatch/Features/Onboarding/Views/QuizProgressHeader.swift`:

```swift
import SwiftUI

struct QuizProgressHeader: View {
    let gamification: QuizGamificationState
    let currentPhase: QuizPhase
    let overallProgress: Double
    @State private var showLevelUp = false
    @State private var showSpeedBonus = false

    var body: some View {
        VStack(spacing: Theme.Spacing.sm) {
            // Phase indicator
            HStack(spacing: Theme.Spacing.md) {
                ForEach(QuizPhase.allCases, id: \.rawValue) { phase in
                    phaseIndicator(phase)
                }
            }

            // XP bar
            HStack(spacing: Theme.Spacing.sm) {
                Image(systemName: gamification.levelIcon)
                    .foregroundStyle(Theme.Colors.accentFallback)
                    .font(.title3)

                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text(gamification.levelTitle)
                            .font(Theme.Typography.badge)
                            .foregroundStyle(Theme.Colors.textPrimary)
                        Spacer()
                        Text("\(gamification.xp) XP")
                            .font(Theme.Typography.badge)
                            .foregroundStyle(Theme.Colors.primaryFallback)
                    }

                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Theme.Colors.backgroundSecondary)
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Theme.Colors.primaryFallback.gradient)
                                .frame(width: geo.size.width * gamification.progressToNextLevel)
                                .animation(Theme.Animation.swipeSpring, value: gamification.progressToNextLevel)
                        }
                    }
                    .frame(height: 8)
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)

            // Overall progress bar
            ProgressView(value: overallProgress)
                .tint(Theme.Colors.primaryFallback)
                .padding(.horizontal, Theme.Spacing.lg)
        }
        .padding(.vertical, Theme.Spacing.sm)
    }

    private func phaseIndicator(_ phase: QuizPhase) -> some View {
        let isActive = phase == currentPhase
        let isCompleted = phase.rawValue < currentPhase.rawValue

        return VStack(spacing: 4) {
            ZStack {
                Circle()
                    .fill(isCompleted ? Theme.Colors.compatibilityHigh : (isActive ? Theme.Colors.primaryFallback : Theme.Colors.backgroundSecondary))
                    .frame(width: 28, height: 28)

                if isCompleted {
                    Image(systemName: "checkmark")
                        .font(.caption.bold())
                        .foregroundStyle(.white)
                } else {
                    Text("\(phase.rawValue)")
                        .font(Theme.Typography.badge)
                        .foregroundStyle(isActive ? .white : Theme.Colors.textTertiary)
                }
            }

            Text(phase.title)
                .font(.system(size: 10))
                .foregroundStyle(isActive ? Theme.Colors.textPrimary : Theme.Colors.textTertiary)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity)
    }
}
```

**Step 2: Verify build**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatch -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -quiet build 2>&1 | tail -5
```

**Step 3: Commit**

```bash
git add LehrMatch/Features/Onboarding/Views/QuizProgressHeader.swift
git commit -m "feat: add QuizProgressHeader (XP bar, level, phase indicator)"
```

---

## Task 10: RadarChartView — Hexagonal RIASEC Visualization

**Files:**
- Create: `LehrMatch/Features/Onboarding/Views/RadarChartView.swift`

**Step 1: Create the radar chart**

Create `LehrMatch/Features/Onboarding/Views/RadarChartView.swift`:

```swift
import SwiftUI

struct RadarChartView: View {
    let values: [Double] // 6 RIASEC values, 0-1
    let labels: [String]
    var blurAmount: Double = 0 // 0 = clear, 20 = fully blurred

    private let lineColor = Theme.Colors.primaryFallback
    private let fillColor = Theme.Colors.primaryFallback.opacity(0.2)

    var body: some View {
        GeometryReader { geo in
            let center = CGPoint(x: geo.size.width / 2, y: geo.size.height / 2)
            let radius = min(geo.size.width, geo.size.height) / 2 - 30

            ZStack {
                // Background web
                ForEach([0.25, 0.5, 0.75, 1.0], id: \.self) { scale in
                    hexagonPath(center: center, radius: radius * scale)
                        .stroke(Theme.Colors.textTertiary.opacity(0.3), lineWidth: 0.5)
                }

                // Axis lines
                ForEach(0..<6, id: \.self) { i in
                    let angle = angleFor(index: i)
                    let point = pointAt(center: center, radius: radius, angle: angle)
                    Path { path in
                        path.move(to: center)
                        path.addLine(to: point)
                    }
                    .stroke(Theme.Colors.textTertiary.opacity(0.2), lineWidth: 0.5)
                }

                // Value shape
                valuePath(center: center, radius: radius)
                    .fill(fillColor)
                valuePath(center: center, radius: radius)
                    .stroke(lineColor, lineWidth: 2)

                // Value dots
                ForEach(0..<min(values.count, 6), id: \.self) { i in
                    let angle = angleFor(index: i)
                    let point = pointAt(center: center, radius: radius * values[i], angle: angle)
                    Circle()
                        .fill(lineColor)
                        .frame(width: 8, height: 8)
                        .position(point)
                }

                // Labels
                ForEach(0..<min(labels.count, 6), id: \.self) { i in
                    let angle = angleFor(index: i)
                    let labelPoint = pointAt(center: center, radius: radius + 20, angle: angle)
                    Text(labels[i])
                        .font(Theme.Typography.badge)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .position(labelPoint)
                }
            }
            .blur(radius: blurAmount)
        }
        .aspectRatio(1, contentMode: .fit)
    }

    private func angleFor(index: Int) -> Double {
        let slice = (2 * .pi) / 6.0
        return slice * Double(index) - .pi / 2 // Start from top
    }

    private func pointAt(center: CGPoint, radius: Double, angle: Double) -> CGPoint {
        CGPoint(
            x: center.x + radius * cos(angle),
            y: center.y + radius * sin(angle)
        )
    }

    private func hexagonPath(center: CGPoint, radius: Double) -> Path {
        Path { path in
            for i in 0..<6 {
                let angle = angleFor(index: i)
                let point = pointAt(center: center, radius: radius, angle: angle)
                if i == 0 {
                    path.move(to: point)
                } else {
                    path.addLine(to: point)
                }
            }
            path.closeSubpath()
        }
    }

    private func valuePath(center: CGPoint, radius: Double) -> Path {
        Path { path in
            for i in 0..<min(values.count, 6) {
                let angle = angleFor(index: i)
                let point = pointAt(center: center, radius: radius * max(values[i], 0.05), angle: angle)
                if i == 0 {
                    path.move(to: point)
                } else {
                    path.addLine(to: point)
                }
            }
            path.closeSubpath()
        }
    }
}
```

**Step 2: Verify build**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatch -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -quiet build 2>&1 | tail -5
```

**Step 3: Commit**

```bash
git add LehrMatch/Features/Onboarding/Views/RadarChartView.swift
git commit -m "feat: add RadarChartView (hexagonal RIASEC visualization)"
```

---

## Task 11: PhaseTransitionView — Celebration Animations

**Files:**
- Create: `LehrMatch/Features/Onboarding/Views/PhaseTransitionView.swift`

**Step 1: Create the celebration overlay**

Create `LehrMatch/Features/Onboarding/Views/PhaseTransitionView.swift`:

```swift
import SwiftUI

struct PhaseTransitionView: View {
    let badge: QuizBadge
    let onDismiss: () -> Void
    @State private var showBadge = false
    @State private var showParticles = false

    var body: some View {
        ZStack {
            // Dimmed background
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture { onDismiss() }

            VStack(spacing: Theme.Spacing.lg) {
                // Badge icon
                Image(systemName: badge.iconName)
                    .font(.system(size: 60))
                    .foregroundStyle(Theme.Colors.accentFallback.gradient)
                    .scaleEffect(showBadge ? 1.0 : 0.3)
                    .opacity(showBadge ? 1.0 : 0)

                Text(badge.rawValue)
                    .font(Theme.Typography.largeTitle)
                    .foregroundStyle(.white)
                    .scaleEffect(showBadge ? 1.0 : 0.5)
                    .opacity(showBadge ? 1.0 : 0)

                PrimaryButton(title: "Weiter") {
                    onDismiss()
                }
                .frame(width: 200)
                .opacity(showBadge ? 1.0 : 0)
            }

            // Confetti particles
            if showParticles {
                ConfettiView()
                    .allowsHitTesting(false)
            }
        }
        .onAppear {
            withAnimation(Theme.Animation.matchCelebration) {
                showBadge = true
            }
            withAnimation(Theme.Animation.matchCelebration.delay(0.2)) {
                showParticles = true
            }
        }
        .sensoryFeedback(.success, trigger: showBadge)
    }
}

/// Simple confetti particle effect using Canvas.
struct ConfettiView: View {
    @State private var particles: [ConfettiParticle] = (0..<40).map { _ in ConfettiParticle() }
    @State private var animating = false

    var body: some View {
        TimelineView(.animation) { timeline in
            Canvas { context, size in
                let time = animating ? timeline.date.timeIntervalSinceReferenceDate : 0
                for particle in particles {
                    let age = time.truncatingRemainder(dividingBy: 3.0)
                    let x = particle.startX * size.width + sin(age * particle.wobble) * 30
                    let y = age * particle.speed * size.height / 3.0
                    let opacity = max(0, 1 - age / 3.0)

                    context.opacity = opacity
                    context.fill(
                        Path(CGRect(x: x - 4, y: y - 4, width: 8, height: 8)),
                        with: .color(particle.color)
                    )
                }
            }
        }
        .onAppear { animating = true }
        .ignoresSafeArea()
    }
}

private struct ConfettiParticle {
    let startX = Double.random(in: 0...1)
    let speed = Double.random(in: 0.5...1.5)
    let wobble = Double.random(in: 2...6)
    let color: Color = [
        Theme.Colors.primaryFallback,
        Theme.Colors.accentFallback,
        Theme.Colors.compatibilityHigh,
        Color.purple, Color.orange, Color.pink
    ].randomElement()!
}
```

**Step 2: Verify build**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatch -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -quiet build 2>&1 | tail -5
```

**Step 3: Commit**

```bash
git add LehrMatch/Features/Onboarding/Views/PhaseTransitionView.swift
git commit -m "feat: add PhaseTransitionView with confetti celebration"
```

---

## Task 12: PersonalityRevealView — Card-Pack Final Reveal

**Files:**
- Create: `LehrMatch/Features/Onboarding/Views/PersonalityRevealView.swift`

**Step 1: Create the reveal view**

Create `LehrMatch/Features/Onboarding/Views/PersonalityRevealView.swift`:

```swift
import SwiftUI

struct PersonalityRevealView: View {
    let hollandCodes: HollandCodes
    let onContinue: () -> Void

    @State private var revealStage = 0 // 0=radar, 1=card1, 2=card2, 3=card3, 4=done
    private let labels = ["R", "I", "A", "S", "E", "C"]
    private let fullLabels = ["Realistisch", "Forschend", "Künstlerisch", "Sozial", "Unternehmerisch", "Konventionell"]

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                // Radar chart with animated reveal
                RadarChartView(
                    values: hollandCodes.asVector,
                    labels: labels,
                    blurAmount: revealStage >= 0 ? 0 : 10
                )
                .frame(height: 250)
                .padding(.horizontal, Theme.Spacing.lg)
                .onAppear {
                    withAnimation(Theme.Animation.standard.delay(0.3)) {
                        revealStage = 1
                    }
                }

                Text("Dein Typ: \(hollandCodes.topThreeCodes.joined())")
                    .font(Theme.Typography.largeTitle)
                    .opacity(revealStage >= 1 ? 1 : 0)

                // Top 3 cards
                VStack(spacing: Theme.Spacing.md) {
                    ForEach(Array(topDimensions.enumerated()), id: \.offset) { index, dim in
                        resultCard(rank: index + 1, dimension: dim.0, score: dim.1)
                            .opacity(revealStage > index ? 1 : 0)
                            .offset(y: revealStage > index ? 0 : 30)
                            .rotation3DEffect(
                                .degrees(revealStage > index ? 0 : 90),
                                axis: (x: 1, y: 0, z: 0)
                            )
                            .animation(Theme.Animation.matchCelebration.delay(Double(index) * 0.4 + 0.5), value: revealStage)
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .onAppear {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                        withAnimation { revealStage = 4 }
                    }
                }

                if revealStage >= 4 {
                    PrimaryButton(title: "Jetzt Lehrstellen entdecken") {
                        onContinue()
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
            .padding(.vertical, Theme.Spacing.xl)
        }
    }

    private var topDimensions: [(String, Double)] {
        let all = [
            ("Realistisch", hollandCodes.realistic),
            ("Forschend", hollandCodes.investigative),
            ("Künstlerisch", hollandCodes.artistic),
            ("Sozial", hollandCodes.social),
            ("Unternehmerisch", hollandCodes.enterprising),
            ("Konventionell", hollandCodes.conventional),
        ]
        return Array(all.sorted { $0.1 > $1.1 }.prefix(3))
    }

    private func resultCard(rank: Int, dimension: String, score: Double) -> some View {
        let tierColor: Color = switch rank {
        case 1: Theme.Colors.accentFallback
        case 2: Color.gray.opacity(0.7)
        default: Color.brown.opacity(0.6)
        }
        let tierLabel = switch rank {
        case 1: "Gold"
        case 2: "Silber"
        default: "Bronze"
        }

        return HStack(spacing: Theme.Spacing.md) {
            ZStack {
                Circle()
                    .fill(tierColor.gradient)
                    .frame(width: 44, height: 44)
                Text("#\(rank)")
                    .font(Theme.Typography.headline)
                    .foregroundStyle(.white)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(dimension)
                    .font(Theme.Typography.headline)
                Text(tierLabel)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }

            Spacer()

            Text("\(Int(score * 100))%")
                .font(Theme.Typography.title)
                .foregroundStyle(tierColor)
        }
        .padding(Theme.Spacing.md)
        .background(Theme.Colors.backgroundSecondary)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
    }
}
```

**Step 2: Verify build**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatch -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -quiet build 2>&1 | tail -5
```

**Step 3: Commit**

```bash
git add LehrMatch/Features/Onboarding/Views/PersonalityRevealView.swift
git commit -m "feat: add PersonalityRevealView with card-pack reveal animation"
```

---

## Task 13: Rewrite PersonalityQuizView — Orchestrate All Phases

Replace the existing quiz view to orchestrate all 3 phases with the gamification header.

**Files:**
- Modify: `LehrMatch/Features/Onboarding/Views/PersonalityQuizView.swift`

**Step 1: Rewrite PersonalityQuizView.swift**

Replace the contents of `LehrMatch/Features/Onboarding/Views/PersonalityQuizView.swift`:

```swift
import SwiftUI

struct PersonalityQuizView: View {
    @Bindable var viewModel: PersonalityQuizViewModel
    let onComplete: () -> Void

    @State private var showPhaseTransition: QuizBadge?
    @State private var previousPhase: QuizPhase = .morning

    var body: some View {
        VStack(spacing: 0) {
            // Gamification header (XP, level, phase dots)
            QuizProgressHeader(
                gamification: viewModel.gamification,
                currentPhase: viewModel.currentPhase,
                overallProgress: viewModel.overallProgress
            )

            // Phase content
            Group {
                if viewModel.isComplete {
                    PersonalityRevealView(
                        hollandCodes: viewModel.personalityProfile!.hollandCodes,
                        onContinue: {
                            Task {
                                try? await viewModel.saveProfile()
                                onComplete()
                            }
                        }
                    )
                } else {
                    switch viewModel.currentPhase {
                    case .morning, .afternoon:
                        gridPhaseView
                    case .scenarios:
                        scenarioPhaseView
                    }
                }
            }
            .transition(.asymmetric(
                insertion: .move(edge: .trailing).combined(with: .opacity),
                removal: .move(edge: .leading).combined(with: .opacity)
            ))
            .animation(Theme.Animation.swipeSpring, value: viewModel.currentPhase)
        }
        .background(Theme.Colors.backgroundPrimary)
        .overlay {
            if let badge = showPhaseTransition {
                PhaseTransitionView(badge: badge) {
                    showPhaseTransition = nil
                }
            }
        }
        .onChange(of: viewModel.currentPhase) { oldPhase, newPhase in
            // Show celebration when advancing
            if newPhase.rawValue > oldPhase.rawValue {
                let badge: QuizBadge? = switch oldPhase {
                case .morning: .morningComplete
                case .afternoon: .afternoonComplete
                case .scenarios: nil
                }
                if let badge {
                    showPhaseTransition = badge
                }
            }
        }
    }

    // MARK: - Grid Phase

    private var gridPhaseView: some View {
        VStack(spacing: Theme.Spacing.md) {
            // Phase title
            VStack(spacing: Theme.Spacing.xs) {
                Text(viewModel.currentPhase.title)
                    .font(Theme.Typography.title)
                Text(viewModel.currentPhase.subtitle)
                    .font(Theme.Typography.callout)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
            .padding(.top, Theme.Spacing.md)

            ActivityGridView(
                tiles: viewModel.currentTiles,
                requiredPicks: viewModel.currentPhase.requiredPicks,
                selectedCount: viewModel.selectedCount,
                onToggle: { viewModel.toggleTile($0) },
                onAdvance: { viewModel.advancePhase() }
            )

            // Progressive radar preview
            if viewModel.currentPhase == .afternoon {
                RadarChartView(
                    values: partialRIASECValues,
                    labels: ["R", "I", "A", "S", "E", "C"],
                    blurAmount: 8
                )
                .frame(height: 120)
                .padding(.horizontal, Theme.Spacing.xxl)
                .overlay {
                    Text("Dein Profil nimmt Form an...")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
        }
    }

    // MARK: - Scenario Phase

    private var scenarioPhaseView: some View {
        VStack(spacing: 0) {
            Text("Frage \(viewModel.currentScenarioIndex + 1) von 10")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
                .padding(.top, Theme.Spacing.sm)

            if let question = viewModel.currentScenarioQuestion {
                questionView(question)
                    .id(question.id)
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing).combined(with: .opacity),
                        removal: .move(edge: .leading).combined(with: .opacity)
                    ))
            }
        }
        .animation(Theme.Animation.swipeSpring, value: viewModel.currentScenarioIndex)
    }

    private func questionView(_ question: PersonalityQuestion) -> some View {
        VStack(spacing: Theme.Spacing.lg) {
            Spacer()

            Text(question.text)
                .font(Theme.Typography.title)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.lg)

            VStack(spacing: Theme.Spacing.md) {
                ForEach(question.options.indices, id: \.self) { index in
                    Button {
                        withAnimation(Theme.Animation.swipeSpring) {
                            viewModel.answerScenario(optionIndex: index)
                        }
                    } label: {
                        HStack(spacing: Theme.Spacing.md) {
                            if let icon = question.options[index].imageSystemName {
                                Image(systemName: icon)
                                    .font(.title2)
                                    .foregroundStyle(Theme.Colors.primaryFallback)
                                    .frame(width: 40)
                            }
                            Text(question.options[index].text)
                                .font(Theme.Typography.body)
                                .foregroundStyle(Theme.Colors.textPrimary)
                                .multilineTextAlignment(.leading)
                            Spacer()
                        }
                        .padding(Theme.Spacing.md)
                        .background(Theme.Colors.backgroundSecondary)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
                    }
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)

            Spacer()
        }
    }

    /// Approximate RIASEC values from morning picks only (for blurred preview)
    private var partialRIASECValues: [Double] {
        let picks = viewModel.morningTiles.filter(\.isSelected)
        var scores: [Double] = [0, 0, 0, 0, 0, 0]
        let dims: [QuizDimension] = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        for pick in picks {
            for (i, dim) in dims.enumerated() {
                scores[i] += pick.scores[dim] ?? 0
            }
        }
        let maxScore = max(scores.max() ?? 1, 0.001)
        return scores.map { $0 / maxScore }
    }
}
```

**Step 2: Verify build**

```bash
xcodegen generate
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatch -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -quiet build 2>&1 | tail -5
```

Expected: Build succeeded.

**Step 3: Commit**

```bash
git add LehrMatch/Features/Onboarding/Views/PersonalityQuizView.swift
git commit -m "feat: rewrite PersonalityQuizView for 3-phase orchestration with gamification"
```

---

## Task 14: Update PersonalityResultsView in SettingsView

Update the existing `PersonalityResultsView` (in `SettingsView.swift`) to use the new `RadarChartView` instead of hardcoded bar charts.

**Files:**
- Modify: `LehrMatch/Features/Profile/Views/SettingsView.swift`

**Step 1: Replace the PersonalityResultsView section**

In `SettingsView.swift`, replace the `PersonalityResultsView` struct (lines 163-222) with:

```swift
struct PersonalityResultsView: View {
    @Environment(AppState.self) private var appState

    // Fallback values for demo/preview
    private var hollandCodes: HollandCodes {
        appState.currentStudent?.personalityProfile?.hollandCodes ?? HollandCodes(
            realistic: 0.7, investigative: 0.4, artistic: 0.6,
            social: 0.85, enterprising: 0.3, conventional: 0.5
        )
    }

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                Text("Dein Persönlichkeitsprofil")
                    .font(Theme.Typography.title)
                    .padding(.top, Theme.Spacing.xl)

                Text("Dein Typ: \(hollandCodes.topThreeCodes.joined())")
                    .font(Theme.Typography.headline)
                    .foregroundStyle(Theme.Colors.primaryFallback)

                RadarChartView(
                    values: hollandCodes.asVector,
                    labels: ["R", "I", "A", "S", "E", "C"]
                )
                .frame(height: 250)
                .padding(.horizontal, Theme.Spacing.lg)

                // Dimension bars
                VStack(spacing: Theme.Spacing.md) {
                    personalityBar(label: "Realistisch", value: hollandCodes.realistic, color: .blue)
                    personalityBar(label: "Forschend", value: hollandCodes.investigative, color: .green)
                    personalityBar(label: "Künstlerisch", value: hollandCodes.artistic, color: .purple)
                    personalityBar(label: "Sozial", value: hollandCodes.social, color: .orange)
                    personalityBar(label: "Unternehmerisch", value: hollandCodes.enterprising, color: .red)
                    personalityBar(label: "Konventionell", value: hollandCodes.conventional, color: .gray)
                }
                .padding(.horizontal, Theme.Spacing.lg)
            }
            .padding(.bottom, Theme.Spacing.xxl)
        }
        .navigationTitle("Persönlichkeit")
    }

    private func personalityBar(label: String, value: Double, color: Color) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            HStack {
                Text(label)
                    .font(Theme.Typography.callout)
                Spacer()
                Text("\(Int(value * 100))%")
                    .font(Theme.Typography.badge)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(color.opacity(0.15))
                    RoundedRectangle(cornerRadius: 4)
                        .fill(color.gradient)
                        .frame(width: geo.size.width * value)
                }
            }
            .frame(height: 12)
        }
    }
}
```

**Step 2: Check `StudentProfile` has `personalityProfile` property**

Check that `StudentProfile.swift` has the field. If not, it may need an optional `PersonalityProfile?` property. Read the file first and add if missing.

**Step 3: Verify build**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatch -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -quiet build 2>&1 | tail -5
```

**Step 4: Commit**

```bash
git add LehrMatch/Features/Profile/Views/SettingsView.swift
git commit -m "feat: update PersonalityResultsView with RadarChartView"
```

---

## Task 15: Wire Up OnboardingFlowView + Clean Up Old Sample Data

Remove the old `PersonalityQuestion.sampleQuestions` from `PersonalityProfile.swift` since all content now lives in `QuizContent.swift`. Verify the onboarding flow still works.

**Files:**
- Modify: `LehrMatch/Features/Onboarding/Models/PersonalityProfile.swift` — Remove `sampleQuestions`
- Modify: `LehrMatch/Features/Onboarding/Views/OnboardingFlowView.swift` — Verify PersonalityQuizView init is compatible

**Step 1: Remove sampleQuestions from PersonalityProfile.swift**

Delete the entire `extension PersonalityQuestion { static let sampleQuestions ... }` block (lines 96-209 in the current file).

**Step 2: Verify OnboardingFlowView still compiles**

The `OnboardingFlowView` creates `PersonalityQuizViewModel` and passes it to `PersonalityQuizView`. The API is unchanged (`init(apiClient:studentId:)`), so it should work. Verify:

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatch -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -quiet build 2>&1 | tail -5
```

**Step 3: Run all tests**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatchTests -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test -quiet 2>&1 | tail -15
```

Expected: All tests pass.

**Step 4: Commit**

```bash
git add LehrMatch/Features/Onboarding/Models/PersonalityProfile.swift LehrMatch/Features/Onboarding/Views/OnboardingFlowView.swift
git commit -m "chore: remove old sample questions, wire up new quiz in onboarding flow"
```

---

## Task 16: Final Verification — Full Build + All Tests

**Step 1: Regenerate project**

```bash
xcodegen generate
```

**Step 2: Clean build**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatch -destination 'platform=iOS Simulator,name=iPhone 17 Pro' clean build -quiet 2>&1 | tail -10
```

**Step 3: Run all tests**

```bash
xcodebuild -project LehrMatch.xcodeproj -scheme LehrMatchTests -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test -quiet 2>&1 | tail -15
```

**Step 4: Verify in simulator**

Run the app in Xcode, go through onboarding to the personality quiz, and verify:
1. Phase 1 shows 4x4 morning grid with XP header
2. Selecting 8 tiles enables "Weiter" button
3. Phase transition celebration plays
4. Phase 2 shows afternoon grid with blurred radar preview
5. Phase 3 shows scenario questions one at a time
6. Speed bonus "+5 XP" appears when answering fast
7. Final reveal shows radar chart + gold/silver/bronze cards
8. "Jetzt Lehrstellen entdecken" completes onboarding

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: complete Build Your Day personality quiz implementation"
```
