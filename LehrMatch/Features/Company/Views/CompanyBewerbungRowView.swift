import SwiftUI

struct CompanyBewerbungRowView: View {
    let application: CompanyApplication

    var body: some View {
        HStack(spacing: Theme.Spacing.sm) {
            // Student avatar
            Circle()
                .fill(Theme.Colors.primaryFallback.opacity(0.15))
                .frame(width: 44, height: 44)
                .overlay {
                    Text(initials)
                        .font(Theme.Typography.headline)
                        .foregroundStyle(Theme.Colors.primaryFallback)
                }

            // Info
            VStack(alignment: .leading, spacing: 2) {
                Text(application.student?.fullName ?? "Unbekannt")
                    .font(Theme.Typography.headline)
                    .lineLimit(1)

                if let listing = application.listing {
                    Text(listing.title)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .lineLimit(1)
                }

                if let student = application.student {
                    Text("\(student.canton) \(student.city)")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
            }

            Spacer()

            // Score & status
            VStack(alignment: .trailing, spacing: 4) {
                if let score = application.compatibilityScore {
                    Text("\(Int(score))%")
                        .font(Theme.Typography.headline)
                        .foregroundStyle(scoreColor(score))
                }

                HStack(spacing: 4) {
                    Image(systemName: application.status.icon)
                        .font(.caption2)
                    Text(application.status.displayName)
                        .font(Theme.Typography.badge)
                }
                .foregroundStyle(application.status.color)
            }
        }
        .padding(.vertical, Theme.Spacing.xs)
    }

    private var initials: String {
        guard let student = application.student else { return "?" }
        let first = student.firstName.prefix(1)
        let last = student.lastName.prefix(1)
        return "\(first)\(last)"
    }

    private func scoreColor(_ score: Double) -> Color {
        if score >= 70 { return Theme.Colors.compatibilityHigh }
        if score >= 40 { return Theme.Colors.compatibilityMedium }
        return Theme.Colors.compatibilityLow
    }
}
