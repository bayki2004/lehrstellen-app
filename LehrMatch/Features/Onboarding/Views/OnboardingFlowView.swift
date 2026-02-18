import SwiftUI

struct OnboardingFlowView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel: OnboardingViewModel
    @State private var quizViewModel: PersonalityQuizViewModel?

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
                    WelcomeView(onContinue: { viewModel.advanceTo(.roleSelection) })
                case .roleSelection:
                    RoleSelectionView(onSelect: { type in
                        viewModel.selectRole(type)
                    })
                case .ageVerification:
                    AgeVerificationView(viewModel: viewModel)
                case .parentalConsent:
                    ParentalConsentView(viewModel: viewModel)
                case .registration:
                    AuthView()
                case .basicProfile:
                    BasicProfileView(viewModel: viewModel)
                case .personalityQuiz:
                    if let quizVM = quizViewModel {
                        PersonalityQuizView(
                            viewModel: quizVM,
                            onComplete: { viewModel.advanceTo(.personalityResults) }
                        )
                    } else {
                        ProgressView()
                            .onAppear {
                                quizViewModel = PersonalityQuizViewModel(
                                    apiClient: appState.apiClient,
                                    studentId: appState.authManager.currentUserId ?? UUID()
                                )
                            }
                    }
                case .personalityResults:
                    PersonalityResultsView()
                case .interestSelection:
                    InterestSelectionView(onComplete: { viewModel.completeOnboarding() })
                case .profileBuilder:
                    ProfileBuilderView(onComplete: { viewModel.finishProfileBuilder() })
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
