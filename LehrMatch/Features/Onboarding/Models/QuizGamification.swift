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
