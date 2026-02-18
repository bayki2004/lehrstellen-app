import SwiftUI

struct CardContainer<Content: View>: View {
    @ViewBuilder let content: () -> Content

    var body: some View {
        content()
            .background(Theme.Colors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.card))
            .cardShadow()
    }
}

#Preview {
    CardContainer {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text("Müller AG")
                .font(Theme.Typography.cardTitle)
            Text("Informatiker/in EFZ")
                .font(Theme.Typography.cardSubtitle)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
        .padding(Theme.Spacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    .padding()
}
