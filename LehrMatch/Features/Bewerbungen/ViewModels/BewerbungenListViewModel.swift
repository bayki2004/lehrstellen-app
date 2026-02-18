import Foundation

@MainActor
@Observable
final class BewerbungenListViewModel {
    var bewerbungen: [Bewerbung] = []
    var isLoading = false
    var errorMessage: String?
    var selectedFilter: BewerbungFilter = .all

    private let apiClient: APIClient
    private let studentId: UUID

    init(apiClient: APIClient, studentId: UUID) {
        self.apiClient = apiClient
        self.studentId = studentId
    }

    var filteredBewerbungen: [Bewerbung] {
        switch selectedFilter {
        case .all: bewerbungen
        case .active: bewerbungen.filter { $0.status.isActive }
        case .invitations: bewerbungen.filter { $0.status == .interviewInvited || $0.status == .schnupperlehreScheduled || $0.status == .offer }
        case .rejected: bewerbungen.filter { $0.status == .rejected || $0.status == .withdrawn }
        }
    }

    func loadBewerbungen() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let results: [Bewerbung] = try await apiClient.request(
                endpoint: .bewerbungen(studentId: studentId)
            )
            bewerbungen = results
        } catch {
            if bewerbungen.isEmpty {
                bewerbungen = Bewerbung.samples
            }
            errorMessage = error.localizedDescription
        }
    }

    func withdrawBewerbung(_ id: UUID) async {
        guard let index = bewerbungen.firstIndex(where: { $0.id == id }) else { return }
        let original = bewerbungen[index]
        bewerbungen[index].status = .withdrawn

        do {
            try await apiClient.requestVoid(
                endpoint: .bewerbung(id: id),
                method: .patch,
                body: ["status": "withdrawn"]
            )
        } catch {
            bewerbungen[index] = original
        }
    }
}

enum BewerbungFilter: String, CaseIterable {
    case all
    case active
    case invitations
    case rejected

    var displayName: String {
        switch self {
        case .all: "Alle"
        case .active: "Offen"
        case .invitations: "Einladungen"
        case .rejected: "Abgesagt"
        }
    }
}
