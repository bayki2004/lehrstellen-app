import Foundation

@MainActor
@Observable
final class RealtimeClient {
    private var webSocketTask: URLSessionWebSocketTask?
    private let session: URLSession
    private let config: SupabaseConfig
    private var messageHandlers: [UUID: (ChatMessage) -> Void] = [:]
    private var matchHandlers: [(Match) -> Void] = []
    private var heartbeatTimer: Timer?
    var isConnected = false

    init(
        config: SupabaseConfig = .current,
        session: URLSession = .shared
    ) {
        self.config = config
        self.session = session
    }

    func connect(authToken: String) {
        var urlComponents = URLComponents(url: config.realtimeURL, resolvingAgainstBaseURL: false)
        urlComponents?.queryItems = [
            URLQueryItem(name: "apikey", value: config.anonKey),
            URLQueryItem(name: "token", value: authToken),
            URLQueryItem(name: "vsn", value: "1.0.0")
        ]

        guard let url = urlComponents?.url else { return }

        webSocketTask = session.webSocketTask(with: url)
        webSocketTask?.resume()
        isConnected = true
        listenForMessages()
        startHeartbeat()
    }

    func disconnect() {
        heartbeatTimer?.invalidate()
        heartbeatTimer = nil
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        webSocketTask = nil
        isConnected = false
        messageHandlers.removeAll()
        matchHandlers.removeAll()
    }

    // MARK: - Subscriptions

    func subscribeToMessages(matchId: UUID, handler: @escaping (ChatMessage) -> Void) {
        messageHandlers[matchId] = handler

        // Send Supabase Realtime channel join for this match's messages
        let joinPayload: [String: Any] = [
            "topic": "realtime:public:messages:match_id=eq.\(matchId.uuidString)",
            "event": "phx_join",
            "payload": ["config": ["postgres_changes": [
                ["event": "INSERT", "schema": "public", "table": "messages", "filter": "match_id=eq.\(matchId.uuidString)"]
            ]]],
            "ref": matchId.uuidString
        ]
        sendJSON(joinPayload)
    }

    func unsubscribeFromMessages(matchId: UUID) {
        messageHandlers.removeValue(forKey: matchId)
    }

    func subscribeToMatches(studentId: UUID, handler: @escaping (Match) -> Void) {
        matchHandlers.append(handler)

        let joinPayload: [String: Any] = [
            "topic": "realtime:public:matches:student_id=eq.\(studentId.uuidString)",
            "event": "phx_join",
            "payload": ["config": ["postgres_changes": [
                ["event": "INSERT", "schema": "public", "table": "matches", "filter": "student_id=eq.\(studentId.uuidString)"]
            ]]],
            "ref": "matches"
        ]
        sendJSON(joinPayload)
    }

    // MARK: - Internal

    private func startHeartbeat() {
        heartbeatTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { [weak self] _ in
            let heartbeat: [String: Any] = [
                "topic": "phoenix",
                "event": "heartbeat",
                "payload": [:],
                "ref": "heartbeat"
            ]
            Task { @MainActor [weak self] in
                self?.sendJSON(heartbeat)
            }
        }
    }

    private func sendJSON(_ dict: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: dict),
              let string = String(data: data, encoding: .utf8) else { return }
        webSocketTask?.send(.string(string)) { _ in }
    }

    private func listenForMessages() {
        webSocketTask?.receive { [weak self] result in
            Task { @MainActor [weak self] in
                switch result {
                case .success(let message):
                    self?.handleWebSocketMessage(message)
                    self?.listenForMessages()
                case .failure:
                    self?.isConnected = false
                }
            }
        }
    }

    private func handleWebSocketMessage(_ message: URLSessionWebSocketTask.Message) {
        guard case .string(let text) = message,
              let data = text.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let event = json["event"] as? String,
              event == "postgres_changes",
              let payload = json["payload"] as? [String: Any],
              let record = payload["record"] as? [String: Any] else {
            return
        }

        let table = (payload["table"] as? String) ?? ""

        if table == "messages",
           let recordData = try? JSONSerialization.data(withJSONObject: record),
           let chatMessage = try? JSONDecoder.api.decode(ChatMessage.self, from: recordData),
           let handler = messageHandlers[chatMessage.matchId] {
            handler(chatMessage)
        }

        if table == "matches",
           let recordData = try? JSONSerialization.data(withJSONObject: record),
           let match = try? JSONDecoder.api.decode(Match.self, from: recordData) {
            for handler in matchHandlers {
                handler(match)
            }
        }
    }
}
