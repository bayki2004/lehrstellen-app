import SwiftUI

struct MatchesListView: View {
    @Environment(AppState.self) private var appState
    @Environment(NavigationRouter.self) private var router
    @State private var viewModel: MatchesViewModel?

    var body: some View {
        Group {
            if let viewModel {
                if viewModel.matches.isEmpty && !viewModel.isLoading {
                    emptyStateView
                } else {
                    matchesList(viewModel: viewModel)
                }
            } else {
                ProgressView()
            }
        }
        .navigationTitle("Matches")
        .task {
            if viewModel == nil {
                let vm = MatchesViewModel(
                    apiClient: appState.apiClient,
                    studentId: appState.authManager.currentUserId ?? UUID()
                )
                viewModel = vm
                await vm.loadMatches()
            }
        }
        .refreshable {
            await viewModel?.loadMatches()
        }
    }

    private func matchesList(viewModel: MatchesViewModel) -> some View {
        List {
            // New Matches section (horizontal scroll)
            if !viewModel.newMatches.isEmpty {
                Section("Neue Matches") {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Theme.Spacing.md) {
                            ForEach(viewModel.newMatches) { match in
                                newMatchBubble(match)
                                    .onTapGesture {
                                        router.navigate(to: .chat(matchId: match.id))
                                    }
                            }
                        }
                        .padding(.horizontal, Theme.Spacing.xs)
                    }
                    .listRowInsets(EdgeInsets())
                    .listRowBackground(Color.clear)
                }
            }

            // Conversations section
            if !viewModel.conversations.isEmpty {
                Section("Nachrichten") {
                    ForEach(viewModel.conversations) { match in
                        conversationRow(match)
                            .onTapGesture {
                                router.navigate(to: .chat(matchId: match.id))
                            }
                    }
                    .onDelete { indexSet in
                        for index in indexSet {
                            let match = viewModel.conversations[index]
                            Task { await viewModel.archiveMatch(match) }
                        }
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
    }

    private func newMatchBubble(_ match: Match) -> some View {
        VStack(spacing: Theme.Spacing.xs) {
            ZStack(alignment: .bottomTrailing) {
                AvatarView(imageURL: match.companyLogoURL, name: match.companyName, size: 64)

                CompatibilityBadge(score: match.compatibilityScore, size: .small)
                    .offset(x: 4, y: 4)
            }

            Text(match.companyName)
                .font(Theme.Typography.caption)
                .lineLimit(1)
                .frame(width: 72)
        }
        .padding(.vertical, Theme.Spacing.sm)
    }

    private func conversationRow(_ match: Match) -> some View {
        HStack(spacing: Theme.Spacing.md) {
            AvatarView(imageURL: match.companyLogoURL, name: match.companyName, size: 52)

            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text(match.companyName)
                        .font(Theme.Typography.headline)
                        .lineLimit(1)
                    Spacer()
                    if let time = match.lastMessageAt {
                        Text(time, style: .relative)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.textTertiary)
                    }
                }

                Text(match.berufTitle)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.primaryFallback)

                if let preview = match.lastMessagePreview {
                    Text(preview)
                        .font(Theme.Typography.callout)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .lineLimit(1)
                }
            }

            if match.unreadCount > 0 {
                Text("\(match.unreadCount)")
                    .font(Theme.Typography.badge)
                    .foregroundStyle(.white)
                    .frame(width: 22, height: 22)
                    .background(Theme.Colors.primaryFallback)
                    .clipShape(Circle())
            }
        }
        .contentShape(Rectangle())
    }

    private var emptyStateView: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Image(systemName: "heart.slash")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.textTertiary)

            Text("Noch keine Matches")
                .font(Theme.Typography.title)

            Text("Swipe durch Lehrstellen und warte auf ein Match mit einer Firma.")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)

            PrimaryButton(title: "Lehrstellen entdecken") {
                router.selectedTab = .discover
            }
            .frame(width: 220)
        }
        .padding(Theme.Spacing.xl)
    }
}
