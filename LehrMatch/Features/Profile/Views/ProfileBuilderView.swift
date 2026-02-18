import SwiftUI

struct ProfileBuilderView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel: ProfileBuilderViewModel?
    var onComplete: (() -> Void)?

    var body: some View {
        Group {
            if let viewModel {
                VStack(spacing: 0) {
                    // Progress header
                    progressHeader(viewModel: viewModel)

                    // Step content
                    ScrollView {
                        stepContent(viewModel: viewModel)
                            .padding(Theme.Spacing.md)
                    }

                    // Navigation buttons
                    navigationButtons(viewModel: viewModel)
                }
            } else {
                ProgressView()
            }
        }
        .navigationTitle("Profil erstellen")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if viewModel == nil {
                let vm = ProfileBuilderViewModel(
                    apiClient: appState.apiClient,
                    storageClient: appState.storageClient,
                    studentId: appState.authManager.currentUserId ?? UUID()
                )
                vm.loadExistingProfile(from: appState.currentStudent)
                viewModel = vm
            }
        }
        .alert("Fehler", isPresented: Binding(
            get: { viewModel?.errorMessage != nil },
            set: { if !$0 { viewModel?.errorMessage = nil } }
        )) {
            Button("OK") { viewModel?.errorMessage = nil }
        } message: {
            Text(viewModel?.errorMessage ?? "")
        }
    }

    private func progressHeader(viewModel: ProfileBuilderViewModel) -> some View {
        VStack(spacing: Theme.Spacing.sm) {
            // Step indicator
            HStack(spacing: Theme.Spacing.xs) {
                ForEach(ProfileBuilderStep.allCases, id: \.rawValue) { step in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(step.rawValue <= viewModel.currentStepIndex
                              ? Theme.Colors.primaryFallback
                              : Theme.Colors.textTertiary.opacity(0.3))
                        .frame(height: 4)
                }
            }
            .padding(.horizontal, Theme.Spacing.md)

            // Step title
            HStack {
                Image(systemName: viewModel.currentStep.icon)
                    .foregroundStyle(Theme.Colors.primaryFallback)
                Text("Schritt \(viewModel.currentStepIndex + 1)/\(viewModel.totalSteps): \(viewModel.currentStep.title)")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }

            // Completeness
            Text("Profil \(viewModel.profileCompleteness)% vollständig")
                .font(Theme.Typography.badge)
                .foregroundStyle(Theme.Colors.primaryFallback)
        }
        .padding(.vertical, Theme.Spacing.sm)
        .background(Theme.Colors.backgroundSecondary)
    }

    @ViewBuilder
    private func stepContent(viewModel: ProfileBuilderViewModel) -> some View {
        switch viewModel.currentStep {
        case .personalInfo:
            PersonalInfoStepView(viewModel: viewModel)
        case .motivationVideo:
            MotivationVideoStepView(viewModel: viewModel)
        case .motivationLetter:
            MotivationLetterStepView(viewModel: viewModel)
        case .education:
            EducationStepView(viewModel: viewModel)
        case .experience:
            ExperienceStepView(viewModel: viewModel)
        case .skillsAndMore:
            SkillsLanguagesStepView(viewModel: viewModel)
        case .documents:
            DocumentsStepView(viewModel: viewModel)
        }
    }

    private func navigationButtons(viewModel: ProfileBuilderViewModel) -> some View {
        HStack(spacing: Theme.Spacing.md) {
            if !viewModel.isFirstStep {
                Button {
                    withAnimation(Theme.Animation.standard) {
                        viewModel.previousStep()
                    }
                } label: {
                    HStack {
                        Image(systemName: "chevron.left")
                        Text("Zurück")
                    }
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.primaryFallback)
                }
            }

            Spacer()

            if viewModel.isLastStep {
                PrimaryButton(
                    title: "Profil speichern",
                    action: {
                        Task {
                            await viewModel.saveProfile()
                            onComplete?()
                        }
                    },
                    isLoading: viewModel.isLoading
                )
                .frame(width: 200)
            } else {
                PrimaryButton(title: "Weiter") {
                    withAnimation(Theme.Animation.standard) {
                        viewModel.nextStep()
                    }
                }
                .frame(width: 150)
            }
        }
        .padding(Theme.Spacing.md)
        .background(Theme.Colors.backgroundPrimary)
    }
}
