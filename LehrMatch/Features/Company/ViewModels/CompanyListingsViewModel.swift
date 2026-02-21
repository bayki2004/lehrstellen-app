import Foundation

@MainActor
@Observable
final class CompanyListingsViewModel {
    var listings: [CompanyListing] = []
    var isLoading = false
    var errorMessage: String?

    private let apiClient: ExpressAPIClient

    init(apiClient: ExpressAPIClient) {
        self.apiClient = apiClient
    }

    func loadListings() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            listings = try await apiClient.request(
                path: ExpressEndpoint.myListings.path
            )
        } catch {
            if listings.isEmpty {
                listings = CompanyListing.samples
            }
            errorMessage = error.localizedDescription
        }
    }

    func createListing(_ request: CreateListingRequest) async -> Bool {
        do {
            let _: CompanyListing = try await apiClient.request(
                path: ExpressEndpoint.createListing.path,
                method: .post,
                body: request
            )
            await loadListings()
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    func deleteListing(id: String) async {
        guard let index = listings.firstIndex(where: { $0.id == id }) else { return }
        let removed = listings.remove(at: index)

        do {
            try await apiClient.requestVoid(
                path: ExpressEndpoint.deleteListing(id: id).path,
                method: .delete
            )
        } catch {
            listings.insert(removed, at: index)
            errorMessage = error.localizedDescription
        }
    }
}
