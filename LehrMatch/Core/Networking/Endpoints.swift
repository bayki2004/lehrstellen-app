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

    // MARK: - Swipes
    static let swipes = Endpoint(path: "/rest/v1/swipes")

    // MARK: - Matches
    static func matches(studentId: UUID) -> Endpoint {
        Endpoint(path: "/rest/v1/matches", queryItems: [("student_id", "eq.\(studentId)")])
    }

    // MARK: - Messages
    static func messages(matchId: UUID) -> Endpoint {
        Endpoint(path: "/rest/v1/messages", queryItems: [("match_id", "eq.\(matchId)")])
    }

    // MARK: - Video Motivation
    static let generateScript = Endpoint(path: "/functions/v1/video/generate-script")
    static let createVideo = Endpoint(path: "/functions/v1/video/create")
    static func motivationVideos(studentId: UUID) -> Endpoint {
        Endpoint(path: "/rest/v1/motivation_videos", queryItems: [("student_id", "eq.\(studentId)")])
    }
}
