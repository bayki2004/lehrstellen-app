import SwiftUI

enum Theme {
    enum Colors {
        static let primary = Color("Primary", bundle: .main)
        static let secondary = Color("Secondary", bundle: .main)
        static let accent = Color("Accent", bundle: .main)

        static let swipeRight = Color.green
        static let swipeLeft = Color.red.opacity(0.7)
        static let superLike = Color.blue

        static let compatibilityHigh = Color.green
        static let compatibilityMedium = Color.orange
        static let compatibilityLow = Color.red

        static let cardBackground = Color(.systemBackground)
        static let cardShadow = Color.black.opacity(0.1)

        static let textPrimary = Color(.label)
        static let textSecondary = Color(.secondaryLabel)
        static let textTertiary = Color(.tertiaryLabel)

        static let backgroundPrimary = Color(.systemBackground)
        static let backgroundSecondary = Color(.secondarySystemBackground)
        static let backgroundGrouped = Color(.systemGroupedBackground)

        // Fallback values for when color assets aren't set up yet
        static let primaryFallback = Color(red: 0.35, green: 0.47, blue: 0.95) // Swiss blue
        static let secondaryFallback = Color(red: 0.95, green: 0.26, blue: 0.21) // Swiss red
        static let accentFallback = Color(red: 0.98, green: 0.73, blue: 0.01) // Gold
    }

    enum Typography {
        static let largeTitle = Font.system(.largeTitle, design: .rounded, weight: .bold)
        static let title = Font.system(.title2, design: .rounded, weight: .semibold)
        static let headline = Font.system(.headline, design: .rounded, weight: .semibold)
        static let body = Font.system(.body, design: .default)
        static let callout = Font.system(.callout, design: .default)
        static let caption = Font.system(.caption, design: .default)
        static let cardTitle = Font.system(.title3, design: .rounded, weight: .bold)
        static let cardSubtitle = Font.system(.subheadline, design: .default, weight: .medium)
        static let badge = Font.system(.caption2, design: .rounded, weight: .bold)
    }

    enum Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
    }

    enum CornerRadius {
        static let small: CGFloat = 8
        static let medium: CGFloat = 12
        static let large: CGFloat = 16
        static let xl: CGFloat = 24
        static let card: CGFloat = 20
    }

    enum Shadow {
        static let card = ShadowStyle(color: Colors.cardShadow, radius: 10, x: 0, y: 4)
        static let elevated = ShadowStyle(color: .black.opacity(0.15), radius: 20, x: 0, y: 8)
    }

    enum Animation {
        static let swipeSpring = SwiftUI.Animation.spring(response: 0.4, dampingFraction: 0.7)
        static let cardReturn = SwiftUI.Animation.spring(response: 0.5, dampingFraction: 0.8)
        static let matchCelebration = SwiftUI.Animation.spring(response: 0.6, dampingFraction: 0.5)
        static let quick = SwiftUI.Animation.easeOut(duration: 0.2)
        static let standard = SwiftUI.Animation.easeInOut(duration: 0.3)
    }
}

struct ShadowStyle {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat
}

extension View {
    func cardShadow() -> some View {
        shadow(
            color: Theme.Shadow.card.color,
            radius: Theme.Shadow.card.radius,
            x: Theme.Shadow.card.x,
            y: Theme.Shadow.card.y
        )
    }

    func elevatedShadow() -> some View {
        shadow(
            color: Theme.Shadow.elevated.color,
            radius: Theme.Shadow.elevated.radius,
            x: Theme.Shadow.elevated.x,
            y: Theme.Shadow.elevated.y
        )
    }
}
