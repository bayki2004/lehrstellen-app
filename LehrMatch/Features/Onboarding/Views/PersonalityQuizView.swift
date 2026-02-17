import SwiftUI

struct PersonalityQuizView: View {
    @Bindable var viewModel: PersonalityQuizViewModel
    let onComplete: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            // Progress bar
            ProgressView(value: viewModel.progress)
                .tint(Theme.Colors.primaryFallback)
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.md)

            Text("Frage \(viewModel.currentQuestionIndex + 1) von \(viewModel.questions.count)")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
                .padding(.top, Theme.Spacing.sm)

            if viewModel.isComplete {
                quizCompleteView
            } else if let question = viewModel.currentQuestion {
                questionView(question)
                    .id(question.id)
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing).combined(with: .opacity),
                        removal: .move(edge: .leading).combined(with: .opacity)
                    ))
            }
        }
        .background(Theme.Colors.backgroundPrimary)
        .animation(Theme.Animation.swipeSpring, value: viewModel.currentQuestionIndex)
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
                    quizOptionButton(option: question.options[index], index: index)
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)

            Spacer()
        }
    }

    private func quizOptionButton(option: QuizOption, index: Int) -> some View {
        Button {
            withAnimation(Theme.Animation.swipeSpring) {
                viewModel.answerQuestion(optionIndex: index)
            }
        } label: {
            HStack(spacing: Theme.Spacing.md) {
                if let icon = option.imageSystemName {
                    Image(systemName: icon)
                        .font(.title2)
                        .foregroundStyle(Theme.Colors.primaryFallback)
                        .frame(width: 40)
                }

                Text(option.text)
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

    private var quizCompleteView: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Spacer()

            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 80))
                .foregroundStyle(Theme.Colors.compatibilityHigh.gradient)

            Text("Quiz abgeschlossen!")
                .font(Theme.Typography.largeTitle)

            Text("Wir haben dein Persönlichkeitsprofil erstellt und können dir jetzt passende Lehrstellen zeigen.")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.lg)

            Spacer()

            PrimaryButton(title: "Ergebnisse ansehen") {
                Task {
                    try? await viewModel.saveProfile()
                    onComplete()
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.bottom, Theme.Spacing.xl)
        }
    }
}
