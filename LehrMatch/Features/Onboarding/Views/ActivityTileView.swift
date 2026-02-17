import SwiftUI

struct ActivityTileView: View {
    let tile: ActivityTile
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: Theme.Spacing.sm) {
                Image(systemName: tile.iconName)
                    .font(.title2)
                    .foregroundStyle(tile.isSelected ? .white : Theme.Colors.primaryFallback)

                Text(tile.label)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(tile.isSelected ? .white : Theme.Colors.textPrimary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(Theme.Spacing.sm)
            .background(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.medium)
                    .fill(tile.isSelected
                          ? Theme.Colors.primaryFallback
                          : Theme.Colors.backgroundSecondary)
            )
            .scaleEffect(tile.isSelected ? 1.05 : 1.0)
            .animation(Theme.Animation.quick, value: tile.isSelected)
        }
        .sensoryFeedback(.selection, trigger: tile.isSelected)
    }
}
