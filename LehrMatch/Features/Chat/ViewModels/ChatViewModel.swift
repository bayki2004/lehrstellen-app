import Foundation

@MainActor
@Observable
final class ChatViewModel {
    var messages: [ChatMessage] = []
    var newMessageText = ""
    var isLoading = false
    var isSending = false

    private let apiClient: APIClient
    private let realtimeClient: RealtimeClient
    let matchId: UUID
    private let studentId: UUID

    init(apiClient: APIClient, realtimeClient: RealtimeClient, matchId: UUID, studentId: UUID) {
        self.apiClient = apiClient
        self.realtimeClient = realtimeClient
        self.matchId = matchId
        self.studentId = studentId
    }

    var canSend: Bool {
        !newMessageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !isSending
    }

    func loadMessages() async {
        isLoading = true
        defer { isLoading = false }

        do {
            messages = try await apiClient.request(
                endpoint: .messages(bewerbungId: matchId)
            )
        } catch {
            // Use sample data for development
            messages = ChatMessage.samples(matchId: matchId, studentId: studentId)
        }
    }

    func sendMessage() async {
        let text = newMessageText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        isSending = true
        defer { isSending = false }

        let message = ChatMessage(
            id: UUID(),
            matchId: matchId,
            senderType: .student,
            senderId: studentId,
            content: text,
            messageType: .text,
            readAt: nil,
            createdAt: .now
        )

        // Optimistic update
        messages.append(message)
        newMessageText = ""

        do {
            try await apiClient.requestVoid(
                endpoint: .messages(bewerbungId: matchId),
                method: .post,
                body: message
            )
        } catch {
            // Message added optimistically; in production, mark as failed
        }
    }

    func subscribeToRealtime() {
        realtimeClient.subscribeToMessages(matchId: matchId) { [weak self] message in
            self?.messages.append(message)
        }
    }

    func unsubscribeFromRealtime() {
        realtimeClient.unsubscribeFromMessages(matchId: matchId)
    }
}
