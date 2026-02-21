import SwiftUI

@MainActor
@Observable
final class AppState {
    var isAuthenticated = false
    var hasCompletedOnboarding = false
    var currentStudent: StudentProfile?
    var currentCompany: CompanyProfile?
    var parentalConsentStatus: ParentalConsentStatus = .notRequired

    var userType: UserType? {
        authManager.userType
    }

    // Student backend (Supabase direct)
    let apiClient: APIClient
    let authManager: AuthManager
    let realtimeClient: RealtimeClient
    let storageClient: StorageClient

    // Company backend (Express.js API)
    let expressClient: ExpressAPIClient

    init(
        config: SupabaseConfig = .current,
        expressBaseURL: URL = ExpressConfig.baseURL
    ) {
        let api = APIClient(config: config)
        self.apiClient = api
        self.authManager = AuthManager(apiClient: api)
        self.realtimeClient = RealtimeClient(config: config)
        self.storageClient = StorageClient(config: config)
        self.expressClient = ExpressAPIClient(baseURL: expressBaseURL)
    }

    func signOut() {
        isAuthenticated = false
        currentStudent = nil
        currentCompany = nil
        realtimeClient.disconnect()
        Task { await expressClient.logout() }
    }
}

enum ParentalConsentStatus: String, Codable {
    case notRequired
    case pending
    case granted
    case revoked
}
