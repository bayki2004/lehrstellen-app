import SwiftUI

struct BerufMatchCardView: View {
    let match: BerufMatch
    let lehrstellenCount: Int

    private var matchColor: Color {
        if match.matchPercentage >= 75 { return .green }
        if match.matchPercentage >= 50 { return .orange }
        return .red
    }

    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            // Match percentage circle
            ZStack {
                Circle()
                    .stroke(matchColor.opacity(0.2), lineWidth: 4)
                    .frame(width: 56, height: 56)
                Circle()
                    .trim(from: 0, to: Double(match.matchPercentage) / 100)
                    .stroke(matchColor, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                    .frame(width: 56, height: 56)
                    .rotationEffect(.degrees(-90))
                Text("\(match.matchPercentage)%")
                    .font(Theme.Typography.headline)
                    .foregroundStyle(matchColor)
            }

            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(match.beruf.nameDe)
                    .font(Theme.Typography.headline)
                    .lineLimit(1)

                HStack(spacing: Theme.Spacing.sm) {
                    if let field = match.beruf.field {
                        Text(field)
                            .font(Theme.Typography.badge)
                            .foregroundStyle(Theme.Colors.primaryFallback)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Theme.Colors.primaryFallback.opacity(0.1))
                            .clipShape(Capsule())
                    }
                    if let years = match.beruf.durationYears {
                        Text("\(years) Jahr\(years == 1 ? "" : "e")")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.textSecondary)
                    }
                }

                // Mini RIASEC bars for shared dimensions
                if !match.sharedDimensions.isEmpty {
                    HStack(spacing: 4) {
                        ForEach(match.sharedDimensions.prefix(3)) { dim in
                            miniBar(label: String(dim.label.prefix(1)), value: dim.userScore)
                        }
                    }
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: Theme.Spacing.xs) {
                Image(systemName: "chevron.right")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
                if lehrstellenCount > 0 {
                    Text("\(lehrstellenCount) Stelle\(lehrstellenCount == 1 ? "" : "n")")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
        }
        .padding(Theme.Spacing.md)
        .background(Theme.Colors.backgroundSecondary)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
    }

    private func miniBar(label: String, value: Double) -> some View {
        VStack(spacing: 2) {
            Text(label)
                .font(.system(size: 9, weight: .bold))
                .foregroundStyle(Theme.Colors.textSecondary)
            GeometryReader { geo in
                ZStack(alignment: .bottom) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Theme.Colors.primaryFallback.opacity(0.15))
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Theme.Colors.primaryFallback)
                        .frame(height: geo.size.height * value)
                }
            }
            .frame(width: 12, height: 24)
        }
    }
}
