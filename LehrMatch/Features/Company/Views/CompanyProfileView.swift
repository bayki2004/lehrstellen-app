import SwiftUI

struct CompanyProfileView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        NavigationStack {
            VStack(spacing: Theme.Spacing.lg) {
                Spacer()

                Image(systemName: "building.2.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(Theme.Colors.primaryFallback)

                Text("Firmenprofil")
                    .font(Theme.Typography.title)

                Text("Demnächst verfügbar")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)

                Text("Hier können Sie bald Ihr Firmenprofil bearbeiten.")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
                    .multilineTextAlignment(.center)

                Spacer()

                PrimaryButton(title: "Abmelden", action: {
                    Task { await appState.authManager.signOut() }
                    appState.signOut()
                }, style: .outlined)
                .frame(width: 200)
                .padding(.bottom, Theme.Spacing.xl)
            }
            .padding(Theme.Spacing.xl)
            .navigationTitle("Profil")
        }
    }
}
