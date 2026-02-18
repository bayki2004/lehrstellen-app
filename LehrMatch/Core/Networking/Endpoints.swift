import Foundation

struct Endpoint {
    let path: String
    var queryItems: [(String, String)] = []
}

extension Endpoint {
    // MARK: - Auth
    static let signUp = Endpoint(path: "/auth/v1/signup")
    static let signIn = Endpoint(path: "/auth/v1/token", queryItems: [("grant_type", "password")])
    static let signOut = Endpoint(path: "/auth/v1/logout")
    static func requestConsent(studentId: UUID) -> Endpoint {
        Endpoint(path: "/functions/v1/auth/request-consent")
    }

    // MARK: - Student Profile
    static func student(id: UUID) -> Endpoint {
        Endpoint(path: "/rest/v1/students", queryItems: [("id", "eq.\(id)")])
    }
    static let students = Endpoint(path: "/rest/v1/students")
    static let personalityProfiles = Endpoint(path: "/rest/v1/personality_profiles")

    // MARK: - Discovery Feed
    static let feedRecommendations = Endpoint(path: "/functions/v1/feed/recommendations")

    // MARK: - Lehrstellen
    static func lehrstelle(id: UUID) -> Endpoint {
        Endpoint(path: "/rest/v1/lehrstellen", queryItems: [("id", "eq.\(id)")])
    }

    // MARK: - Swipes (kept for feed algorithm)
    static let swipes = Endpoint(path: "/rest/v1/swipes")

    // MARK: - Bewerbungen
    static let bewerbungen = Endpoint(path: "/rest/v1/bewerbungen")
    static func bewerbungen(studentId: UUID) -> Endpoint {
        Endpoint(path: "/rest/v1/bewerbungen", queryItems: [
            ("student_id", "eq.\(studentId)"),
            ("order", "sent_at.desc")
        ])
    }
    static func bewerbung(id: UUID) -> Endpoint {
        Endpoint(path: "/rest/v1/bewerbungen", queryItems: [("id", "eq.\(id)")])
    }

    // MARK: - Skipped Listings
    static let skippedListings = Endpoint(path: "/rest/v1/skipped_listings")

    // MARK: - Zeugnisse
    static func zeugnisse(studentId: UUID) -> Endpoint {
        Endpoint(path: "/rest/v1/zeugnisse", queryItems: [("student_id", "eq.\(studentId)")])
    }

    // MARK: - Messages (future: linked to bewerbungen)
    static func messages(bewerbungId: UUID) -> Endpoint {
        Endpoint(path: "/rest/v1/messages", queryItems: [("bewerbung_id", "eq.\(bewerbungId)")])
    }

    // MARK: - Matches (legacy, kept for backward compat)
    static func matches(studentId: UUID) -> Endpoint {
        Endpoint(path: "/rest/v1/matches", queryItems: [("student_id", "eq.\(studentId)")])
    }
}
