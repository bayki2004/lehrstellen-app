import SwiftUI

struct BewerbungenListView: View {
    @Environment(AppState.self) private var appState
    @Environment(NavigationRouter.self) private var router
    @State private var viewModel: BewerbungenListViewModel?

    var body: some View {
        Group {
            if let viewModel {
                if viewModel.bewerbungen.isEmpty && !viewModel.isLoading {
                    emptyState
                } else {
                    bewerbungenList(viewModel: viewModel)
                }
            } else {
                ProgressView()
            }
        }
        .navigationTitle("Bewerbungen")
        .task {
            if viewModel == nil {
                let vm = BewerbungenListViewModel(
                    apiClient: appState.apiClient,
                    studentId: appState.authManager.currentUserId ?? UUID()
                )
                viewModel = vm
                await vm.loadBewerbungen()
            }
        }
    }

    private func bewerbungenList(viewModel: BewerbungenListViewModel) -> some View {
        VStack(spacing: 0) {
            // Filter tabs
            Picker("Filter", selection: Bindable(viewModel).selectedFilter) {
                ForEach(BewerbungFilter.allCases, id: \.self) { filter in
                    Text(filter.displayName).tag(filter)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.sm)

            ScrollView {
                LazyVStack(spacing: Theme.Spacing.sm) {
                    ForEach(viewModel.filteredBewerbungen) { bewerbung in
                        Button {
                            router.navigate(to: .bewerbungDetail(id: bewerbung.id))
                        } label: {
                            bewerbungCard(bewerbung)
                        }
                    }
                }
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.vertical, Theme.Spacing.sm)
            }
            .refreshable {
                await viewModel.loadBewerbungen()
            }
        }
    }

    private func bewerbungCard(_ bewerbung: Bewerbung) -> some View {
        HStack(spacing: Theme.Spacing.md) {
            // Company avatar
            AvatarView(
                imageURL: bewerbung.companyLogoUrl.flatMap { URL(string: $0) },
                name: bewerbung.companyName ?? "?",
                size: 50
            )

            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(bewerbung.companyName ?? "Unternehmen")
                    .font(Theme.Typography.headline)
                    .foregroundStyle(Theme.Colors.textPrimary)

                Text(bewerbung.berufTitle ?? "Lehrstelle")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)

                HStack(spacing: Theme.Spacing.xs) {
                    if let canton = bewerbung.canton {
                        Text(canton)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.textTertiary)
                    }
                    Text(bewerbung.sentAt.formatted(.dateTime.day().month()))
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
            }

            Spacer()

            // Status badge
            VStack(spacing: Theme.Spacing.xs) {
                Image(systemName: bewerbung.status.icon)
                    .font(.title3)
                    .foregroundStyle(bewerbung.status.color)

                Text(bewerbung.status.displayName)
                    .font(Theme.Typography.badge)
                    .foregroundStyle(bewerbung.status.color)
            }
        }
        .padding(Theme.Spacing.md)
        .background(Theme.Colors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
        .cardShadow()
    }

    private var emptyState: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Image(systemName: "doc.text")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.textTertiary)

            Text("Noch keine Bewerbungen")
                .font(Theme.Typography.title)

            Text("Swipe nach rechts, um deine erste Bewerbung zu senden!")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(Theme.Spacing.xl)
    }
}
