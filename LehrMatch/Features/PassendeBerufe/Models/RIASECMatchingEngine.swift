import Foundation

enum RIASECMatchingEngine {

    private static let dimensionKeys = ["realistic", "investigative", "artistic", "social", "enterprising", "conventional"]

    private static let dimensionLabels: [String: String] = [
        "realistic": "Realistisch",
        "investigative": "Forschend",
        "artistic": "Künstlerisch",
        "social": "Sozial",
        "enterprising": "Unternehmerisch",
        "conventional": "Konventionell"
    ]

    private static let dimensionExplanations: [String: String] = [
        "realistic": "Du packsch gern aa und schaffsch mit de Händ — das isch genau, was me i dem Bruef bruucht.",
        "investigative": "Du bisch neugiirig und denksch gern nooche — ideal fürs Berufsfeld.",
        "artistic": "Dini kreativ Ader passt perfekt zu dem Bruef.",
        "social": "Du bisch gern mit Mensche zame und hilfsch andere — das steckt i dem Bruef drin.",
        "enterprising": "Du bisch initiatiivrych und chasch guet überzeuge — top fürs Berufsfeld.",
        "conventional": "Du bisch gnau, organisiert und zueverlaessig — das bruucht me gnau da."
    ]

    // MARK: - Public API

    static func matchBerufe(
        userProfile: HollandCodes,
        berufe: [Beruf],
        limit: Int = 15
    ) -> [BerufMatch] {
        berufe.compactMap { beruf in
            guard let fit = beruf.personalityFit, !fit.isEmpty else { return nil }
            let score = calculateMatchScore(user: userProfile, beruf: fit)
            let shared = findSharedDimensions(user: userProfile, beruf: fit)
            return BerufMatch(beruf: beruf, matchPercentage: score, sharedDimensions: shared)
        }
        .sorted { $0.matchPercentage > $1.matchPercentage }
        .prefix(limit)
        .map { $0 }
    }

    static func calculateMatchScore(user: HollandCodes, beruf: [String: Double]) -> Int {
        let userVec = user.asVector
        let berufVec = dimensionKeys.map { beruf[$0] ?? 0 }

        let dot = zip(userVec, berufVec).map(*).reduce(0, +)
        let magA = sqrt(userVec.map { $0 * $0 }.reduce(0, +))
        let magB = sqrt(berufVec.map { $0 * $0 }.reduce(0, +))

        guard magA > 0, magB > 0 else { return 0 }

        let similarity = dot / (magA * magB)
        return Int(max(0, similarity) * 100)
    }

    static func findSharedDimensions(
        user: HollandCodes,
        beruf: [String: Double],
        threshold: Double = 0.4
    ) -> [SharedDimension] {
        let userVec = user.asVector
        return dimensionKeys.enumerated().compactMap { index, key in
            let uScore = userVec[index]
            let bScore = beruf[key] ?? 0
            guard uScore >= threshold, bScore >= threshold else { return nil }
            return SharedDimension(
                key: key,
                label: dimensionLabels[key] ?? key,
                userScore: uScore,
                berufScore: bScore
            )
        }
        .sorted { ($0.userScore + $0.berufScore) > ($1.userScore + $1.berufScore) }
    }

    static func generateExplanations(sharedDimensions: [SharedDimension]) -> [String] {
        sharedDimensions.prefix(3).compactMap { dim in
            dimensionExplanations[dim.key]
        }
    }
}
