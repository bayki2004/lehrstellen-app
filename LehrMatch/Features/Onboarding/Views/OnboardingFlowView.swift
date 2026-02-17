import SwiftUI

struct OnboardingFlowView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel: OnboardingViewModel

    init() {
        // Initialized properly in body via appState; placeholder for compilation
        _viewModel = State(initialValue: OnboardingViewModel(
            authManager: AuthManager(apiClient: APIClient()),
            apiClient: APIClient()
        ))
    }

    var body: some View {
        NavigationStack {
            Group {
                switch viewModel.currentStep {
                case .welcome:
                    WelcomeView(onContinue: { viewModel.advanceTo(.ageVerification) })
                case .ageVerification:
                    AgeVerificationView(viewModel: viewModel)
                case .parentalConsent:
                    ParentalConsentView(viewModel: viewModel)
                case .registration:
                    AuthView()
                case .basicProfile:
                    BasicProfileView(viewModel: viewModel)
                case .personalityQuiz:
                    PersonalityQuizView(
                        viewModel: PersonalityQuizViewModel(
                            apiClient: appState.apiClient,
                            studentId: appState.authManager.currentUserId ?? UUID()
                        ),
                        onComplete: { viewModel.advanceTo(.personalityResults) }
                    )
                case .personalityResults:
                    PersonalityResultsView()
                case .interestSelection:
                    InterestSelectionView(onComplete: { viewModel.completeOnboarding() })
                case .ready:
                    ReadyToSwipeView(onStart: {
                        appState.hasCompletedOnboarding = true
                        appState.isAuthenticated = true
                    })
                }
            }
            .animation(Theme.Animation.standard, value: viewModel.currentStep)
        }
        .onAppear {
            viewModel = OnboardingViewModel(
                authManager: appState.authManager,
                apiClient: appState.apiClient
            )
        }
    }
}
