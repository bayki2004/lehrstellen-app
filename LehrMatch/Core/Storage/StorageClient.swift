import Foundation

@MainActor
@Observable
final class StorageClient {
    private let config: SupabaseConfig
    private let session: URLSession

    init(config: SupabaseConfig = .current, session: URLSession = .shared) {
        self.config = config
        self.session = session
    }

    /// Upload a file to a Supabase Storage bucket.
    /// Files are stored under `{userId}/{fileName}` to enforce RLS.
    func uploadFile(
        data: Data,
        fileName: String,
        bucket: String,
        contentType: String,
        userId: UUID
    ) async throws -> String {
        let path = "\(userId)/\(fileName)"
        let url = config.url
            .appendingPathComponent("storage/v1/object/\(bucket)/\(path)")

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(config.anonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(config.anonKey)", forHTTPHeaderField: "Authorization")
        request.setValue(contentType, forHTTPHeaderField: "Content-Type")
        request.setValue("true", forHTTPHeaderField: "x-upsert")
        request.httpBody = data

        let (_, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw StorageError.uploadFailed
        }

        return getPublicUrl(bucket: bucket, path: path)
    }

    /// Delete a file from a Supabase Storage bucket.
    func deleteFile(path: String, bucket: String) async throws {
        let url = config.url
            .appendingPathComponent("storage/v1/object/\(bucket)/\(path)")

        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        request.setValue(config.anonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(config.anonKey)", forHTTPHeaderField: "Authorization")

        let (_, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw StorageError.deleteFailed
        }
    }

    /// Get the public URL for a file in a public bucket.
    func getPublicUrl(bucket: String, path: String) -> String {
        config.url
            .appendingPathComponent("storage/v1/object/public/\(bucket)/\(path)")
            .absoluteString
    }
}

enum StorageError: LocalizedError {
    case uploadFailed
    case deleteFailed

    var errorDescription: String? {
        switch self {
        case .uploadFailed: "Datei konnte nicht hochgeladen werden."
        case .deleteFailed: "Datei konnte nicht gelöscht werden."
        }
    }
}
