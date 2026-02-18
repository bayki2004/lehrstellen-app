import SwiftUI

struct CompanyListingsView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: Theme.Spacing.lg) {
                Spacer()

                Image(systemName: "briefcase.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(Theme.Colors.primaryFallback)

                Text("Meine Lehrstellen")
                    .font(Theme.Typography.title)

                Text("Demnächst verfügbar")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)

                Text("Hier können Sie bald Ihre Lehrstellen-Inserate verwalten.")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
                    .multilineTextAlignment(.center)

                Spacer()
            }
            .padding(Theme.Spacing.xl)
            .navigationTitle("Lehrstellen")
        }
    }
}
