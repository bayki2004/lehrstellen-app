import Foundation
import CoreLocation

struct CommuteResult: Sendable {
    let durationMinutes: Int
    let transfers: Int
    let departure: String
}

actor CommuteService {
    private var cache: [String: CacheEntry] = [:]
    private let session: URLSession

    private struct CacheEntry {
        let result: CommuteResult
        let timestamp: Date
    }

    init(session: URLSession = .shared) {
        self.session = session
    }

    func fetchCommuteTime(from origin: CLLocationCoordinate2D, to destination: CLLocationCoordinate2D) async throws -> CommuteResult {
        let cacheKey = cacheKey(from: origin, to: destination)

        // Check cache (7-day expiry)
        if let cached = cache[cacheKey], Date().timeIntervalSince(cached.timestamp) < 7 * 24 * 3600 {
            return cached.result
        }

        let result = try await fetchFromAPI(from: origin, to: destination)
        cache[cacheKey] = CacheEntry(result: result, timestamp: .now)
        return result
    }

    private func fetchFromAPI(from origin: CLLocationCoordinate2D, to destination: CLLocationCoordinate2D) async throws -> CommuteResult {
        var components = URLComponents(string: "https://transport.opendata.ch/v1/connections")!
        components.queryItems = [
            URLQueryItem(name: "from", value: "\(origin.latitude),\(origin.longitude)"),
            URLQueryItem(name: "to", value: "\(destination.latitude),\(destination.longitude)"),
            URLQueryItem(name: "limit", value: "1"),
        ]

        guard let url = components.url else {
            throw CommuteError.invalidURL
        }

        let (data, response) = try await session.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw CommuteError.requestFailed
        }

        let decoded = try JSONDecoder().decode(TransportResponse.self, from: data)

        guard let connection = decoded.connections.first else {
            throw CommuteError.noConnectionFound
        }

        let durationMinutes = parseDuration(connection.duration)
        let transfers = connection.transfers

        return CommuteResult(
            durationMinutes: durationMinutes,
            transfers: transfers,
            departure: connection.from.departure ?? ""
        )
    }

    private func parseDuration(_ duration: String) -> Int {
        // Format: "00d00:35:00" or "00:35:00"
        let parts = duration.replacingOccurrences(of: "d", with: ":").split(separator: ":")
        guard parts.count >= 2 else { return 0 }

        if parts.count == 4 {
            // days:hours:minutes:seconds
            let days = Int(parts[0]) ?? 0
            let hours = Int(parts[1]) ?? 0
            let minutes = Int(parts[2]) ?? 0
            return days * 24 * 60 + hours * 60 + minutes
        } else {
            // hours:minutes:seconds
            let hours = Int(parts[0]) ?? 0
            let minutes = Int(parts[1]) ?? 0
            return hours * 60 + minutes
        }
    }

    private func cacheKey(from origin: CLLocationCoordinate2D, to destination: CLLocationCoordinate2D) -> String {
        // Round to 3 decimal places (~100m precision) for cache key
        let oLat = (origin.latitude * 1000).rounded() / 1000
        let oLng = (origin.longitude * 1000).rounded() / 1000
        let dLat = (destination.latitude * 1000).rounded() / 1000
        let dLng = (destination.longitude * 1000).rounded() / 1000
        return "\(oLat),\(oLng)->\(dLat),\(dLng)"
    }
}

enum CommuteError: LocalizedError {
    case invalidURL
    case requestFailed
    case noConnectionFound

    var errorDescription: String? {
        switch self {
        case .invalidURL: "Ungültige URL"
        case .requestFailed: "Verbindungsabfrage fehlgeschlagen"
        case .noConnectionFound: "Keine ÖV-Verbindung gefunden"
        }
    }
}

// MARK: - Transport API Response

private struct TransportResponse: Decodable {
    let connections: [Connection]

    struct Connection: Decodable {
        let from: Checkpoint
        let to: Checkpoint
        let duration: String
        let transfers: Int
    }

    struct Checkpoint: Decodable {
        let departure: String?
        let arrival: String?
    }
}
