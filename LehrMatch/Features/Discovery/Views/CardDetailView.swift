import SwiftUI

struct CardDetailView: View {
    let lehrstelleId: UUID
    @State private var card: LehrstelleCard?
    @Environment(AppState.self) private var appState

    var body: some View {
        ScrollView {
            if let card {
                VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                    // Header image area
                    headerSection(card)

                    VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                        // Company info
                        companySection(card)

                        Divider()

                        // Position details
                        positionSection(card)

                        Divider()

                        // Requirements
                        if !card.requirements.isEmpty {
                            requirementsSection(card)
                            Divider()
                        }

                        // Culture
                        if card.cultureDescription != nil || !card.cultureTags.isEmpty {
                            cultureSection(card)
                        }
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                    .padding(.bottom, Theme.Spacing.xxl)
                }
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, minHeight: 300)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            // In production, fetch from API. For now, find in samples
            card = LehrstelleCard.samples.first { $0.id == lehrstelleId }
                ?? LehrstelleCard.samples.first
        }
    }

    // MARK: - Sections

    private func headerSection(_ card: LehrstelleCard) -> some View {
        ZStack(alignment: .bottomLeading) {
            Rectangle()
                .fill(Theme.Colors.primaryFallback.gradient)
                .frame(height: 250)
                .overlay {
                    Text(String(card.companyName.prefix(1)))
                        .font(.system(size: 100, weight: .bold, design: .rounded))
                        .foregroundStyle(.white.opacity(0.15))
                }

            HStack {
                CompatibilityBadge(score: card.compatibilityScore, size: .large)
                Spacer()
            }
            .padding(Theme.Spacing.lg)
        }
    }

    private func companySection(_ card: LehrstelleCard) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            HStack {
                AvatarView(imageURL: card.companyLogoURL, name: card.companyName, size: 56)

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: Theme.Spacing.xs) {
                        Text(card.companyName)
                            .font(Theme.Typography.title)
                        if card.isVerified {
                            Image(systemName: "checkmark.seal.fill")
                                .foregroundStyle(.blue)
                        }
                    }

                    Text(card.locationDisplay)
                        .font(Theme.Typography.callout)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }

            if let size = card.companySize {
                Label(size.displayName, systemImage: "building.2")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
        }
    }

    private func positionSection(_ card: LehrstelleCard) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text(card.berufTitle)
                .font(Theme.Typography.headline)

            Text(card.description)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)

            HStack(spacing: Theme.Spacing.lg) {
                Label(card.educationType.displayName, systemImage: "graduationcap")
                if let startDate = card.startDate {
                    Label(startDate.formatted(.dateTime.month(.wide).year()), systemImage: "calendar")
                }
            }
            .font(Theme.Typography.caption)
            .foregroundStyle(Theme.Colors.textSecondary)
        }
    }

    private func requirementsSection(_ card: LehrstelleCard) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text("Anforderungen")
                .font(Theme.Typography.headline)

            ForEach(card.requirements, id: \.self) { req in
                Label(req, systemImage: "checkmark.circle")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
        }
    }

    private func cultureSection(_ card: LehrstelleCard) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text("Unternehmenskultur")
                .font(Theme.Typography.headline)

            if let culture = card.cultureDescription {
                Text(culture)
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }

            if !card.cultureTags.isEmpty {
                FlowLayout(spacing: Theme.Spacing.sm) {
                    ForEach(card.cultureTags, id: \.self) { tag in
                        Text(tag)
                            .font(Theme.Typography.badge)
                            .padding(.horizontal, Theme.Spacing.md)
                            .padding(.vertical, Theme.Spacing.sm)
                            .background(Theme.Colors.primaryFallback.opacity(0.1))
                            .foregroundStyle(Theme.Colors.primaryFallback)
                            .clipShape(Capsule())
                    }
                }
            }
        }
    }
}
