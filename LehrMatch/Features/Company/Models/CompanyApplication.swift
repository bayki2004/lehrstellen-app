import SwiftUI

/// Application from the company perspective. Matches Prisma ApplicationDTO.
struct CompanyApplication: Codable, Identifiable {
    let id: String
    let studentId: String
    let listingId: String
    let matchId: String
    var status: ApplicationStatus
    let notes: String?
    let timeline: [ApplicationTimelineEntry]
    let createdAt: String
    let updatedAt: String
    let listing: CompanyListing?
    let student: ApplicationStudentInfo?
    let compatibilityScore: Double?
}

/// Lightweight student info shown in application lists.
struct ApplicationStudentInfo: Codable {
    let id: String
    let firstName: String
    let lastName: String
    let profilePhoto: String?
    let canton: String
    let city: String
    var fullName: String { "\(firstName) \(lastName)" }
}

/// Application status enum matching Prisma ApplicationStatus.
enum ApplicationStatus: String, Codable, CaseIterable {
    case pending = "PENDING"
    case viewed = "VIEWED"
    case shortlisted = "SHORTLISTED"
    case interviewScheduled = "INTERVIEW_SCHEDULED"
    case accepted = "ACCEPTED"
    case rejected = "REJECTED"
    case withdrawn = "WITHDRAWN"

    var displayName: String {
        switch self {
        case .pending: "Ausstehend"
        case .viewed: "Angesehen"
        case .shortlisted: "Vorauswahl"
        case .interviewScheduled: "Interview geplant"
        case .accepted: "Angenommen"
        case .rejected: "Abgelehnt"
        case .withdrawn: "Zurückgezogen"
        }
    }

    var icon: String {
        switch self {
        case .pending: "clock.fill"
        case .viewed: "eye.fill"
        case .shortlisted: "star.fill"
        case .interviewScheduled: "calendar.badge.plus"
        case .accepted: "checkmark.seal.fill"
        case .rejected: "xmark.circle.fill"
        case .withdrawn: "arrow.uturn.backward"
        }
    }

    var color: Color {
        switch self {
        case .pending: Theme.Colors.primaryFallback
        case .viewed: .orange
        case .shortlisted: .purple
        case .interviewScheduled: Theme.Colors.swipeRight
        case .accepted: Theme.Colors.swipeRight
        case .rejected: Theme.Colors.swipeLeft
        case .withdrawn: Theme.Colors.textTertiary
        }
    }

    var isActive: Bool {
        switch self {
        case .pending, .viewed, .shortlisted, .interviewScheduled: true
        case .accepted, .rejected, .withdrawn: false
        }
    }
}

struct ApplicationTimelineEntry: Codable {
    let status: String
    let timestamp: String
    let note: String?
}

struct UpdateApplicationStatusRequest: Encodable {
    let status: String
    let note: String?
}

// MARK: - Sample Data
extension CompanyApplication {
    static let samples: [CompanyApplication] = [
        CompanyApplication(
            id: "app-1",
            studentId: "student-1",
            listingId: "listing-1",
            matchId: "match-1",
            status: .pending,
            notes: nil,
            timeline: [
                ApplicationTimelineEntry(status: "PENDING", timestamp: "2026-02-15T10:00:00Z", note: nil)
            ],
            createdAt: "2026-02-15T10:00:00Z",
            updatedAt: "2026-02-15T10:00:00Z",
            listing: CompanyListing.samples.first,
            student: ApplicationStudentInfo(
                id: "student-1",
                firstName: "Max",
                lastName: "Muster",
                profilePhoto: nil,
                canton: "ZH",
                city: "Zürich"
            ),
            compatibilityScore: 82.5
        ),
    ]
}
