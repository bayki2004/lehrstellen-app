import Foundation

enum SearchSegment: String, CaseIterable {
    case lehrstellen = "Lehrstellen"
    case berufe = "Berufe"
    case berufsschulen = "Schulen"
}

@MainActor
@Observable
final class SearchViewModel {
    var searchText: String = ""
    var allLehrstellen: [LehrstelleCard] = []
    var allBerufsschulen: [Berufsschule] = []
    var allBerufe: [Beruf] = []
    var selectedCantons: Set<String> = []
    var selectedSegment: SearchSegment = .lehrstellen
    var isLoading = false

    private let apiClient: APIClient

    init(apiClient: APIClient) {
        self.apiClient = apiClient
    }

    var filteredLehrstellen: [LehrstelleCard] {
        var result = allLehrstellen

        if !searchText.isEmpty {
            let query = searchText.lowercased()
            result = result.filter {
                $0.companyName.lowercased().contains(query) ||
                $0.berufTitle.lowercased().contains(query) ||
                $0.title.lowercased().contains(query) ||
                $0.city.lowercased().contains(query) ||
                $0.canton.lowercased().contains(query) ||
                ($0.berufCategory?.lowercased().contains(query) ?? false)
            }
        }

        if !selectedCantons.isEmpty {
            result = result.filter { selectedCantons.contains($0.canton) }
        }

        return result
    }

    var filteredBerufsschulen: [Berufsschule] {
        var result = allBerufsschulen

        if !searchText.isEmpty {
            let query = searchText.lowercased()
            result = result.filter {
                $0.name.lowercased().contains(query) ||
                $0.city.lowercased().contains(query) ||
                $0.canton.lowercased().contains(query)
            }
        }

        if !selectedCantons.isEmpty {
            result = result.filter { selectedCantons.contains($0.canton) }
        }

        return result
    }

    var filteredBerufe: [Beruf] {
        var result = allBerufe

        if !searchText.isEmpty {
            let query = searchText.lowercased()
            result = result.filter {
                $0.nameDe.lowercased().contains(query) ||
                ($0.field?.lowercased().contains(query) ?? false)
            }
        }

        return result
    }

    var activeResultCount: Int {
        switch selectedSegment {
        case .lehrstellen: filteredLehrstellen.count
        case .berufe: filteredBerufe.count
        case .berufsschulen: filteredBerufsschulen.count
        }
    }

    func loadData() async {
        isLoading = true
        defer { isLoading = false }

        async let schoolsFetch: [Berufsschule] = {
            do {
                return try await apiClient.request(endpoint: .berufsschulen)
            } catch {
                return []
            }
        }()

        async let berufeFetch: [Beruf] = {
            do {
                return try await apiClient.request(endpoint: .berufe)
            } catch {
                return Beruf.samples
            }
        }()

        allBerufsschulen = await schoolsFetch
        allBerufe = await berufeFetch

        // Lehrstellen use sample data for demo mode
        allLehrstellen = LehrstelleCard.samples
    }

    func toggleCanton(_ canton: String) {
        if selectedCantons.contains(canton) {
            selectedCantons.remove(canton)
        } else {
            selectedCantons.insert(canton)
        }
    }

    func clearFilters() {
        selectedCantons.removeAll()
        searchText = ""
    }
}
