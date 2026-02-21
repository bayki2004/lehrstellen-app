import SwiftUI

struct CompanyListingRowView: View {
    let listing: CompanyListing

    var body: some View {
        HStack(spacing: Theme.Spacing.sm) {
            // Field indicator
            Circle()
                .fill(Theme.Colors.primaryFallback.opacity(0.15))
                .frame(width: 40, height: 40)
                .overlay {
                    Text(String(listing.field.prefix(1)))
                        .font(Theme.Typography.headline)
                        .foregroundStyle(Theme.Colors.primaryFallback)
                }

            // Info
            VStack(alignment: .leading, spacing: 2) {
                Text(listing.title)
                    .font(Theme.Typography.headline)
                    .lineLimit(1)

                Text("\(listing.field) · \(listing.canton) \(listing.city)")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .lineLimit(1)
            }

            Spacer()

            // Status & spots
            VStack(alignment: .trailing, spacing: 4) {
                if listing.isActive == true {
                    Text("Aktiv")
                        .font(Theme.Typography.badge)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Theme.Colors.swipeRight)
                        .clipShape(Capsule())
                } else {
                    Text("Inaktiv")
                        .font(Theme.Typography.badge)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Theme.Colors.textTertiary)
                        .clipShape(Capsule())
                }

                Text("\(listing.spotsAvailable) Plätze")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
        }
        .padding(.vertical, Theme.Spacing.xs)
    }
}
