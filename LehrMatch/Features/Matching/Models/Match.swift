import Foundation

struct Match: Identifiable, Codable, Hashable {
    let id: UUID
    let studentId: UUID
    let companyId: UUID
    let lehrstelleId: UUID
    let companyName: String
    let companyLogoUrl: String?
    let berufTitle: String
    let canton: String
    let city: String
    let compatibilityScore: Double
    var status: MatchStatus
    let matchedAt: Date
    var lastMessagePreview: String?
    var lastMessageAt: Date?
    var unreadCount: Int

    var companyLogoURL: URL? {
        guard let logo = companyLogoUrl else { return nil }
        return URL(string: logo)
    }

    var locationDisplay: String {
        "\(city), \(canton)"
    }

    var isNew: Bool {
        lastMessageAt == nil
    }
}

enum MatchStatus: String, Codable {
    case active
    case archived
    case hired
}

// MARK: - Sample Data

extension Match {
    static let samples: [Match] = [
        Match(
            id: UUID(),
            studentId: UUID(),
            companyId: UUID(),
            lehrstelleId: UUID(),
            companyName: "Swisscom AG",
            companyLogoUrl: nil,
            berufTitle: "Informatiker/in EFZ",
            canton: "ZH",
            city: "Zürich",
            compatibilityScore: 0.87,
            status: .active,
            matchedAt: .now.addingTimeInterval(-86400),
            lastMessagePreview: "Hallo! Wir freuen uns über dein Interesse.",
            lastMessageAt: .now.addingTimeInterval(-3600),
            unreadCount: 1
        ),
        Match(
            id: UUID(),
            studentId: UUID(),
            companyId: UUID(),
            lehrstelleId: UUID(),
            companyName: "Universitätsspital Zürich",
            companyLogoUrl: nil,
            berufTitle: "FaGe EFZ",
            canton: "ZH",
            city: "Zürich",
            compatibilityScore: 0.74,
            status: .active,
            matchedAt: .now.addingTimeInterval(-172800),
            lastMessagePreview: nil,
            lastMessageAt: nil,
            unreadCount: 0
        ),
        Match(
            id: UUID(),
            studentId: UUID(),
            companyId: UUID(),
            lehrstelleId: UUID(),
            companyName: "SBB",
            companyLogoUrl: nil,
            berufTitle: "Polymechaniker/in EFZ",
            canton: "BE",
            city: "Bern",
            compatibilityScore: 0.69,
            status: .active,
            matchedAt: .now.addingTimeInterval(-259200),
            lastMessagePreview: "Danke für deine Nachricht!",
            lastMessageAt: .now.addingTimeInterval(-7200),
            unreadCount: 0
        ),
    ]
}
