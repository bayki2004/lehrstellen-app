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
