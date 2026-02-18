import Foundation

@MainActor
@Observable
final class OnboardingViewModel {
    var currentStep: OnboardingStep = .welcome
    var dateOfBirth: Date = Calendar.current.date(byAdding: .year, value: -15, to: .now) ?? .now
    var requiresParentalConsent = false
    var parentEmail = ""
    var email = ""
    var password = ""
    var firstName = ""
    var lastName = ""
    var canton: Canton = .zurich
    var schoolName = ""
    var schoolYear: SchoolYear = .eighth

    var isLoading = false
    var errorMessage: String?

    private let authManager: AuthManager
    private let apiClient: APIClient

    init(authManager: AuthManager, apiClient: APIClient) {
        self.authManager = authManager
        self.apiClient = apiClient
    }

    var age: Int {
        Calendar.current.dateComponents([.year], from: dateOfBirth, to: .now).year ?? 0
    }

    var isUnder14: Bool { age < 14 }
    var isMinor: Bool { age < 18 }

    func proceedFromAgeVerification() {
        if isUnder14 {
            errorMessage = "Du musst mindestens 14 Jahre alt sein, um LehrMatch zu nutzen."
            return
        }
        requiresParentalConsent = isMinor
        currentStep = isMinor ? .parentalConsent : .registration
    }

    func proceedFromParentalConsent() {
        // Consent request is async; user can continue with limited access
        currentStep = .registration
    }

    func register() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            _ = try await authManager.signUp(email: email, password: password)
            currentStep = .basicProfile
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func saveBasicProfile() async {
        isLoading = true
        defer { isLoading = false }

        // Save profile to Supabase
        currentStep = .personalityQuiz
    }

    func completeOnboarding() {
        currentStep = .ready
    }

    func advanceTo(_ step: OnboardingStep) {
        currentStep = step
    }
}

enum Canton: String, CaseIterable, Codable, Identifiable {
    case zurich = "ZH"
    case bern = "BE"
    case luzern = "LU"
    case uri = "UR"
    case schwyz = "SZ"
    case obwalden = "OW"
    case nidwalden = "NW"
    case glarus = "GL"
    case zug = "ZG"
    case freiburg = "FR"
    case solothurn = "SO"
    case baselStadt = "BS"
    case baselLandschaft = "BL"
    case schaffhausen = "SH"
    case appenzellAusserrhoden = "AR"
    case appenzellInnerrhoden = "AI"
    case stGallen = "SG"
    case graubuenden = "GR"
    case aargau = "AG"
    case thurgau = "TG"
    case ticino = "TI"
    case vaud = "VD"
    case valais = "VS"
    case neuchatel = "NE"
    case geneve = "GE"
    case jura = "JU"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .zurich: "Zürich"
        case .bern: "Bern"
        case .luzern: "Luzern"
        case .uri: "Uri"
        case .schwyz: "Schwyz"
        case .obwalden: "Obwalden"
        case .nidwalden: "Nidwalden"
        case .glarus: "Glarus"
        case .zug: "Zug"
        case .freiburg: "Freiburg"
        case .solothurn: "Solothurn"
        case .baselStadt: "Basel-Stadt"
        case .baselLandschaft: "Basel-Landschaft"
        case .schaffhausen: "Schaffhausen"
        case .appenzellAusserrhoden: "Appenzell Ausserrhoden"
        case .appenzellInnerrhoden: "Appenzell Innerrhoden"
        case .stGallen: "St. Gallen"
        case .graubuenden: "Graubünden"
        case .aargau: "Aargau"
        case .thurgau: "Thurgau"
        case .ticino: "Ticino"
        case .vaud: "Vaud"
        case .valais: "Valais"
        case .neuchatel: "Neuchâtel"
        case .geneve: "Genève"
        case .jura: "Jura"
        }
    }
}

enum SchoolYear: String, CaseIterable, Codable {
    case seventh = "7. Klasse"
    case eighth = "8. Klasse"
    case ninth = "9. Klasse"
    case tenth = "10. Schuljahr"
}
