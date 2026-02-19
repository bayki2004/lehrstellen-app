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
    static let feedRecommendations = Endpoint(
        path: "/rest/v1/lehrstellen_feed",
        queryItems: [
            ("status", "eq.active"),
            ("order", "compatibility_score.desc"),
            ("limit", "20")
        ]
    )

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

    // MARK: - Berufsschulen
    static let berufsschulen = Endpoint(path: "/rest/v1/berufsschulen")
    static let berufsschulenGeo = Endpoint(
        path: "/rest/v1/berufsschulen",
        queryItems: [
            ("lat", "not.is.null"),
            ("lng", "not.is.null"),
            ("select", "id,name,canton,city,address,postal_code,lat,lng,website,email,phone")
        ]
    )
    static func berufsschule(id: UUID) -> Endpoint {
        Endpoint(path: "/rest/v1/berufsschulen", queryItems: [("id", "eq.\(id)")])
    }
    static func berufsschulBerufe(schoolId: UUID) -> Endpoint {
        Endpoint(
            path: "/rest/v1/berufsschule_beruf_mapping",
            queryItems: [
                ("berufsschule_id", "eq.\(schoolId)"),
                ("select", "id,beruf_code,berufe(code,name_de,field,education_type)")
            ]
        )
    }
    static func berufsschulenForBeruf(code: String, canton: String) -> Endpoint {
        Endpoint(
            path: "/rest/v1/berufsschule_beruf_mapping",
            queryItems: [
                ("beruf_code", "eq.\(code)"),
                ("canton", "eq.\(canton)"),
                ("select", "berufsschule_id,berufsschulen(id,name,canton,city,address,postal_code,lat,lng,website,email,phone)")
            ]
        )
    }

    // MARK: - School Category Index
    static let schoolCategoryIndex = Endpoint(
        path: "/rest/v1/berufsschule_beruf_mapping",
        queryItems: [
            ("select", "berufsschule_id,berufe(field)")
        ]
    )

    // MARK: - Berufe
    static let berufe = Endpoint(
        path: "/rest/v1/berufe",
        queryItems: [("select", "code,name_de,field,education_type")]
    )
    static let berufeWithRIASEC = Endpoint(
        path: "/rest/v1/berufe",
        queryItems: [
            ("select", "code,name_de,field,education_type,duration_years,description_de,personality_fit,holland_code"),
            ("personality_fit", "neq.{}")
        ]
    )
    static func lehrstellenCount(berufCode: String) -> Endpoint {
        Endpoint(path: "/rest/v1/lehrstellen", queryItems: [
            ("beruf_code", "eq.\(berufCode)"),
            ("status", "eq.active"),
            ("select", "id")
        ])
    }

    // MARK: - Lehrstellen with geo data (for map)
    static let lehrstellenGeo = Endpoint(
        path: "/rest/v1/lehrstellen_feed",
        queryItems: [
            ("status", "eq.active"),
            ("lat", "not.is.null"),
            ("lng", "not.is.null")
        ]
    )
}
