import Foundation

@MainActor
@Observable
final class CompanyBewerbungenViewModel {
    var applications: [CompanyApplication] = []
    var isLoading = false
    var errorMessage: String?
    var selectedFilter: CompanyApplicationFilter = .all

    private let apiClient: ExpressAPIClient

    init(apiClient: ExpressAPIClient) {
        self.apiClient = apiClient
    }

    var filteredApplications: [CompanyApplication] {
        switch selectedFilter {
        case .all: applications
        case .pending: applications.filter { $0.status == .pending }
        case .shortlisted: applications.filter { $0.status == .shortlisted || $0.status == .interviewScheduled }
        case .decided: applications.filter { $0.status == .accepted || $0.status == .rejected }
        }
    }

    func loadApplications() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            applications = try await apiClient.request(
                path: ExpressEndpoint.applications.path
            )
        } catch {
            if applications.isEmpty {
                applications = CompanyApplication.samples
            }
            errorMessage = error.localizedDescription
        }
    }

    func updateStatus(applicationId: String, newStatus: ApplicationStatus, note: String? = nil) async {
        guard let index = applications.firstIndex(where: { $0.id == applicationId }) else { return }
        let original = applications[index]
        applications[index].status = newStatus

        do {
            try await apiClient.requestVoid(
                path: ExpressEndpoint.updateApplicationStatus(id: applicationId).path,
                method: .patch,
                body: UpdateApplicationStatusRequest(status: newStatus.rawValue, note: note)
            )
        } catch {
            applications[index] = original
            errorMessage = error.localizedDescription
        }
    }
}

enum CompanyApplicationFilter: String, CaseIterable {
    case all
    case pending
    case shortlisted
    case decided

    var displayName: String {
        switch self {
        case .all: "Alle"
        case .pending: "Ausstehend"
        case .shortlisted: "Vorauswahl"
        case .decided: "Entschieden"
        }
    }
}
