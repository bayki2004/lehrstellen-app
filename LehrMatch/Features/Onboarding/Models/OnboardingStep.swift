import Foundation

enum OnboardingStep: Int, CaseIterable {
    case welcome
    case ageVerification
    case parentalConsent
    case registration
    case basicProfile
    case personalityQuiz
    case personalityResults
    case interestSelection
    case ready
}
