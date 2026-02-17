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

// MARK: - Sample Questions

extension PersonalityQuestion {
    static let sampleQuestions: [PersonalityQuestion] = [
        PersonalityQuestion(
            id: "q1",
            text: "Was machst du am liebsten in deiner Freizeit?",
            options: [
                QuizOption(text: "Etwas bauen oder reparieren", imageSystemName: "wrench.and.screwdriver", scores: [.realistic: 1.0]),
                QuizOption(text: "Rätsel lösen oder programmieren", imageSystemName: "cpu", scores: [.investigative: 1.0]),
                QuizOption(text: "Zeichnen, Musik oder Videos machen", imageSystemName: "paintbrush", scores: [.artistic: 1.0]),
                QuizOption(text: "Freunden helfen oder Nachhilfe geben", imageSystemName: "person.2", scores: [.social: 1.0]),
            ],
            dimension: .realistic
        ),
        PersonalityQuestion(
            id: "q2",
            text: "In einer Gruppenarbeit bist du meistens...",
            options: [
                QuizOption(text: "Die Person, die organisiert", imageSystemName: "list.clipboard", scores: [.conventional: 1.0, .enterprising: 0.5]),
                QuizOption(text: "Die Person mit den kreativen Ideen", imageSystemName: "lightbulb", scores: [.artistic: 1.0]),
                QuizOption(text: "Die Person, die alle zusammenhält", imageSystemName: "heart", scores: [.social: 1.0]),
                QuizOption(text: "Die Person, die forscht und Fakten liefert", imageSystemName: "magnifyingglass", scores: [.investigative: 1.0]),
            ],
            dimension: .social
        ),
        PersonalityQuestion(
            id: "q3",
            text: "Welche Arbeitsumgebung spricht dich am meisten an?",
            options: [
                QuizOption(text: "Draussen oder in einer Werkstatt", imageSystemName: "hammer", scores: [.realistic: 1.0]),
                QuizOption(text: "In einem modernen Büro mit Computer", imageSystemName: "desktopcomputer", scores: [.investigative: 0.5, .conventional: 0.5]),
                QuizOption(text: "In einem kreativen Studio oder Atelier", imageSystemName: "paintpalette", scores: [.artistic: 1.0]),
                QuizOption(text: "Mit Menschen: Spital, Schule, Beratung", imageSystemName: "stethoscope", scores: [.social: 1.0]),
            ],
            dimension: .realistic
        ),
        PersonalityQuestion(
            id: "q4",
            text: "Was ist dir bei der Arbeit am wichtigsten?",
            options: [
                QuizOption(text: "Im Team arbeiten", imageSystemName: "person.3", scores: [.teamwork: 1.0, .social: 0.5]),
                QuizOption(text: "Selbständig entscheiden können", imageSystemName: "figure.walk", scores: [.independence: 1.0, .enterprising: 0.5]),
                QuizOption(text: "Jeden Tag etwas Neues erleben", imageSystemName: "sparkles", scores: [.creativity: 1.0, .artistic: 0.5]),
                QuizOption(text: "Einen sicheren, stabilen Job haben", imageSystemName: "shield", scores: [.stability: 1.0, .conventional: 0.5]),
            ],
            dimension: .teamwork
        ),
        PersonalityQuestion(
            id: "q5",
            text: "Welches Schulfach magst du am meisten?",
            options: [
                QuizOption(text: "Werken / Technisches Gestalten", imageSystemName: "gearshape.2", scores: [.realistic: 1.0]),
                QuizOption(text: "Mathe / Naturwissenschaften", imageSystemName: "function", scores: [.investigative: 1.0]),
                QuizOption(text: "Bildnerisches Gestalten / Musik", imageSystemName: "music.note", scores: [.artistic: 1.0]),
                QuizOption(text: "Sprachen / Geschichte", imageSystemName: "book", scores: [.social: 0.5, .conventional: 0.5]),
            ],
            dimension: .investigative
        ),
        PersonalityQuestion(
            id: "q6",
            text: "Wenn du ein Problem hast, wie gehst du vor?",
            options: [
                QuizOption(text: "Ich probiere aus und bastle eine Lösung", imageSystemName: "puzzlepiece", scores: [.realistic: 1.0]),
                QuizOption(text: "Ich recherchiere und analysiere zuerst", imageSystemName: "doc.text.magnifyingglass", scores: [.investigative: 1.0]),
                QuizOption(text: "Ich frage andere um Rat", imageSystemName: "bubble.left.and.bubble.right", scores: [.social: 1.0]),
                QuizOption(text: "Ich mache einen Plan und arbeite ihn ab", imageSystemName: "checklist", scores: [.conventional: 1.0]),
            ],
            dimension: .conventional
        ),
        PersonalityQuestion(
            id: "q7",
            text: "Was würdest du am liebsten verkaufen?",
            options: [
                QuizOption(text: "Selbstgebaute Sachen auf einem Markt", imageSystemName: "storefront", scores: [.realistic: 0.5, .enterprising: 0.5]),
                QuizOption(text: "Eine App, die ich programmiert habe", imageSystemName: "iphone", scores: [.investigative: 0.5, .enterprising: 0.5]),
                QuizOption(text: "Meine Kunst oder Designs", imageSystemName: "photo.artframe", scores: [.artistic: 0.5, .enterprising: 0.5]),
                QuizOption(text: "Ich helfe lieber, als zu verkaufen", imageSystemName: "hand.raised", scores: [.social: 1.0]),
            ],
            dimension: .enterprising
        ),
        PersonalityQuestion(
            id: "q8",
            text: "Wie sieht dein idealer Arbeitstag aus?",
            options: [
                QuizOption(text: "Körperlich aktiv, viel bewegen", imageSystemName: "figure.run", scores: [.realistic: 1.0]),
                QuizOption(text: "Knifflige Aufgaben lösen, tüfteln", imageSystemName: "brain", scores: [.investigative: 1.0]),
                QuizOption(text: "Viele verschiedene Aufgaben, nie langweilig", imageSystemName: "arrow.triangle.2.circlepath", scores: [.enterprising: 0.5, .artistic: 0.5]),
                QuizOption(text: "Menschen treffen und ihnen helfen", imageSystemName: "hands.sparkles", scores: [.social: 1.0]),
            ],
            dimension: .realistic
        ),
        PersonalityQuestion(
            id: "q9",
            text: "Welches Tier passt am besten zu dir?",
            options: [
                QuizOption(text: "Biber — fleissig und baut gerne", imageSystemName: "leaf", scores: [.realistic: 1.0]),
                QuizOption(text: "Eule — schlau und neugierig", imageSystemName: "moon.stars", scores: [.investigative: 1.0]),
                QuizOption(text: "Schmetterling — kreativ und frei", imageSystemName: "wind", scores: [.artistic: 1.0]),
                QuizOption(text: "Delfin — sozial und kommunikativ", imageSystemName: "water.waves", scores: [.social: 1.0]),
            ],
            dimension: .social
        ),
        PersonalityQuestion(
            id: "q10",
            text: "Stell dir vor, du gründest eine Firma. Was wäre es?",
            options: [
                QuizOption(text: "Ein Handwerksbetrieb oder eine Garage", imageSystemName: "car", scores: [.realistic: 1.0]),
                QuizOption(text: "Ein Tech-Startup", imageSystemName: "laptopcomputer", scores: [.investigative: 0.5, .enterprising: 0.5]),
                QuizOption(text: "Ein Designstudio oder eine Agentur", imageSystemName: "paintbrush.pointed", scores: [.artistic: 1.0]),
                QuizOption(text: "Eine Arztpraxis oder Beratungsfirma", imageSystemName: "cross.case", scores: [.social: 1.0]),
            ],
            dimension: .enterprising
        ),
    ]
}
