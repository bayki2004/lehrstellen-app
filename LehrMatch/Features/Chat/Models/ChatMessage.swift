import Foundation

struct ChatMessage: Identifiable, Codable, Equatable {
    let id: UUID
    let matchId: UUID
    let senderType: SenderType
    let senderId: UUID
    let content: String
    let messageType: MessageType
    var readAt: Date?
    let createdAt: Date

    var isFromStudent: Bool { senderType == .student }

    enum SenderType: String, Codable {
        case student
        case company
        case system
    }

    enum MessageType: String, Codable {
        case text
        case image
        case video
        case system
    }
}

// MARK: - Sample Data

extension ChatMessage {
    static func samples(matchId: UUID, studentId: UUID) -> [ChatMessage] {
        let companyId = UUID()
        return [
            ChatMessage(
                id: UUID(),
                matchId: matchId,
                senderType: .system,
                senderId: UUID(),
                content: "Ihr habt ein Match! Startet eine Unterhaltung.",
                messageType: .system,
                readAt: .now,
                createdAt: .now.addingTimeInterval(-86400)
            ),
            ChatMessage(
                id: UUID(),
                matchId: matchId,
                senderType: .company,
                senderId: companyId,
                content: "Hallo! Wir freuen uns über dein Interesse an unserer Lehrstelle. Hast du Fragen zur Stelle?",
                messageType: .text,
                readAt: .now,
                createdAt: .now.addingTimeInterval(-3600)
            ),
            ChatMessage(
                id: UUID(),
                matchId: matchId,
                senderType: .student,
                senderId: studentId,
                content: "Hallo! Ja, mich würde interessieren, wie ein typischer Tag als Lehrling bei euch aussieht?",
                messageType: .text,
                readAt: .now,
                createdAt: .now.addingTimeInterval(-1800)
            ),
        ]
    }
}
