import Foundation

@MainActor
@Observable
final class APIClient {
    private let config: SupabaseConfig
    private let session: URLSession
    private var authToken: String?

    init(
        config: SupabaseConfig = .current,
        session: URLSession = .shared
    ) {
        self.config = config
        self.session = session
    }

    var baseURL: URL { config.url }
    var anonKey: String { config.anonKey }
    var realtimeURL: URL { config.realtimeURL }

    func setAuthToken(_ token: String?) {
        self.authToken = token
    }

    // MARK: - Generic Request

    func request<T: Decodable>(
        endpoint: Endpoint,
        method: HTTPMethod = .get,
        body: (any Encodable)? = nil
    ) async throws -> T {
        let request = try buildRequest(endpoint: endpoint, method: method, body: body)
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode, data: data)
        }

        return try JSONDecoder.api.decode(T.self, from: data)
    }

    func requestVoid(
        endpoint: Endpoint,
        method: HTTPMethod = .post,
        body: (any Encodable)? = nil
    ) async throws {
        let request = try buildRequest(endpoint: endpoint, method: method, body: body)
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode, data: data)
        }
    }

    // MARK: - Request Builder

    private func buildRequest(
        endpoint: Endpoint,
        method: HTTPMethod,
        body: (any Encodable)?
    ) throws -> URLRequest {
        var request = URLRequest(url: config.url.appending(path: endpoint.path))
        request.httpMethod = method.rawValue

        // Supabase requires the anon key on every request
        request.setValue(config.anonKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Supabase PostgREST: return inserted/updated rows as JSON
        if method == .post || method == .patch {
            request.setValue("return=representation", forHTTPHeaderField: "Prefer")
        }

        // Auth token (user JWT) — falls back to anon key for public endpoints
        if let authToken {
            request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        } else {
            request.setValue("Bearer \(config.anonKey)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            request.httpBody = try JSONEncoder.api.encode(body)
        }

        // Append query items
        for (key, value) in endpoint.queryItems {
            request.url = request.url?.appending(queryItems: [URLQueryItem(name: key, value: value)])
        }

        return request
    }
}

// MARK: - Supporting Types

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case patch = "PATCH"
    case delete = "DELETE"
}

enum APIError: LocalizedError {
    case invalidResponse
    case httpError(statusCode: Int, data: Data)
    case decodingError(Error)
    case unauthorized

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            "Ungültige Serverantwort"
        case .httpError(let code, _):
            "Serverfehler (\(code))"
        case .decodingError:
            "Daten konnten nicht verarbeitet werden"
        case .unauthorized:
            "Nicht autorisiert. Bitte erneut anmelden."
        }
    }
}

extension JSONEncoder {
    static let api: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }()
}

extension JSONDecoder {
    static let api: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }()
}
