import Foundation

struct Zeugnis: Identifiable, Codable {
    let id: UUID
    let studentId: UUID
    let fileUrl: String
    let fileName: String
    let fileType: String
    let fileSizeBytes: Int64?
    let uploadedAt: Date

    var fileURL: URL? {
        URL(string: fileUrl)
    }

    var formattedSize: String {
        guard let bytes = fileSizeBytes else { return "" }
        let formatter = ByteCountFormatter()
        formatter.allowedUnits = [.useKB, .useMB]
        formatter.countStyle = .file
        return formatter.string(fromByteCount: bytes)
    }

    var isImage: Bool { fileType == "image" }
    var isPDF: Bool { fileType == "pdf" }
}
