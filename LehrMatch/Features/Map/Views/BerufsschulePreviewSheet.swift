import SwiftUI

struct BerufsschulePreviewSheet: View {
    let school: Berufsschule
    let onShowDetail: () -> Void
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
                    Image(systemName: "graduationcap.fill")
                        .font(.title2)
                        .foregroundStyle(.white)
                        .frame(width: 48, height: 48)
                        .background(.orange)
                        .clipShape(Circle())

                    VStack(alignment: .leading, spacing: 2) {
                        Text(school.name)
                            .font(Theme.Typography.headline)
                            .lineLimit(2)
                        Text("\(school.city), \(school.canton)")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.textSecondary)
                    }

                    Spacer()

                    Text(school.canton)
                        .font(Theme.Typography.badge)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(.orange.opacity(0.15))
                        .foregroundStyle(.orange)
                        .clipShape(Capsule())
                }

                // Address
                if let address = school.address {
                    HStack(spacing: Theme.Spacing.sm) {
                        Image(systemName: "mappin")
                            .font(.caption)
                            .foregroundStyle(Theme.Colors.textTertiary)
                        Text(address)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.textSecondary)
                    }
                }

                // Contact info
                HStack(spacing: Theme.Spacing.md) {
                    if let email = school.email {
                        Link(destination: URL(string: "mailto:\(email)")!) {
                            Label("E-Mail", systemImage: "envelope")
                                .font(Theme.Typography.caption)
                        }
                    }
                    if let phone = school.phone {
                        Link(destination: URL(string: "tel:\(phone)")!) {
                            Label("Telefon", systemImage: "phone")
                                .font(Theme.Typography.caption)
                        }
                    }
                    if let website = school.website, let url = URL(string: website) {
                        Link(destination: url) {
                            Label("Website", systemImage: "globe")
                                .font(Theme.Typography.caption)
                        }
                    }
                }

                // Detail button
                Button(action: onShowDetail) {
                    Text("Detail azeige")
                        .font(Theme.Typography.callout)
                        .fontWeight(.semibold)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Theme.Spacing.sm)
                        .background(.orange)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.small))
                }
                .buttonStyle(.plain)
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
}
