import SwiftUI

struct AgeVerificationView: View {
    @Bindable var viewModel: OnboardingViewModel

    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Spacer()

            Image(systemName: "birthday.cake")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.primaryFallback.gradient)

            Text("Wie alt bist du?")
                .font(Theme.Typography.largeTitle)

            Text("Wir brauchen dein Geburtsdatum, um sicherzustellen, dass LehrMatch für dich geeignet ist.")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.lg)

            DatePicker(
                "Geburtsdatum",
                selection: $viewModel.dateOfBirth,
                in: ...Date.now,
                displayedComponents: .date
            )
            .datePickerStyle(.wheel)
            .labelsHidden()
            .padding(.horizontal, Theme.Spacing.lg)

            if let error = viewModel.errorMessage {
                Text(error)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }

            Spacer()

            PrimaryButton(title: "Weiter") {
                viewModel.proceedFromAgeVerification()
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.bottom, Theme.Spacing.xl)
        }
        .background(Theme.Colors.backgroundPrimary)
    }
}
