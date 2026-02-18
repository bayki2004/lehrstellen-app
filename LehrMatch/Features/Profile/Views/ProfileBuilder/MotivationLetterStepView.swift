import SwiftUI

struct MotivationLetterStepView: View {
    @Bindable var viewModel: ProfileBuilderViewModel
    private let maxLength = 2000

    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            VStack(spacing: Theme.Spacing.sm) {
                Image(systemName: "doc.text.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(Theme.Colors.primaryFallback)

                Text("Dein Motivationsschreiben")
                    .font(Theme.Typography.title)

                Text("Erzähl den Unternehmen, warum du dich für eine Lehrstelle bewirbst und was dich motiviert.")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
            }

            VStack(alignment: .trailing, spacing: Theme.Spacing.xs) {
                TextEditor(text: $viewModel.motivationLetter)
                    .frame(minHeight: 200)
                    .padding(Theme.Spacing.sm)
                    .background(Theme.Colors.backgroundSecondary)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
                    .onChange(of: viewModel.motivationLetter) { _, newValue in
                        if newValue.count > maxLength {
                            viewModel.motivationLetter = String(newValue.prefix(maxLength))
                        }
                    }

                Text("\(viewModel.motivationLetter.count)/\(maxLength)")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(viewModel.motivationLetter.count > maxLength - 100 ? .orange : Theme.Colors.textTertiary)
            }

            // Writing prompts
            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                Text("Ideen zum Schreiben:")
                    .font(Theme.Typography.headline)

                promptRow("Warum interessiert dich dieser Beruf?")
                promptRow("Was sind deine Stärken?")
                promptRow("Was hast du bei Schnupperlehren gelernt?")
                promptRow("Was ist dein Ziel für die Zukunft?")
            }
            .padding(Theme.Spacing.md)
            .background(Theme.Colors.backgroundSecondary)
            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
        }
    }

    private func promptRow(_ text: String) -> some View {
        HStack(spacing: Theme.Spacing.sm) {
            Image(systemName: "lightbulb.fill")
                .font(.caption)
                .foregroundStyle(Theme.Colors.accentFallback)
            Text(text)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
    }
}
