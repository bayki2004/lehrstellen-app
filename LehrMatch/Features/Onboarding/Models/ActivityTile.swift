import Foundation

struct ActivityTile: Identifiable {
    let id: String
    let label: String
    let iconName: String
    let scores: [QuizDimension: Double]
    var isSelected: Bool = false
}

enum QuizPhase: Int, CaseIterable {
    case morning = 1
    case afternoon = 2
    case scenarios = 3

    var title: String {
        switch self {
        case .morning: "Dein Morgen"
        case .afternoon: "Dein Nachmittag"
        case .scenarios: "Was zählt für dich?"
        }
    }

    var subtitle: String {
        switch self {
        case .morning: "Am Morgen würdest du am liebsten..."
        case .afternoon: "Am Nachmittag wärst du am liebsten..."
        case .scenarios: "Ein paar Fragen zu deinen Werten"
        }
    }

    var requiredPicks: Int {
        switch self {
        case .morning: 8
        case .afternoon: 8
        case .scenarios: 10
        }
    }

    var phaseWeight: Double {
        switch self {
        case .morning: 0.3
        case .afternoon: 0.3
        case .scenarios: 0.4
        }
    }
}
