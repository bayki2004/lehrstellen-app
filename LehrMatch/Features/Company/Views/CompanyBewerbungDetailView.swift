import SwiftUI

struct CompanyBewerbungDetailView: View {
    @Environment(AppState.self) private var appState
    let applicationId: String
    @State private var application: CompanyApplication?
    @State private var isLoading = true

    var body: some View {
        ScrollView {
            if let app = application {
                VStack(spacing: Theme.Spacing.lg) {
                    // Student header
                    studentHeader(app)

                    // Compatibility
                    if let score = app.compatibilityScore {
                        compatibilitySection(score)
                    }

                    // Timeline
                    timelineSection(app.timeline)

                    // Actions
                    actionButtons(app)
                }
                .padding(Theme.Spacing.md)
            } else if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .navigationTitle("Bewerbung")
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadApplication() }
    }

    // MARK: - Student Header

    private func studentHeader(_ app: CompanyApplication) -> some View {
        VStack(spacing: Theme.Spacing.sm) {
            Circle()
                .fill(Theme.Colors.primaryFallback.opacity(0.15))
                .frame(width: 72, height: 72)
                .overlay {
                    if let student = app.student {
                        Text("\(student.firstName.prefix(1))\(student.lastName.prefix(1))")
                            .font(Theme.Typography.title)
                            .foregroundStyle(Theme.Colors.primaryFallback)
                    }
                }

            if let student = app.student {
                Text(student.fullName)
                    .font(Theme.Typography.title)
                Text("\(student.canton) \(student.city)")
                    .font(Theme.Typography.callout)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }

            if let listing = app.listing {
                Text(listing.title)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }

            // Status badge
            HStack(spacing: 4) {
                Image(systemName: app.status.icon)
                Text(app.status.displayName)
            }
            .font(Theme.Typography.badge)
            .foregroundStyle(.white)
            .padding(.horizontal, Theme.Spacing.sm)
            .padding(.vertical, Theme.Spacing.xs)
            .background(app.status.color)
            .clipShape(Capsule())
        }
        .frame(maxWidth: .infinity)
        .padding(Theme.Spacing.lg)
        .background(Theme.Colors.backgroundSecondary)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.large))
    }

    // MARK: - Compatibility

    private func compatibilitySection(_ score: Double) -> some View {
        HStack {
            Text("Kompatibilität")
                .font(Theme.Typography.headline)
            Spacer()
            Text("\(Int(score))%")
                .font(Theme.Typography.largeTitle)
                .foregroundStyle(scoreColor(score))
        }
        .padding(Theme.Spacing.md)
        .background(Theme.Colors.backgroundSecondary)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
    }

    // MARK: - Timeline

    private func timelineSection(_ entries: [ApplicationTimelineEntry]) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text("Verlauf")
                .font(Theme.Typography.headline)

            ForEach(entries.indices, id: \.self) { index in
                let entry = entries[index]
                HStack(alignment: .top, spacing: Theme.Spacing.sm) {
                    Circle()
                        .fill(Theme.Colors.primaryFallback)
                        .frame(width: 8, height: 8)
                        .padding(.top, 6)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(entry.status)
                            .font(Theme.Typography.callout)
                        Text(entry.timestamp)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.textTertiary)
                        if let note = entry.note {
                            Text(note)
                                .font(Theme.Typography.caption)
                                .foregroundStyle(Theme.Colors.textSecondary)
                        }
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.Spacing.md)
        .background(Theme.Colors.backgroundSecondary)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
    }

    // MARK: - Actions

    private func actionButtons(_ app: CompanyApplication) -> some View {
        VStack(spacing: Theme.Spacing.sm) {
            if app.status == .pending || app.status == .viewed {
                Button {
                    Task { await updateStatus(.shortlisted) }
                } label: {
                    Label("Vorauswahl", systemImage: "star.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(.purple)
            }

            if app.status == .shortlisted {
                Button {
                    Task { await updateStatus(.interviewScheduled) }
                } label: {
                    Label("Interview planen", systemImage: "calendar.badge.plus")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(Theme.Colors.primaryFallback)
            }

            if app.status.isActive {
                HStack(spacing: Theme.Spacing.sm) {
                    Button {
                        Task { await updateStatus(.accepted) }
                    } label: {
                        Label("Annehmen", systemImage: "checkmark")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Theme.Colors.swipeRight)

                    Button {
                        Task { await updateStatus(.rejected) }
                    } label: {
                        Label("Ablehnen", systemImage: "xmark")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Theme.Colors.swipeLeft)
                }
            }
        }
    }

    // MARK: - Helpers

    private func loadApplication() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let apps: [CompanyApplication] = try await appState.expressClient.request(
                path: ExpressEndpoint.applications.path
            )
            application = apps.first { $0.id == applicationId }
        } catch {
            // Use sample data as fallback
            application = CompanyApplication.samples.first
        }
    }

    private func updateStatus(_ status: ApplicationStatus) async {
        let vm = CompanyBewerbungenViewModel(apiClient: appState.expressClient)
        await vm.updateStatus(applicationId: applicationId, newStatus: status)
        await loadApplication()
    }

    private func scoreColor(_ score: Double) -> Color {
        if score >= 70 { return Theme.Colors.compatibilityHigh }
        if score >= 40 { return Theme.Colors.compatibilityMedium }
        return Theme.Colors.compatibilityLow
    }
}
