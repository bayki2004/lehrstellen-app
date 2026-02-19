import SwiftUI

struct ListingPreviewSheet: View {
    let listing: LehrstelleCard
    let isApplied: Bool
    let commuteResult: CommuteResult?
    let isLoadingCommute: Bool
    let berufsschule: Berufsschule?
    let onShowDetail: () -> Void
    let onApply: () -> Void
    let onDismiss: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            // Drag handle
            RoundedRectangle(cornerRadius: 2.5)
                .fill(Color(.systemGray3))
                .frame(width: 36, height: 5)
                .padding(.top, Theme.Spacing.sm)

            VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                // Header
                HStack(spacing: Theme.Spacing.md) {
                    AvatarView(imageURL: listing.companyLogoURL, name: listing.companyName, size: 48)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(listing.companyName)
                            .font(Theme.Typography.headline)
                            .lineLimit(1)
                        Text(listing.berufTitle)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.primaryFallback)
                    }

                    Spacer()

                    CompatibilityBadge(score: listing.compatibilityScore, size: .small)
                }

                // Info row
                HStack(spacing: Theme.Spacing.md) {
                    Label(listing.locationDisplay, systemImage: "mappin")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)

                    Label(listing.educationType.displayName, systemImage: "graduationcap")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }

                // Commute time
                commuteRow

                // Berufsschule info
                if let school = berufsschule {
                    HStack(spacing: Theme.Spacing.sm) {
                        Image(systemName: "graduationcap.fill")
                            .font(.caption)
                            .foregroundStyle(.orange)
                        Text(school.name)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.textSecondary)
                        if let days = listing.berufsschuleDays {
                            Text("(\(days))")
                                .font(Theme.Typography.caption)
                                .foregroundStyle(Theme.Colors.textTertiary)
                        }
                    }
                }

                // Action buttons
                HStack(spacing: Theme.Spacing.md) {
                    Button(action: onShowDetail) {
                        Text("Meh azeige")
                            .font(Theme.Typography.callout)
                            .fontWeight(.medium)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, Theme.Spacing.sm)
                            .background(Theme.Colors.backgroundSecondary)
                            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.small))
                    }
                    .buttonStyle(.plain)

                    if isApplied {
                        HStack(spacing: Theme.Spacing.xs) {
                            Image(systemName: "checkmark.circle.fill")
                            Text("Scho beworbe")
                        }
                        .font(Theme.Typography.callout)
                        .fontWeight(.medium)
                        .foregroundStyle(.green)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Theme.Spacing.sm)
                        .background(.green.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.small))
                    } else {
                        Button(action: onApply) {
                            Text("Bewerbe")
                                .font(Theme.Typography.callout)
                                .fontWeight(.semibold)
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, Theme.Spacing.sm)
                                .background(Theme.Colors.primaryFallback)
                                .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.small))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(Theme.Spacing.md)
        }
        .background(
            RoundedRectangle(cornerRadius: Theme.CornerRadius.large)
                .fill(Theme.Colors.cardBackground)
                .cardShadow()
        )
        .padding(.horizontal, Theme.Spacing.md)
        .padding(.bottom, Theme.Spacing.sm)
        .gesture(
            DragGesture()
                .onEnded { value in
                    if value.translation.height > 50 {
                        onDismiss()
                    }
                }
        )
    }

    @ViewBuilder
    private var commuteRow: some View {
        if isLoadingCommute {
            HStack(spacing: Theme.Spacing.sm) {
                ProgressView()
                    .scaleEffect(0.7)
                Text("Reiseziit wird berechnet...")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
        } else if let commute = commuteResult {
            HStack(spacing: Theme.Spacing.sm) {
                Image(systemName: "tram.fill")
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.primaryFallback)
                Text("\(commute.durationMinutes) min")
                    .font(Theme.Typography.callout)
                    .fontWeight(.medium)
                if commute.transfers > 0 {
                    Text("\(commute.transfers) Umsteiger")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
            }
        }
    }
}
