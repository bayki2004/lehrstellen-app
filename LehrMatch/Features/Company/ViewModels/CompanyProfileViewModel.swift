import Foundation

@MainActor
@Observable
final class CompanyProfileViewModel {
    var profile: CompanyProfile?
    var isLoading = false
    var isSaving = false
    var errorMessage: String?

    // Edit state
    var isEditing = false
    var editDescription = ""
    var editWebsite = ""
    var editVideoUrl = ""
    var editLinks: [(label: String, url: String)] = []

    private let apiClient: ExpressAPIClient

    init(apiClient: ExpressAPIClient) {
        self.apiClient = apiClient
    }

    func loadProfile() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            profile = try await apiClient.request(
                path: ExpressEndpoint.companyMe.path
            )
        } catch {
            if profile == nil {
                profile = CompanyProfile.sample
            }
            errorMessage = error.localizedDescription
        }
    }

    func startEditing() {
        guard let profile else { return }
        editDescription = profile.description
        editWebsite = profile.website ?? ""
        editVideoUrl = profile.videoUrl ?? ""
        editLinks = profile.links.map { (label: $0.label, url: $0.url) }
        isEditing = true
    }

    func cancelEditing() {
        isEditing = false
    }

    func saveProfile() async {
        isSaving = true
        defer { isSaving = false }

        do {
            let request = UpdateCompanyProfileRequest(
                description: editDescription,
                website: editWebsite.isEmpty ? nil : editWebsite,
                videoUrl: editVideoUrl.isEmpty ? nil : editVideoUrl,
                links: editLinks
                    .filter { !$0.label.isEmpty && !$0.url.isEmpty }
                    .map { CompanyLinkInput(label: $0.label, url: $0.url) }
            )
            try await apiClient.requestVoid(
                path: ExpressEndpoint.updateCompany.path,
                method: .patch,
                body: request
            )
            await loadProfile()
            isEditing = false
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func deletePhoto(id: String) async {
        do {
            try await apiClient.requestVoid(
                path: ExpressEndpoint.deleteCompanyPhoto(id: id).path,
                method: .delete
            )
            await loadProfile()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func deleteVideo() async {
        do {
            try await apiClient.requestVoid(
                path: ExpressEndpoint.deleteCompanyVideo.path,
                method: .delete
            )
            await loadProfile()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
