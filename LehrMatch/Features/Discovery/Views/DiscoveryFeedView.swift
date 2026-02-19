import SwiftUI

struct DiscoveryFeedView: View {
    @Environment(AppState.self) private var appState
    @Environment(NavigationRouter.self) private var router
    @State private var viewModel: DiscoveryFeedViewModel?
    @State private var swipeEngine = SwipeEngine()
    @State private var showBewerbungConfirmation = false

    var body: some View {
        ZStack {
            Theme.Colors.backgroundPrimary
                .ignoresSafeArea()

            if let viewModel {
                if viewModel.hasReachedDailyLimit {
                    dailyLimitView
                } else if viewModel.cards.isEmpty && !viewModel.isLoading {
                    emptyStateView
                } else {
                    cardStackView(viewModel: viewModel)
                }
            } else {
                ProgressView()
            }

            // Bewerbung sent confirmation overlay
            if showBewerbungConfirmation, let bewerbung = viewModel?.lastSentBewerbung {
                BewerbungSentConfirmationView(
                    companyName: bewerbung.companyName ?? "Unbekannt",
                    berufTitle: bewerbung.berufTitle ?? "Lehrstelle"
                ) {
                    showBewerbungConfirmation = false
                    viewModel?.lastSentBewerbung = nil
                }
                .transition(.opacity.combined(with: .scale))
            }
        }
        .navigationTitle("Entdecken")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button {
                    router.selectedTab = .map
                } label: {
                    Label("Karte", systemImage: "map")
                        .font(Theme.Typography.caption)
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    router.navigate(to: .filter)
                } label: {
                    Image(systemName: "slider.horizontal.3")
                }
            }
        }
        .task {
            if viewModel == nil {
                let vm = DiscoveryFeedViewModel(
                    apiClient: appState.apiClient,
                    studentId: appState.authManager.currentUserId ?? UUID()
                )
                viewModel = vm
                await vm.loadInitialFeed()
            }
        }
        .onChange(of: router.pendingFilters) { _, newFilters in
            guard let filters = newFilters, let vm = viewModel else { return }
            router.pendingFilters = nil
            Task { await vm.applyFilters(filters) }
        }
    }

    // MARK: - Card Stack

    private func cardStackView(viewModel: DiscoveryFeedViewModel) -> some View {
        VStack {
            ZStack {
                ForEach(Array(viewModel.visibleCards.enumerated().reversed()), id: \.element.id) { index, card in
                    SwipeCardView(
                        card: card,
                        isTopCard: index == 0,
                        swipeEngine: swipeEngine,
                        onSwipe: { direction in
                            handleSwipe(card: card, direction: direction)
                        },
                        onTap: {
                            router.navigate(to: .cardDetail(id: card.id))
                        }
                    )
                    .zIndex(Double(viewModel.visibleCards.count - index))
                }
            }
            .padding(.horizontal, Theme.Spacing.md)

            // Action buttons
            actionButtons
                .padding(.top, Theme.Spacing.md)
                .padding(.bottom, Theme.Spacing.lg)

            // Remaining swipes indicator
            Text("\(viewModel.dailySwipesRemaining) Swipes übrig heute")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
        }
    }

    // MARK: - Action Buttons

    private var actionButtons: some View {
        HStack(spacing: Theme.Spacing.xl) {
            // Pass button
            actionButton(
                icon: "xmark",
                color: Theme.Colors.swipeLeft,
                size: 54
            ) {
                if let card = viewModel?.topCard {
                    swipeEngine.animateSwipe(direction: .left)
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        handleSwipe(card: card, direction: .left)
                        swipeEngine.resetPosition()
                    }
                }
            }

            // Super Like button
            actionButton(
                icon: "star.fill",
                color: Theme.Colors.superLike,
                size: 44
            ) {
                if let card = viewModel?.topCard {
                    swipeEngine.animateSwipe(direction: .superLike)
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        handleSwipe(card: card, direction: .superLike)
                        swipeEngine.resetPosition()
                    }
                }
            }

            // Like button
            actionButton(
                icon: "heart.fill",
                color: Theme.Colors.swipeRight,
                size: 54
            ) {
                if let card = viewModel?.topCard {
                    swipeEngine.animateSwipe(direction: .right)
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        handleSwipe(card: card, direction: .right)
                        swipeEngine.resetPosition()
                    }
                }
            }
        }
    }

    private func actionButton(icon: String, color: Color, size: CGFloat, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: size * 0.4))
                .foregroundStyle(color)
                .frame(width: size, height: size)
                .background(
                    Circle()
                        .fill(Theme.Colors.cardBackground)
                        .cardShadow()
                )
        }
    }

    // MARK: - Swipe Handler

    private func handleSwipe(card: LehrstelleCard, direction: SwipeDirection) {
        guard let viewModel else { return }
        Task {
            await viewModel.handleSwipe(card: card, direction: direction)

            // Show confirmation for right swipes (Bewerbung sent)
            if (direction == .right || direction == .superLike) && viewModel.lastSentBewerbung != nil {
                withAnimation(Theme.Animation.matchCelebration) {
                    showBewerbungConfirmation = true
                }
            }
        }
    }

    // MARK: - Empty States

    private var emptyStateView: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Image(systemName: "tray")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.textTertiary)

            Text("Keine neuen Lehrstellen")
                .font(Theme.Typography.title)

            Text("Schau morgen wieder vorbei oder passe deine Filter an.")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)

            PrimaryButton(title: "Filter anpassen", action: {
                router.navigate(to: .filter)
            }, style: .outlined)
            .frame(width: 200)
        }
        .padding(Theme.Spacing.xl)
    }

    private var dailyLimitView: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Image(systemName: "clock.badge.checkmark")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.primaryFallback)

            Text("Tageslimit erreicht")
                .font(Theme.Typography.title)

            Text("Qualität vor Quantität! Morgen kannst du wieder swipen. Schau dir jetzt deine Bewerbungen an.")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)

            PrimaryButton(title: "Zu meinen Bewerbungen") {
                router.selectedTab = .bewerbungen
            }
            .frame(width: 220)
        }
        .padding(Theme.Spacing.xl)
    }
}
