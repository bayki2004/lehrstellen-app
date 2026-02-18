import Foundation
import AuthenticationServices

// MARK: - User Type

enum UserType: String, Codable, CaseIterable {
    case student
    case company

    var displayName: String {
        switch self {
        case .student: "Schüler/in"
        case .company: "Unternehmen"
        }
    }
}

@MainActor
@Observable
final class AuthManager {
    var currentUserId: UUID?
    var userType: UserType?
    var isSignedIn: Bool { currentUserId != nil }
    private let apiClient: APIClient
    private let keychainService = KeychainService()

    init(apiClient: APIClient) {
        self.apiClient = apiClient
        restoreSession()
    }

    // MARK: - Email/Password Auth

    func signUp(email: String, password: String, userType: UserType) async throws -> AuthResponse {
        let body = SignUpRequest(email: email, password: password, data: SignUpMetadata(userType: userType.rawValue))
        let response: AuthResponse = try await apiClient.request(
            endpoint: .signUp,
            method: .post,
            body: body
        )
        self.userType = userType
        keychainService.saveUserType(userType.rawValue)
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
        if let typeString = response.user.userMetadata?.userType {
            self.userType = UserType(rawValue: typeString)
            keychainService.saveUserType(typeString)
        }
        handleAuthResponse(response)
        return response
    }

    func signOut() async {
        try? await apiClient.requestVoid(endpoint: .signOut, method: .post)
        currentUserId = nil
        userType = nil
        apiClient.setAuthToken(nil)
        keychainService.deleteToken()
        keychainService.deleteUserType()
    }

    // MARK: - Sign in with Apple

    func handleAppleSignIn(result: Result<ASAuthorization, Error>, userType: UserType) async throws {
        guard case .success(let authorization) = result,
              let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let identityToken = credential.identityToken,
              let tokenString = String(data: identityToken, encoding: .utf8) else {
            throw AuthError.appleSignInFailed
        }

        let body = AppleSignInRequest(idToken: tokenString)
        let response: AuthResponse = try await apiClient.request(
            endpoint: Endpoint(path: "/auth/v1/token", queryItems: [("grant_type", "id_token")]),
            method: .post,
            body: body
        )
        self.userType = userType
        keychainService.saveUserType(userType.rawValue)
        handleAuthResponse(response)
    }

    /// Demo login for DEBUG builds
    func demoSignIn(as type: UserType) {
        currentUserId = UUID()
        userType = type
        keychainService.saveUserType(type.rawValue)
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
        if let typeString = keychainService.loadUserType() {
            userType = UserType(rawValue: typeString)
        }
    }
}

// MARK: - Auth Models

struct SignUpMetadata: Encodable {
    let userType: String
}

struct SignUpRequest: Encodable {
    let email: String
    let password: String
    let data: SignUpMetadata
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
    let userMetadata: UserMetadata?
}

struct UserMetadata: Decodable {
    let userType: String?
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
