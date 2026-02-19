import SwiftUI

struct BerufsschuleRowView: View {
    let school: Berufsschule

    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            Image(systemName: "graduationcap.fill")
                .font(.caption)
                .foregroundStyle(.white)
                .frame(width: 32, height: 32)
                .background(.orange)
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text(school.name)
                    .font(Theme.Typography.callout)
                    .lineLimit(1)
                Text(school.city)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }

            Spacer()

            Text(school.canton)
                .font(Theme.Typography.badge)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(.orange.opacity(0.15))
                .foregroundStyle(.orange)
                .clipShape(Capsule())
        }
        .padding(.vertical, Theme.Spacing.xs)
        .padding(.horizontal, Theme.Spacing.md)
        .background(Theme.Colors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.small))
    }
}
