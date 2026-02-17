import Foundation
import AuthenticationServices

@MainActor
@Observable
final class AuthManager {
    var currentUserId: UUID?
    var isSignedIn: Bool { currentUserId != nil }
    private let apiClient: APIClient
    private let keychainService = KeychainService()

    init(apiClient: APIClient) {
        self.apiClient = apiClient
        restoreSession()
    }

    // MARK: - Email/Password Auth

    func signUp(email: String, password: String) async throws -> AuthResponse {
        let body = SignUpRequest(email: email, password: password)
        let response: AuthResponse = try await apiClient.request(
            endpoint: .signUp,
            method: .post,
            body: body
        )
        handleAuthResponse(response)
        return response
    }

    func signIn(email: String, password: String) async throws -> AuthResponse {
        let body = SignInRequest(email: email, password: password)
        let response: AuthResponse = try await apiClient.request(
            endpoint: .signIn,
            method: .post,
            body: body
        )
        handleAuthResponse(response)
        return response
    }

    func signOut() async {
        try? await apiClient.requestVoid(endpoint: .signOut, method: .post)
        currentUserId = nil
        apiClient.setAuthToken(nil)
        keychainService.deleteToken()
    }

    // MARK: - Sign in with Apple

    func handleAppleSignIn(result: Result<ASAuthorization, Error>) async throws {
        guard case .success(let authorization) = result,
              let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let identityToken = credential.identityToken,
              let tokenString = String(data: identityToken, encoding: .utf8) else {
            throw AuthError.appleSignInFailed
        }

        // Exchange Apple token with Supabase auth
        let body = AppleSignInRequest(idToken: tokenString)
        let response: AuthResponse = try await apiClient.request(
            endpoint: Endpoint(path: "/auth/v1/token", queryItems: [("grant_type", "id_token")]),
            method: .post,
            body: body
        )
        handleAuthResponse(response)
    }

    // MARK: - Session Management

    private func handleAuthResponse(_ response: AuthResponse) {
        currentUserId = response.user.id
        apiClient.setAuthToken(response.accessToken)
        keychainService.saveToken(response.accessToken)
    }

    private func restoreSession() {
        guard let token = keychainService.loadToken() else { return }
        apiClient.setAuthToken(token)
        // TODO: Validate token is still valid via /auth/v1/user
    }
}

// MARK: - Auth Models

struct SignUpRequest: Encodable {
    let email: String
    let password: String
}

struct SignInRequest: Encodable {
    let email: String
    let password: String
}

struct AppleSignInRequest: Encodable {
    let idToken: String
    let provider: String = "apple"
}

struct AuthResponse: Decodable {
    let accessToken: String
    let tokenType: String
    let expiresIn: Int
    let refreshToken: String
    let user: AuthUser
}

struct AuthUser: Decodable {
    let id: UUID
    let email: String?
}

enum AuthError: LocalizedError {
    case appleSignInFailed
    case invalidCredentials
    case sessionExpired

    var errorDescription: String? {
        switch self {
        case .appleSignInFailed: "Anmeldung mit Apple fehlgeschlagen"
        case .invalidCredentials: "Ungültige Anmeldedaten"
        case .sessionExpired: "Sitzung abgelaufen. Bitte erneut anmelden."
        }
    }
}
