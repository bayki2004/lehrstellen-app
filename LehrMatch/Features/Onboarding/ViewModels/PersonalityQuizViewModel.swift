import Foundation

@MainActor
@Observable
final class PersonalityQuizViewModel {
    var questions: [PersonalityQuestion] = PersonalityQuestion.sampleQuestions
    var currentQuestionIndex = 0
    var answers: [QuizAnswer] = []
    var personalityProfile: PersonalityProfile?
    var isComputing = false

    private let apiClient: APIClient
    private let studentId: UUID

    init(apiClient: APIClient, studentId: UUID) {
        self.apiClient = apiClient
        self.studentId = studentId
    }

    var currentQuestion: PersonalityQuestion? {
        guard currentQuestionIndex < questions.count else { return nil }
        return questions[currentQuestionIndex]
    }

    var progress: Double {
        guard !questions.isEmpty else { return 0 }
        return Double(currentQuestionIndex) / Double(questions.count)
    }

    var isComplete: Bool {
        currentQuestionIndex >= questions.count
    }

    func answerQuestion(optionIndex: Int) {
        guard let question = currentQuestion else { return }

        let answer = QuizAnswer(
            questionId: question.id,
            selectedOptionIndex: optionIndex
        )
        answers.append(answer)
        currentQuestionIndex += 1

        if isComplete {
            computeProfile()
        }
    }

    private func computeProfile() {
        isComputing = true
        var profile = PersonalityProfile(studentId: studentId)
        var hollandScores: [QuizDimension: Double] = [:]

        for (index, answer) in answers.enumerated() {
            guard index < questions.count else { break }
            let question = questions[index]
            let option = question.options[answer.selectedOptionIndex]

            for (dimension, score) in option.scores {
                hollandScores[dimension, default: 0] += score
            }
        }

        // Normalize scores to 0-1 range
        let maxPossible = Double(questions.count)

        profile.hollandCodes.realistic = (hollandScores[.realistic] ?? 0) / maxPossible
        profile.hollandCodes.investigative = (hollandScores[.investigative] ?? 0) / maxPossible
        profile.hollandCodes.artistic = (hollandScores[.artistic] ?? 0) / maxPossible
        profile.hollandCodes.social = (hollandScores[.social] ?? 0) / maxPossible
        profile.hollandCodes.enterprising = (hollandScores[.enterprising] ?? 0) / maxPossible
        profile.hollandCodes.conventional = (hollandScores[.conventional] ?? 0) / maxPossible

        profile.workValues.teamwork = (hollandScores[.teamwork] ?? 0) / maxPossible
        profile.workValues.independence = (hollandScores[.independence] ?? 0) / maxPossible
        profile.workValues.creativity = (hollandScores[.creativity] ?? 0) / maxPossible
        profile.workValues.stability = (hollandScores[.stability] ?? 0) / maxPossible

        profile.quizAnswersRaw = answers
        profile.computedAt = .now

        personalityProfile = profile
        isComputing = false
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
