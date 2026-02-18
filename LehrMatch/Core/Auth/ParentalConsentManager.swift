import Foundation

@MainActor
@Observable
final class ParentalConsentManager {
    var consentStatus: ParentalConsentStatus = .notRequired
    var parentEmail: String?
    var isRequestingConsent = false

    private let apiClient: APIClient

    init(apiClient: APIClient) {
        self.apiClient = apiClient
    }

    func requiresConsent(dateOfBirth: Date) -> Bool {
        let age = Calendar.current.dateComponents([.year], from: dateOfBirth, to: .now).year ?? 0
        return age < 18
    }

    func requestConsent(studentId: UUID, parentEmail: String) async throws {
        isRequestingConsent = true
        defer { isRequestingConsent = false }

        self.parentEmail = parentEmail

        let body = ConsentRequest(studentId: studentId, parentEmail: parentEmail)
        try await apiClient.requestVoid(
            endpoint: .requestConsent(studentId: studentId),
            method: .post,
            body: body
        )

        consentStatus = .pending
    }

    func checkConsentStatus(studentId: UUID) async throws {
        let profiles: [ConsentRecord] = try await apiClient.request(
            endpoint: Endpoint(
                path: "/rest/v1/parental_consents",
                queryItems: [("student_id", "eq.\(studentId)")]
            )
        )

        if let record = profiles.first {
            switch record.status {
            case "granted": consentStatus = .granted
            case "revoked": consentStatus = .revoked
            default: consentStatus = .pending
            }
        }
    }

    var canSwipe: Bool { consentStatus == .granted || consentStatus == .notRequired }
    var canChat: Bool { consentStatus == .granted || consentStatus == .notRequired }
    var canGenerateVideo: Bool { consentStatus == .granted || consentStatus == .notRequired }
}

// MARK: - Models

struct ConsentRequest: Encodable {
    let studentId: UUID
    let parentEmail: String
}

struct ConsentRecord: Decodable {
    let id: UUID
    let studentId: UUID
    let parentEmail: String
    let status: String
    let grantedAt: Date?
}
