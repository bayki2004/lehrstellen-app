import Foundation

@MainActor
@Observable
final class CompanyDashboardViewModel {
    var totalListings = 0
    var activeListings = 0
    var totalApplications = 0
    var pendingApplications = 0
    var isLoading = false
    var errorMessage: String?

    private let apiClient: ExpressAPIClient

    init(apiClient: ExpressAPIClient) {
        self.apiClient = apiClient
    }

    func loadDashboard() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let listings: [CompanyListing] = try await apiClient.request(
                path: ExpressEndpoint.myListings.path
            )
            totalListings = listings.count
            activeListings = listings.filter { $0.isActive == true }.count

            let applications: [CompanyApplication] = try await apiClient.request(
                path: ExpressEndpoint.applications.path
            )
            totalApplications = applications.count
            pendingApplications = applications.filter { $0.status == .pending }.count
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
