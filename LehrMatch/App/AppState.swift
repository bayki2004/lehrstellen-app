import SwiftUI

@MainActor
@Observable
final class AppState {
    var isAuthenticated = false
    var hasCompletedOnboarding = false
    var currentStudent: StudentProfile?
    var parentalConsentStatus: ParentalConsentStatus = .notRequired

    let apiClient: APIClient
    let authManager: AuthManager
    let realtimeClient: RealtimeClient

    init(config: SupabaseConfig = .current) {
        let api = APIClient(config: config)
        self.apiClient = api
        self.authManager = AuthManager(apiClient: api)
        self.realtimeClient = RealtimeClient(config: config)
    }

    func signOut() {
        isAuthenticated = false
        currentStudent = nil
        realtimeClient.disconnect()
    }
}

enum ParentalConsentStatus: String, Codable {
    case notRequired
    case pending
    case granted
    case revoked
}
