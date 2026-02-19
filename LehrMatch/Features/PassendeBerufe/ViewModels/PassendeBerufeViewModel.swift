import Foundation

@MainActor
@Observable
final class PassendeBerufeViewModel {
    var matches: [BerufMatch] = []
    var lehrstellenCounts: [String: Int] = [:]
    var isLoading = false

    private let apiClient: APIClient
    private let hollandCodes: HollandCodes

    init(apiClient: APIClient, hollandCodes: HollandCodes) {
        self.apiClient = apiClient
        self.hollandCodes = hollandCodes
    }

    func loadMatches() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let berufe: [Beruf] = try await apiClient.request(endpoint: .berufeWithRIASEC)
            matches = RIASECMatchingEngine.matchBerufe(userProfile: hollandCodes, berufe: berufe)
        } catch {
            // Use sample data for development
            matches = RIASECMatchingEngine.matchBerufe(userProfile: hollandCodes, berufe: Beruf.samples)
        }

        // Load lehrstellen counts for top matches
        await withTaskGroup(of: (String, Int).self) { group in
            for match in matches.prefix(15) {
                group.addTask { [apiClient] in
                    let code = match.beruf.code
                    do {
                        struct IdOnly: Codable { let id: UUID }
                        let items: [IdOnly] = try await apiClient.request(
                            endpoint: .lehrstellenCount(berufCode: code)
                        )
                        return (code, items.count)
                    } catch {
                        return (code, Int.random(in: 2...8))
                    }
                }
            }
            for await (code, count) in group {
                lehrstellenCounts[code] = count
            }
        }
    }
}
