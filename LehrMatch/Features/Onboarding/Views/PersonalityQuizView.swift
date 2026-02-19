import SwiftUI

struct PersonalityQuizView: View {
    @Bindable var viewModel: PersonalityQuizViewModel
    var revealButtonTitle: String = "Jetzt Lehrstellen entdecken"
    var onPassendeBerufe: (() -> Void)?
    let onComplete: () -> Void

    @State private var showPhaseTransition: QuizBadge?
    @State private var previousPhase: QuizPhase = .morning

    var body: some View {
        VStack(spacing: 0) {
            // Gamification header (XP, level, phase dots)
            QuizProgressHeader(
                gamification: viewModel.gamification,
                currentPhase: viewModel.currentPhase,
                overallProgress: viewModel.overallProgress
            )

            // Phase content
            Group {
                if viewModel.isComplete {
                    PersonalityRevealView(
                        hollandCodes: viewModel.personalityProfile!.hollandCodes,
                        buttonTitle: revealButtonTitle,
                        onPassendeBerufe: onPassendeBerufe,
                        onContinue: {
                            Task {
                                try? await viewModel.saveProfile()
                                onComplete()
                            }
                        }
                    )
                } else {
                    switch viewModel.currentPhase {
                    case .morning, .afternoon:
                        gridPhaseView
                    case .scenarios:
                        scenarioPhaseView
                    }
                }
            }
            .transition(.asymmetric(
                insertion: .move(edge: .trailing).combined(with: .opacity),
                removal: .move(edge: .leading).combined(with: .opacity)
            ))
            .animation(Theme.Animation.swipeSpring, value: viewModel.currentPhase)
        }
        .background(Theme.Colors.backgroundPrimary)
        .overlay {
            if let badge = showPhaseTransition {
                PhaseTransitionView(badge: badge) {
                    showPhaseTransition = nil
                }
            }
        }
        .onChange(of: viewModel.currentPhase) { oldPhase, newPhase in
            // Show celebration when advancing
            if newPhase.rawValue > oldPhase.rawValue {
                let badge: QuizBadge? = switch oldPhase {
                case .morning: .morningComplete
                case .afternoon: .afternoonComplete
                case .scenarios: nil
                }
                if let badge {
                    showPhaseTransition = badge
                }
            }
        }
    }

    // MARK: - Grid Phase

    private var gridPhaseView: some View {
        VStack(spacing: Theme.Spacing.md) {
            // Phase title
            VStack(spacing: Theme.Spacing.xs) {
                Text(viewModel.currentPhase.title)
                    .font(Theme.Typography.title)
                Text(viewModel.currentPhase.subtitle)
                    .font(Theme.Typography.callout)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
            .padding(.top, Theme.Spacing.md)

            ActivityGridView(
                tiles: viewModel.currentTiles,
                requiredPicks: viewModel.currentPhase.requiredPicks,
                selectedCount: viewModel.selectedCount,
                onToggle: { viewModel.toggleTile($0) },
                onAdvance: { viewModel.advancePhase() }
            )

            // Progressive radar preview
            if viewModel.currentPhase == .afternoon {
                RadarChartView(
                    values: partialRIASECValues,
                    labels: ["R", "I", "A", "S", "E", "C"],
                    blurAmount: 8
                )
                .frame(height: 120)
                .padding(.horizontal, Theme.Spacing.xxl)
                .overlay {
                    Text("Dein Profil nimmt Form an...")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
        }
    }

    // MARK: - Scenario Phase

    private var scenarioPhaseView: some View {
        VStack(spacing: 0) {
            Text("Frage \(viewModel.currentScenarioIndex + 1) von 10")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
                .padding(.top, Theme.Spacing.sm)

            if let question = viewModel.currentScenarioQuestion {
                questionView(question)
                    .id(question.id)
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing).combined(with: .opacity),
                        removal: .move(edge: .leading).combined(with: .opacity)
                    ))
            }
        }
        .animation(Theme.Animation.swipeSpring, value: viewModel.currentScenarioIndex)
    }

    private func questionView(_ question: PersonalityQuestion) -> some View {
        VStack(spacing: Theme.Spacing.lg) {
            Spacer()

            Text(question.text)
                .font(Theme.Typography.title)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.lg)

            VStack(spacing: Theme.Spacing.md) {
                ForEach(question.options.indices, id: \.self) { index in
                    Button {
                        withAnimation(Theme.Animation.swipeSpring) {
                            viewModel.answerScenario(optionIndex: index)
                        }
                    } label: {
                        HStack(spacing: Theme.Spacing.md) {
                            if let icon = question.options[index].imageSystemName {
                                Image(systemName: icon)
                                    .font(.title2)
                                    .foregroundStyle(Theme.Colors.primaryFallback)
                                    .frame(width: 40)
                            }
                            Text(question.options[index].text)
                                .font(Theme.Typography.body)
                                .foregroundStyle(Theme.Colors.textPrimary)
                                .multilineTextAlignment(.leading)
                            Spacer()
                        }
                        .padding(Theme.Spacing.md)
                        .background(Theme.Colors.backgroundSecondary)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
                    }
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)

            Spacer()
        }
    }

    /// Approximate RIASEC values from morning picks only (for blurred preview)
    private var partialRIASECValues: [Double] {
        let picks = viewModel.morningTiles.filter(\.isSelected)
        var scores: [Double] = [0, 0, 0, 0, 0, 0]
        let dims: [QuizDimension] = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        for pick in picks {
            for (i, dim) in dims.enumerated() {
                scores[i] += pick.scores[dim] ?? 0
            }
        }
        let maxScore = max(scores.max() ?? 1, 0.001)
        return scores.map { $0 / maxScore }
    }
}
