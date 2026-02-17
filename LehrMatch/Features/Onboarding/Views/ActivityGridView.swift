import SwiftUI

struct ActivityGridView: View {
    let tiles: [ActivityTile]
    let requiredPicks: Int
    let selectedCount: Int
    let onToggle: (String) -> Void
    let onAdvance: () -> Void

    private let columns = Array(repeating: GridItem(.flexible(), spacing: Theme.Spacing.sm), count: 4)

    var body: some View {
        VStack(spacing: Theme.Spacing.md) {
            // Selection counter
            HStack {
                Text("\(selectedCount) von \(requiredPicks) ausgewählt")
                    .font(Theme.Typography.callout)
                    .foregroundStyle(Theme.Colors.textSecondary)

                Spacer()

                // Progress ring
                ZStack {
                    Circle()
                        .stroke(Theme.Colors.backgroundSecondary, lineWidth: 3)
                    Circle()
                        .trim(from: 0, to: CGFloat(selectedCount) / CGFloat(requiredPicks))
                        .stroke(Theme.Colors.primaryFallback, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                }
                .frame(width: 28, height: 28)
                .animation(Theme.Animation.quick, value: selectedCount)
            }
            .padding(.horizontal, Theme.Spacing.lg)

            // 4x4 Grid
            ScrollView {
                LazyVGrid(columns: columns, spacing: Theme.Spacing.sm) {
                    ForEach(tiles) { tile in
                        ActivityTileView(tile: tile) {
                            onToggle(tile.id)
                        }
                        .aspectRatio(1, contentMode: .fit)
                    }
                }
                .padding(.horizontal, Theme.Spacing.md)
            }

            // Advance button
            if selectedCount >= requiredPicks {
                PrimaryButton(title: "Weiter") {
                    onAdvance()
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .animation(Theme.Animation.swipeSpring, value: selectedCount)
    }
}
