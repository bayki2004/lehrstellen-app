import SwiftUI

struct Bewerbung: Identifiable, Codable {
    let id: UUID
    let studentId: UUID
    let listingId: UUID
    var status: BewerbungStatus
    let sentAt: Date
    var viewedAt: Date?
    var respondedAt: Date?
    var notes: String?

    // Joined fields (populated from query)
    var companyName: String?
    var berufTitle: String?
    var companyLogoUrl: String?
    var canton: String?
    var city: String?
}

enum BewerbungStatus: String, Codable, CaseIterable {
    case sent
    case viewed
    case interviewInvited = "interview_invited"
    case rejected
    case schnupperlehreScheduled = "schnupperlehre_scheduled"
    case offer
    case accepted
    case withdrawn

    var displayName: String {
        switch self {
        case .sent: "Gesendet"
        case .viewed: "Angesehen"
        case .interviewInvited: "Einladung"
        case .rejected: "Abgesagt"
        case .schnupperlehreScheduled: "Schnupperlehre"
        case .offer: "Angebot"
        case .accepted: "Angenommen"
        case .withdrawn: "Zurückgezogen"
        }
    }

    var icon: String {
        switch self {
        case .sent: "paperplane.fill"
        case .viewed: "eye.fill"
        case .interviewInvited: "calendar.badge.plus"
        case .rejected: "xmark.circle.fill"
        case .schnupperlehreScheduled: "building.2.fill"
        case .offer: "star.fill"
        case .accepted: "checkmark.seal.fill"
        case .withdrawn: "arrow.uturn.backward"
        }
    }

    var color: Color {
        switch self {
        case .sent: Theme.Colors.primaryFallback
        case .viewed: .orange
        case .interviewInvited: Theme.Colors.swipeRight
        case .rejected: Theme.Colors.swipeLeft
        case .schnupperlehreScheduled: .purple
        case .offer: Theme.Colors.accentFallback
        case .accepted: Theme.Colors.swipeRight
        case .withdrawn: Theme.Colors.textTertiary
        }
    }

    var isActive: Bool {
        switch self {
        case .sent, .viewed, .interviewInvited, .schnupperlehreScheduled, .offer: true
        case .rejected, .accepted, .withdrawn: false
        }
    }
}

// MARK: - Request Types

struct CreateBewerbungRequest: Encodable {
    let studentId: UUID
    let listingId: UUID
}

struct SkipListingRequest: Encodable {
    let studentId: UUID
    let listingId: UUID
}

// MARK: - Sample Data

extension Bewerbung {
    static let samples: [Bewerbung] = [
        Bewerbung(
            id: UUID(),
            studentId: UUID(),
            listingId: UUID(),
            status: .sent,
            sentAt: .now.addingTimeInterval(-86400),
            companyName: "Swisscom",
            berufTitle: "Informatiker/in EFZ",
            canton: "BE",
            city: "Bern"
        ),
        Bewerbung(
            id: UUID(),
            studentId: UUID(),
            listingId: UUID(),
            status: .viewed,
            sentAt: .now.addingTimeInterval(-172800),
            viewedAt: .now.addingTimeInterval(-86400),
            companyName: "Bäckerei Müller",
            berufTitle: "Bäcker/in-Konditor/in EFZ",
            canton: "ZH",
            city: "Zürich"
        ),
        Bewerbung(
            id: UUID(),
            studentId: UUID(),
            listingId: UUID(),
            status: .interviewInvited,
            sentAt: .now.addingTimeInterval(-259200),
            viewedAt: .now.addingTimeInterval(-172800),
            respondedAt: .now.addingTimeInterval(-86400),
            companyName: "Universitätsspital Zürich",
            berufTitle: "Fachfrau/-mann Gesundheit EFZ",
            canton: "ZH",
            city: "Zürich"
        ),
    ]
}
