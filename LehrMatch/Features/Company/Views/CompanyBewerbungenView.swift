import SwiftUI

struct CompanyBewerbungenView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: Theme.Spacing.lg) {
                Spacer()

                Image(systemName: "tray.full.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(Theme.Colors.primaryFallback)

                Text("Eingegangene Bewerbungen")
                    .font(Theme.Typography.title)

                Text("Demnächst verfügbar")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)

                Text("Hier sehen Sie bald alle Bewerbungen, die Sie erhalten haben.")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
                    .multilineTextAlignment(.center)

                Spacer()
            }
            .padding(Theme.Spacing.xl)
            .navigationTitle("Bewerbungen")
        }
    }
}
