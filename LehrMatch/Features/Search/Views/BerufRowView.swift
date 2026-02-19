import SwiftUI

struct BerufRowView: View {
    let beruf: Beruf

    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            Image(systemName: fieldIcon)
                .font(.caption)
                .foregroundStyle(.white)
                .frame(width: 32, height: 32)
                .background(fieldColor)
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text(beruf.nameDe)
                    .font(Theme.Typography.callout)
                    .lineLimit(1)

                if let field = beruf.field {
                    Text(field.capitalized)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
            }

            Spacer()

            if let eduType = beruf.educationType {
                Text(eduType)
                    .font(Theme.Typography.badge)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Theme.Colors.backgroundSecondary)
                    .clipShape(Capsule())
            }
        }
        .padding(.vertical, Theme.Spacing.xs)
        .padding(.horizontal, Theme.Spacing.md)
        .background(Theme.Colors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.small))
    }

    private var fieldColor: Color {
        guard let field = beruf.field else { return Theme.Colors.primaryFallback }
        switch field {
        case "technik": return .blue
        case "informatik": return .indigo
        case "gesundheit": return .pink
        case "kaufmaennisch": return .gray
        case "handwerk": return .orange
        case "gastronomie": return .brown
        case "detailhandel": return .teal
        case "design": return .purple
        case "soziales": return .mint
        case "bau": return .yellow
        case "logistik": return .cyan
        case "natur": return .green
        default: return Theme.Colors.primaryFallback
        }
    }

    private var fieldIcon: String {
        guard let field = beruf.field else { return "briefcase" }
        switch field {
        case "technik": return "gearshape.2"
        case "informatik": return "desktopcomputer"
        case "gesundheit": return "heart"
        case "kaufmaennisch": return "briefcase"
        case "handwerk": return "wrench"
        case "gastronomie": return "fork.knife"
        case "detailhandel": return "bag"
        case "design": return "paintbrush"
        case "soziales": return "person.2"
        case "bau": return "building.2"
        case "logistik": return "shippingbox"
        case "natur": return "leaf"
        default: return "briefcase"
        }
    }
}
