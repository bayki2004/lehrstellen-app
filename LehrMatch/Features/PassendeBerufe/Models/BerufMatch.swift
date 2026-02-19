import Foundation

struct BerufMatch: Identifiable {
    let beruf: Beruf
    let matchPercentage: Int
    let sharedDimensions: [SharedDimension]

    var id: String { beruf.code }
}

struct SharedDimension: Identifiable {
    let key: String
    let label: String
    let userScore: Double
    let berufScore: Double

    var id: String { key }
}
