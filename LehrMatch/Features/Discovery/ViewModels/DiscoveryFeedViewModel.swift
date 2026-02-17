import Foundation

@MainActor
@Observable
final class DiscoveryFeedViewModel {
    var cards: [LehrstelleCard] = []
    var isLoading = false
    var errorMessage: String?
    var dailySwipesRemaining: Int = 20
    var hasReachedDailyLimit: Bool { dailySwipesRemaining <= 0 }

    private let apiClient: APIClient
    private let studentId: UUID
    private var swipedCardIds: Set<UUID> = []

    init(apiClient: APIClient, studentId: UUID) {
        self.apiClient = apiClient
        self.studentId = studentId
    }

    var visibleCards: [LehrstelleCard] {
        Array(cards.prefix(3))
    }

    var topCard: LehrstelleCard? {
        cards.first
    }

    func loadInitialFeed() async {
        guard cards.isEmpty else { return }
        await loadNextBatch()
    }

    func loadNextBatch() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let newCards: [LehrstelleCard] = try await apiClient.request(
                endpoint: .feedRecommendations,
                method: .post,
                body: FeedRequest(studentId: studentId, batchSize: 20)
            )
            cards.append(contentsOf: newCards.filter { !swipedCardIds.contains($0.id) })
        } catch {
            // Use sample data for development
            if cards.isEmpty {
                cards = LehrstelleCard.samples
            }
            errorMessage = error.localizedDescription
        }
    }

    func recordSwipe(card: LehrstelleCard, direction: SwipeDirection) async {
        swipedCardIds.insert(card.id)
        cards.removeAll { $0.id == card.id }

        if direction == .right || direction == .superLike {
            dailySwipesRemaining -= 1
        }

        // Pre-fetch more cards if running low
        if cards.count < 5 {
            await loadNextBatch()
        }

        // Record swipe on server
        let action = SwipeAction(
            studentId: studentId,
            lehrstelleId: card.id,
            direction: direction
        )

        do {
            try await apiClient.requestVoid(
                endpoint: .swipes,
                method: .post,
                body: action
            )
        } catch {
            // Swipe recorded locally even if server fails
        }
    }

    func loadSampleData() {
        cards = LehrstelleCard.samples
    }
}

struct FeedRequest: Encodable {
    let studentId: UUID
    let batchSize: Int
}
