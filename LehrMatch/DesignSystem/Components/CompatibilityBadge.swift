import SwiftUI

struct CompatibilityBadge: View {
    let score: Double
    var size: BadgeSize = .medium

    enum BadgeSize {
        case small, medium, large

        var fontSize: Font {
            switch self {
            case .small: Theme.Typography.badge
            case .medium: Theme.Typography.caption
            case .large: Theme.Typography.callout
            }
        }

        var padding: EdgeInsets {
            switch self {
            case .small: EdgeInsets(top: 4, leading: 8, bottom: 4, trailing: 8)
            case .medium: EdgeInsets(top: 6, leading: 12, bottom: 6, trailing: 12)
            case .large: EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16)
            }
        }
    }

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "sparkles")
                .font(size.fontSize)
            Text("\(Int(score * 100))% Match")
                .font(size.fontSize)
        }
        .foregroundStyle(.white)
        .padding(size.padding)
        .background(badgeColor.gradient)
        .clipShape(Capsule())
    }

    private var badgeColor: Color {
        switch score {
        case 0.75...: Theme.Colors.compatibilityHigh
        case 0.50..<0.75: Theme.Colors.compatibilityMedium
        default: Theme.Colors.compatibilityLow
        }
    }
}

#Preview {
    VStack(spacing: Theme.Spacing.md) {
        CompatibilityBadge(score: 0.87, size: .large)
        CompatibilityBadge(score: 0.62, size: .medium)
        CompatibilityBadge(score: 0.34, size: .small)
    }
}
