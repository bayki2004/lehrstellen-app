import Foundation

@MainActor
@Observable
final class MatchesViewModel {
    var matches: [Match] = []
    var isLoading = false
    var errorMessage: String?

    private let apiClient: APIClient
    private let studentId: UUID

    init(apiClient: APIClient, studentId: UUID) {
        self.apiClient = apiClient
        self.studentId = studentId
    }

    var newMatches: [Match] {
        matches.filter { $0.isNew }
    }

    var conversations: [Match] {
        matches.filter { !$0.isNew }
            .sorted { ($0.lastMessageAt ?? .distantPast) > ($1.lastMessageAt ?? .distantPast) }
    }

    var totalUnread: Int {
        matches.reduce(0) { $0 + $1.unreadCount }
    }

    func loadMatches() async {
        guard !isLoading else { return }
        isLoading = true
        defer { isLoading = false }

        do {
            matches = try await apiClient.request(
                endpoint: .matches(studentId: studentId)
            )
        } catch {
            // Use sample data for development
            matches = Match.samples
        }
    }

    func archiveMatch(_ match: Match) async {
        guard let index = matches.firstIndex(where: { $0.id == match.id }) else { return }
        matches[index].status = .archived
        matches.remove(at: index)

        try? await apiClient.requestVoid(
            endpoint: Endpoint(path: "/rest/v1/matches", queryItems: [("id", "eq.\(match.id)")]),
            method: .patch,
            body: ["status": "archived"]
        )
    }
}
