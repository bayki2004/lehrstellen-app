import SwiftUI

struct CompanyDashboardView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: Theme.Spacing.lg) {
                Spacer()

                Image(systemName: "chart.bar.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(Theme.Colors.primaryFallback)

                Text("Dashboard")
                    .font(Theme.Typography.title)

                Text("Demnächst verfügbar")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)

                Text("Hier sehen Sie bald eine Übersicht Ihrer Lehrstellen und Bewerbungen.")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
                    .multilineTextAlignment(.center)

                Spacer()
            }
            .padding(Theme.Spacing.xl)
            .navigationTitle("Dashboard")
        }
    }
}
