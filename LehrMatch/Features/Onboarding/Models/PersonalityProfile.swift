import Foundation

struct PersonalityProfile: Codable, Identifiable {
    let id: UUID
    let studentId: UUID
    var hollandCodes: HollandCodes
    var workValues: WorkValues
    var quizAnswersRaw: [QuizAnswer]
    var computedAt: Date
    var version: Int

    init(id: UUID = UUID(), studentId: UUID) {
        self.id = id
        self.studentId = studentId
        self.hollandCodes = HollandCodes()
        self.workValues = WorkValues()
        self.quizAnswersRaw = []
        self.computedAt = .now
        self.version = 1
    }
}

/// RIASEC model scores (Holland Codes)
struct HollandCodes: Codable {
    var realistic: Double = 0      // Hands-on, practical (Handwerk, Technik)
    var investigative: Double = 0  // Analytical, scientific (Forschung, IT)
    var artistic: Double = 0       // Creative, expressive (Design, Medien)
    var social: Double = 0         // Helping, teaching (Gesundheit, Soziales)
    var enterprising: Double = 0   // Leadership, persuading (Verkauf, Management)
    var conventional: Double = 0   // Organizing, detail-oriented (KV, Verwaltung)

    var topThreeCodes: [String] {
        let all = [
            ("R", realistic), ("I", investigative), ("A", artistic),
            ("S", social), ("E", enterprising), ("C", conventional)
        ]
        return all.sorted { $0.1 > $1.1 }.prefix(3).map(\.0)
    }

    var dominantType: String {
        topThreeCodes.first ?? "R"
    }

    var asVector: [Double] {
        [realistic, investigative, artistic, social, enterprising, conventional]
    }
}

struct WorkValues: Codable {
    var teamwork: Double = 0
    var independence: Double = 0
    var creativity: Double = 0
    var stability: Double = 0
    var variety: Double = 0
    var helpingOthers: Double = 0
    var physicalActivity: Double = 0
    var technology: Double = 0
}

struct QuizAnswer: Codable, Identifiable {
    let id: UUID
    let questionId: String
    let selectedOptionIndex: Int
    let answeredAt: Date

    init(questionId: String, selectedOptionIndex: Int) {
        self.id = UUID()
        self.questionId = questionId
        self.selectedOptionIndex = selectedOptionIndex
        self.answeredAt = .now
    }
}

// MARK: - Quiz Questions

struct PersonalityQuestion: Identifiable {
    let id: String
    let text: String
    let options: [QuizOption]
    let dimension: QuizDimension
}

struct QuizOption {
    let text: String
    let imageSystemName: String?
    let scores: [QuizDimension: Double]
}

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

