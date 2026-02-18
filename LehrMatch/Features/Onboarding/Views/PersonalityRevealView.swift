import SwiftUI

struct PersonalityRevealView: View {
    let hollandCodes: HollandCodes
    var buttonTitle: String = "Jetzt Lehrstellen entdecken"
    let onContinue: () -> Void

    @State private var revealStage = 0 // 0=radar, 1=card1, 2=card2, 3=card3, 4=done
    private let labels = ["R", "I", "A", "S", "E", "C"]
    private let fullLabels = ["Realistisch", "Forschend", "Künstlerisch", "Sozial", "Unternehmerisch", "Konventionell"]

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                // Radar chart with animated reveal
                RadarChartView(
                    values: hollandCodes.asVector,
                    labels: labels,
                    blurAmount: revealStage >= 0 ? 0 : 10
                )
                .frame(height: 250)
                .padding(.horizontal, Theme.Spacing.lg)
                .onAppear {
                    withAnimation(Theme.Animation.standard.delay(0.3)) {
                        revealStage = 1
                    }
                }

                Text("Dein Typ: \(hollandCodes.topThreeCodes.joined())")
                    .font(Theme.Typography.largeTitle)
                    .opacity(revealStage >= 1 ? 1 : 0)

                // Top 3 cards
                VStack(spacing: Theme.Spacing.md) {
                    ForEach(Array(topDimensions.enumerated()), id: \.offset) { index, dim in
                        resultCard(rank: index + 1, dimension: dim.0, score: dim.1)
                            .opacity(revealStage > index ? 1 : 0)
                            .offset(y: revealStage > index ? 0 : 30)
                            .rotation3DEffect(
                                .degrees(revealStage > index ? 0 : 90),
                                axis: (x: 1, y: 0, z: 0)
                            )
                            .animation(Theme.Animation.matchCelebration.delay(Double(index) * 0.4 + 0.5), value: revealStage)
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .onAppear {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                        withAnimation { revealStage = 4 }
                    }
                }

                if revealStage >= 4 {
                    PrimaryButton(title: buttonTitle) {
                        onContinue()
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
            .padding(.vertical, Theme.Spacing.xl)
        }
    }

    private var topDimensions: [(String, Double)] {
        let all = [
            ("Realistisch", hollandCodes.realistic),
            ("Forschend", hollandCodes.investigative),
            ("Künstlerisch", hollandCodes.artistic),
            ("Sozial", hollandCodes.social),
            ("Unternehmerisch", hollandCodes.enterprising),
            ("Konventionell", hollandCodes.conventional),
        ]
        return Array(all.sorted { $0.1 > $1.1 }.prefix(3))
    }

    private func resultCard(rank: Int, dimension: String, score: Double) -> some View {
        let tierColor: Color = switch rank {
        case 1: Theme.Colors.accentFallback
        case 2: Color.gray.opacity(0.7)
        default: Color.brown.opacity(0.6)
        }
        let tierLabel = switch rank {
        case 1: "Gold"
        case 2: "Silber"
        default: "Bronze"
        }

        return HStack(spacing: Theme.Spacing.md) {
            ZStack {
                Circle()
                    .fill(tierColor.gradient)
                    .frame(width: 44, height: 44)
                Text("#\(rank)")
                    .font(Theme.Typography.headline)
                    .foregroundStyle(.white)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(dimension)
                    .font(Theme.Typography.headline)
                Text(tierLabel)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }

            Spacer()

            Text("\(Int(score * 100))%")
                .font(Theme.Typography.title)
                .foregroundStyle(tierColor)
        }
        .padding(Theme.Spacing.md)
        .background(Theme.Colors.backgroundSecondary)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
    }
}
