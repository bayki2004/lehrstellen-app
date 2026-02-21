import SwiftUI

struct CompanyDashboardView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel: CompanyDashboardViewModel?

    var body: some View {
        NavigationStack {
            Group {
                if let vm = viewModel {
                    dashboardContent(vm)
                } else {
                    ProgressView()
                }
            }
            .navigationTitle("Dashboard")
        }
        .task {
            if viewModel == nil {
                viewModel = CompanyDashboardViewModel(apiClient: appState.expressClient)
            }
            await viewModel?.loadDashboard()
        }
    }

    private func dashboardContent(_ vm: CompanyDashboardViewModel) -> some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                // KPI Grid
                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: Theme.Spacing.md),
                    GridItem(.flexible(), spacing: Theme.Spacing.md)
                ], spacing: Theme.Spacing.md) {
                    KPICard(icon: "briefcase.fill", value: vm.totalListings, label: "Lehrstellen", color: Theme.Colors.primaryFallback)
                    KPICard(icon: "checkmark.circle.fill", value: vm.activeListings, label: "Aktive", color: Theme.Colors.swipeRight)
                    KPICard(icon: "doc.text.fill", value: vm.totalApplications, label: "Bewerbungen", color: Theme.Colors.secondaryFallback)
                    KPICard(icon: "clock.fill", value: vm.pendingApplications, label: "Ausstehend", color: .orange)
                }
                .padding(.horizontal, Theme.Spacing.md)

                // Tips Section
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Text("Tipps")
                        .font(Theme.Typography.headline)
                        .padding(.horizontal, Theme.Spacing.md)

                    TipRow(icon: "photo.fill", text: "Laden Sie Fotos hoch, um Ihr Profil attraktiver zu machen.")
                    TipRow(icon: "text.bubble.fill", text: "Antworten Sie zeitnah auf Bewerbungen für bessere Ergebnisse.")
                    TipRow(icon: "star.fill", text: "Beschreiben Sie die ideale Persönlichkeit für Ihre Lehrstelle.")
                }
                .padding(.top, Theme.Spacing.md)
            }
            .padding(.vertical, Theme.Spacing.md)
        }
        .refreshable {
            await vm.loadDashboard()
        }
        .overlay {
            if vm.isLoading && vm.totalListings == 0 {
                ProgressView()
            }
        }
    }
}

// MARK: - KPI Card

private struct KPICard: View {
    let icon: String
    let value: Int
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: Theme.Spacing.sm) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)

            Text("\(value)")
                .font(Theme.Typography.largeTitle)
                .foregroundStyle(Theme.Colors.textPrimary)

            Text(label)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(Theme.Spacing.md)
        .background(Theme.Colors.backgroundSecondary)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
        .cardShadow()
    }
}

// MARK: - Tip Row

private struct TipRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: Theme.Spacing.sm) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(Theme.Colors.primaryFallback)
                .frame(width: 24)

            Text(text)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
        .padding(.horizontal, Theme.Spacing.md)
    }
}
