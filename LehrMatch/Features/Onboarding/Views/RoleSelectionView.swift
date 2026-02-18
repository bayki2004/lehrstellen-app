import SwiftUI

struct RoleSelectionView: View {
    let onSelect: (UserType) -> Void

    var body: some View {
        VStack(spacing: Theme.Spacing.xl) {
            Spacer()

            Text("Willkommen bei LehrMatch")
                .font(Theme.Typography.largeTitle)
                .multilineTextAlignment(.center)

            Text("Wer bist du?")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)

            VStack(spacing: Theme.Spacing.md) {
                roleCard(
                    icon: "person.fill",
                    title: "Ich suche eine Lehrstelle",
                    description: "Erstelle dein Profil und bewirb dich mit einem Swipe.",
                    color: Theme.Colors.primaryFallback,
                    type: .student
                )

                roleCard(
                    icon: "building.2.fill",
                    title: "Wir bieten Lehrstellen an",
                    description: "Erstelle Inserate und erhalte Bewerbungen.",
                    color: Theme.Colors.secondaryFallback,
                    type: .company
                )
            }
            .padding(.horizontal, Theme.Spacing.lg)

            Spacer()
        }
    }

    private func roleCard(icon: String, title: String, description: String, color: Color, type: UserType) -> some View {
        Button {
            onSelect(type)
        } label: {
            HStack(spacing: Theme.Spacing.md) {
                Image(systemName: icon)
                    .font(.system(size: 36))
                    .foregroundStyle(color)
                    .frame(width: 60)

                VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                    Text(title)
                        .font(Theme.Typography.headline)
                        .foregroundStyle(Theme.Colors.textPrimary)

                    Text(description)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .multilineTextAlignment(.leading)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
            .padding(Theme.Spacing.lg)
            .background(Theme.Colors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.large))
            .cardShadow()
        }
    }
}
