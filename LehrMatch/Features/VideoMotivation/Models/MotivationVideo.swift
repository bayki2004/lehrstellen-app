import Foundation

struct MotivationVideo: Identifiable, Codable {
    let id: UUID
    let studentId: UUID
    let lehrstelleId: UUID?
    let matchId: UUID?
    var scriptText: String
    var videoUrl: String?
    var thumbnailUrl: String?
    var generationStatus: VideoGenerationStatus
    let language: AppLanguage
    var durationSeconds: Int?
    let createdAt: Date

    var videoURL: URL? {
        guard let url = videoUrl else { return nil }
        return URL(string: url)
    }

    var isReady: Bool { generationStatus == .completed }
    var isProcessing: Bool { generationStatus == .processing || generationStatus == .pending }
}

enum VideoGenerationStatus: String, Codable {
    case pending
    case generatingScript
    case scriptReady
    case processing
    case completed
    case failed
}

// MARK: - Requests

struct GenerateScriptRequest: Encodable {
    let studentId: UUID
    let lehrstelleId: UUID?
    let matchId: UUID?
    let language: String
}

struct CreateVideoRequest: Encodable {
    let scriptText: String
    let language: String
    let studentId: UUID
    let lehrstelleId: UUID?
}

// MARK: - Sample Data

extension MotivationVideo {
    static let sample = MotivationVideo(
        id: UUID(),
        studentId: UUID(),
        lehrstelleId: UUID(),
        matchId: UUID(),
        scriptText: "Grüezi! Ich bin Max Muster, 15 Jahre alt, aus Zürich. Informatik ist meine Leidenschaft — seit der 7. Klasse programmiere ich in meiner Freizeit. Bei Swisscom möchte ich meine Begeisterung für Technologie in die Praxis umsetzen...",
        videoUrl: nil,
        thumbnailUrl: nil,
        generationStatus: .scriptReady,
        language: .de,
        durationSeconds: nil,
        createdAt: .now
    )
}
