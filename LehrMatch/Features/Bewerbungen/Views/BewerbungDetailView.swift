import SwiftUI

struct BewerbungDetailView: View {
    let bewerbungId: UUID
    @Environment(AppState.self) private var appState
    @State private var bewerbung: Bewerbung?

    var body: some View {
        ScrollView {
            if let bewerbung {
                VStack(spacing: Theme.Spacing.lg) {
                    // Header
                    companyHeader(bewerbung)

                    // Status timeline
                    statusTimeline(bewerbung)

                    // Actions
                    actionsSection(bewerbung)
                }
                .padding(Theme.Spacing.md)
            } else {
                ProgressView()
                    .padding(.top, Theme.Spacing.xxl)
            }
        }
        .navigationTitle("Bewerbung")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            // Load from parent view's data or fetch
            // For now use sample
            bewerbung = Bewerbung.samples.first
        }
    }

    private func companyHeader(_ bewerbung: Bewerbung) -> some View {
        VStack(spacing: Theme.Spacing.md) {
            AvatarView(
                imageURL: bewerbung.companyLogoUrl.flatMap { URL(string: $0) },
                name: bewerbung.companyName ?? "?",
                size: 80
            )

            Text(bewerbung.companyName ?? "Unternehmen")
                .font(Theme.Typography.title)

            Text(bewerbung.berufTitle ?? "Lehrstelle")
                .font(Theme.Typography.callout)
                .foregroundStyle(Theme.Colors.textSecondary)

            if let canton = bewerbung.canton, let city = bewerbung.city {
                Label("\(city), \(canton)", systemImage: "mappin")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(Theme.Spacing.lg)
        .background(Theme.Colors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.large))
        .cardShadow()
    }

    private func statusTimeline(_ bewerbung: Bewerbung) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Status")
                .font(Theme.Typography.headline)
                .padding(.bottom, Theme.Spacing.md)

            timelineStep(
                title: "Gesendet",
                date: bewerbung.sentAt,
                isCompleted: true,
                isLast: bewerbung.status == .sent
            )

            timelineStep(
                title: "Angesehen",
                date: bewerbung.viewedAt,
                isCompleted: bewerbung.viewedAt != nil,
                isLast: bewerbung.status == .viewed
            )

            if bewerbung.status == .interviewInvited || bewerbung.status == .schnupperlehreScheduled || bewerbung.status == .offer || bewerbung.status == .accepted {
                timelineStep(
                    title: bewerbung.status.displayName,
                    date: bewerbung.respondedAt,
                    isCompleted: true,
                    isLast: true
                )
            }

            if bewerbung.status == .rejected {
                timelineStep(
                    title: "Abgesagt",
                    date: bewerbung.respondedAt,
                    isCompleted: true,
                    isLast: true,
                    color: Theme.Colors.swipeLeft
                )
            }
        }
        .padding(Theme.Spacing.lg)
        .background(Theme.Colors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.large))
        .cardShadow()
    }

    private func timelineStep(title: String, date: Date?, isCompleted: Bool, isLast: Bool, color: Color = Theme.Colors.swipeRight) -> some View {
        HStack(alignment: .top, spacing: Theme.Spacing.md) {
            VStack(spacing: 0) {
                Circle()
                    .fill(isCompleted ? color : Theme.Colors.textTertiary.opacity(0.3))
                    .frame(width: 12, height: 12)

                if !isLast {
                    Rectangle()
                        .fill(isCompleted ? color.opacity(0.3) : Theme.Colors.textTertiary.opacity(0.2))
                        .frame(width: 2, height: 40)
                }
            }

            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(title)
                    .font(Theme.Typography.body)
                    .foregroundStyle(isCompleted ? Theme.Colors.textPrimary : Theme.Colors.textTertiary)

                if let date {
                    Text(date.formatted(.dateTime.day().month().year().hour().minute()))
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
            }
        }
    }

    private func actionsSection(_ bewerbung: Bewerbung) -> some View {
        VStack(spacing: Theme.Spacing.sm) {
            if bewerbung.status == .sent || bewerbung.status == .viewed {
                PrimaryButton(title: "Bewerbung zurückziehen", action: {
                    // Withdraw action
                }, style: .outlined)
            }
        }
    }
}
