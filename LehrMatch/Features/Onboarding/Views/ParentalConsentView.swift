import SwiftUI

struct ParentalConsentView: View {
    @Bindable var viewModel: OnboardingViewModel

    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Spacer()

            Image(systemName: "figure.and.child.holdinghands")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.primaryFallback.gradient)

            Text("Einverständnis der Eltern")
                .font(Theme.Typography.largeTitle)
                .multilineTextAlignment(.center)

            Text("Da du unter 18 bist, brauchen wir das Einverständnis deiner Eltern. Gib die E-Mail-Adresse eines Elternteils ein — wir senden eine kurze Bestätigung.")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.md)

            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                Text("E-Mail der Eltern")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)

                TextField("eltern@beispiel.ch", text: $viewModel.parentEmail)
                    .textFieldStyle(.roundedBorder)
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)
            }
            .padding(.horizontal, Theme.Spacing.lg)

            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                Label("Deine Daten werden sicher gespeichert", systemImage: "lock.shield")
                Label("Nur in der Schweiz gehostet", systemImage: "flag")
                Label("Eltern können jederzeit widerrufen", systemImage: "arrow.uturn.backward")
            }
            .font(Theme.Typography.caption)
            .foregroundStyle(Theme.Colors.textSecondary)
            .padding(.horizontal, Theme.Spacing.lg)

            Spacer()

            VStack(spacing: Theme.Spacing.md) {
                PrimaryButton(
                    title: "Einverständnis anfragen",
                    action: { viewModel.proceedFromParentalConsent() },
                    isDisabled: viewModel.parentEmail.isEmpty
                )

                Text("Du kannst LehrMatch schon erkunden, während du auf die Bestätigung wartest.")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
                    .multilineTextAlignment(.center)
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.bottom, Theme.Spacing.xl)
        }
        .background(Theme.Colors.backgroundPrimary)
    }
}
