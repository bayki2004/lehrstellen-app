import Foundation

/// API client for the Express.js backend (company-side features).
/// Mirrors `APIClient` but targets the Express API with JWT auth.
@MainActor
@Observable
final class ExpressAPIClient {
    private let baseURL: URL
    private let session: URLSession
    private(set) var accessToken: String?
    private var refreshToken: String?

    init(
        baseURL: URL = ExpressConfig.baseURL,
        session: URLSession = .shared
    ) {
        self.baseURL = baseURL
        self.session = session
    }

    // MARK: - Auth

    func setTokens(access: String, refresh: String) {
        self.accessToken = access
        self.refreshToken = refresh
    }

    func clearTokens() {
        self.accessToken = nil
        self.refreshToken = nil
    }

    var isAuthenticated: Bool {
        accessToken != nil
    }

    func login(email: String, password: String) async throws -> ExpressAuthResponse {
        let body = ["email": email, "password": password]
        let response: ExpressAuthResponse = try await request(
            path: "/auth/login",
            method: .post,
            body: body
        )
        setTokens(access: response.accessToken, refresh: response.refreshToken)
        return response
    }

    func register(email: String, password: String, role: String) async throws -> ExpressAuthResponse {
        let body = ["email": email, "password": password, "role": role]
        let response: ExpressAuthResponse = try await request(
            path: "/auth/register",
            method: .post,
            body: body
        )
        setTokens(access: response.accessToken, refresh: response.refreshToken)
        return response
    }

    func refreshAccessToken() async throws {
        guard let refreshToken else { throw ExpressAPIError.noRefreshToken }
        let body = ["refreshToken": refreshToken]
        let response: ExpressAuthResponse = try await request(
            path: "/auth/refresh",
            method: .post,
            body: body
        )
        setTokens(access: response.accessToken, refresh: response.refreshToken)
    }

    func logout() async {
        if let refreshToken {
            try? await requestVoid(
                path: "/auth/logout",
                method: .post,
                body: ["refreshToken": refreshToken]
            )
        }
        clearTokens()
    }

    // MARK: - Generic Requests

    func request<T: Decodable>(
        path: String,
        method: HTTPMethod = .get,
        body: (any Encodable)? = nil
    ) async throws -> T {
        let request = try buildRequest(path: path, method: method, body: body)
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw ExpressAPIError.invalidResponse
        }

        if httpResponse.statusCode == 401 {
            // Try token refresh
            if refreshToken != nil {
                try await refreshAccessToken()
                let retryRequest = try buildRequest(path: path, method: method, body: body)
                let (retryData, retryResponse) = try await session.data(for: retryRequest)
                guard let retryHttp = retryResponse as? HTTPURLResponse,
                      (200...299).contains(retryHttp.statusCode) else {
                    throw ExpressAPIError.unauthorized
                }
                return try JSONDecoder.api.decode(T.self, from: retryData)
            }
            throw ExpressAPIError.unauthorized
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw ExpressAPIError.httpError(statusCode: httpResponse.statusCode, data: data)
        }

        return try JSONDecoder.api.decode(T.self, from: data)
    }

    func requestVoid(
        path: String,
        method: HTTPMethod = .post,
        body: (any Encodable)? = nil
    ) async throws {
        let request = try buildRequest(path: path, method: method, body: body)
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw ExpressAPIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw ExpressAPIError.httpError(statusCode: httpResponse.statusCode, data: data)
        }
    }

    // MARK: - Multipart Upload

    func upload<T: Decodable>(
        path: String,
        fileData: Data,
        filename: String,
        mimeType: String,
        fieldName: String = "file"
    ) async throws -> T {
        let boundary = UUID().uuidString
        var request = URLRequest(url: baseURL.appending(path: path))
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        if let accessToken {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }

        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"\(fieldName)\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        body.append(fileData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw ExpressAPIError.uploadFailed
        }

        return try JSONDecoder.api.decode(T.self, from: data)
    }

    // MARK: - Request Builder

    private func buildRequest(
        path: String,
        method: HTTPMethod,
        body: (any Encodable)?
    ) throws -> URLRequest {
        var request = URLRequest(url: baseURL.appending(path: path))
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let accessToken {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            request.httpBody = try JSONEncoder.api.encode(body)
        }

        return request
    }
}

// MARK: - Configuration

enum ExpressConfig {
    #if DEBUG
    static let baseURL = URL(string: "http://localhost:3000/api")!
    #else
    static let baseURL = URL(string: "https://api.lehrmatch.ch/api")!
    #endif
}

// MARK: - Error Types

enum ExpressAPIError: LocalizedError {
    case invalidResponse
    case httpError(statusCode: Int, data: Data)
    case unauthorized
    case noRefreshToken
    case uploadFailed

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            "Ungültige Serverantwort"
        case .httpError(let code, _):
            "Serverfehler (\(code))"
        case .unauthorized:
            "Nicht autorisiert. Bitte erneut anmelden."
        case .noRefreshToken:
            "Sitzung abgelaufen. Bitte erneut anmelden."
        case .uploadFailed:
            "Upload fehlgeschlagen"
        }
    }
}

// MARK: - Auth Response

struct ExpressAuthResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let user: ExpressUser
}

struct ExpressUser: Codable {
    let id: String
    let email: String
    let role: String
    let hasProfile: Bool
    let hasCompletedQuiz: Bool
}
