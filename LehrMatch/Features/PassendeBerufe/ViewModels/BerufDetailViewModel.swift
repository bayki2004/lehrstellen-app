import Foundation

@MainActor
@Observable
final class BerufDetailViewModel {
    var beruf: Beruf?
    var matchPercentage: Int = 0
    var sharedDimensions: [SharedDimension] = []
    var explanations: [String] = []
    var lehrstellenCount: Int = 0
    var isLoading = false

    private let apiClient: APIClient
    private let hollandCodes: HollandCodes
    let berufCode: String

    init(apiClient: APIClient, hollandCodes: HollandCodes, berufCode: String) {
        self.apiClient = apiClient
        self.hollandCodes = hollandCodes
        self.berufCode = berufCode
    }

    var userVector: [Double] { hollandCodes.asVector }

    var berufVector: [Double] {
        let keys = ["realistic", "investigative", "artistic", "social", "enterprising", "conventional"]
        guard let fit = beruf?.personalityFit else { return Array(repeating: 0, count: 6) }
        return keys.map { fit[$0] ?? 0 }
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let berufe: [Beruf] = try await apiClient.request(endpoint: .berufeWithRIASEC)
            beruf = berufe.first { $0.code == berufCode }
        } catch {
            // Use sample data for development
            beruf = Beruf.samples.first { $0.code == berufCode }
        }

        guard let beruf, let fit = beruf.personalityFit, !fit.isEmpty else { return }

        matchPercentage = RIASECMatchingEngine.calculateMatchScore(user: hollandCodes, beruf: fit)
        sharedDimensions = RIASECMatchingEngine.findSharedDimensions(user: hollandCodes, beruf: fit)
        explanations = RIASECMatchingEngine.generateExplanations(sharedDimensions: sharedDimensions)

        do {
            struct IdOnly: Codable { let id: UUID }
            let items: [IdOnly] = try await apiClient.request(
                endpoint: .lehrstellenCount(berufCode: berufCode)
            )
            lehrstellenCount = items.count
        } catch {
            lehrstellenCount = 3
        }
    }
}
