import Foundation

@MainActor
@Observable
final class DiscoveryFeedViewModel {
    var cards: [LehrstelleCard] = []
    var isLoading = false
    var errorMessage: String?
    var dailySwipesRemaining: Int = 20
    var hasReachedDailyLimit: Bool { dailySwipesRemaining <= 0 }
    var activeFilters: FeedFilters?
    var lastSentBewerbung: Bewerbung?

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
                body: FeedRequest(studentId: studentId, batchSize: 20, filters: activeFilters)
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

    func handleSwipe(card: LehrstelleCard, direction: SwipeDirection) async {
        swipedCardIds.insert(card.id)
        cards.removeAll { $0.id == card.id }

        if direction == .right || direction == .superLike {
            dailySwipesRemaining -= 1
            await createBewerbung(for: card)
        } else {
            await skipListing(card: card)
        }

        // Pre-fetch more cards if running low
        if cards.count < 5 {
            await loadNextBatch()
        }

        // Also record swipe for feed algorithm
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

    private func createBewerbung(for card: LehrstelleCard) async {
        let request = CreateBewerbungRequest(studentId: studentId, listingId: card.id)
        do {
            let bewerbung: Bewerbung = try await apiClient.request(
                endpoint: .bewerbungen,
                method: .post,
                body: request
            )
            lastSentBewerbung = bewerbung
        } catch {
            // Create a local representation for the confirmation overlay
            lastSentBewerbung = Bewerbung(
                id: UUID(),
                studentId: studentId,
                listingId: card.id,
                status: .sent,
                sentAt: .now,
                companyName: card.companyName,
                berufTitle: card.title,
                canton: card.canton
            )
        }
    }

    private func skipListing(card: LehrstelleCard) async {
        let request = SkipListingRequest(studentId: studentId, listingId: card.id)
        do {
            try await apiClient.requestVoid(
                endpoint: .skippedListings,
                method: .post,
                body: request
            )
        } catch {
            // Skip recorded locally even if server fails
        }
    }

    func applyFilters(_ filters: FeedFilters) async {
        activeFilters = filters
        cards = []
        swipedCardIds = []
        await loadNextBatch()
    }

    func loadSampleData() {
        cards = LehrstelleCard.samples
    }
}

struct FeedRequest: Encodable {
    let studentId: UUID
    let batchSize: Int
    let filters: FeedFilters?
}

struct FeedFilters: Encodable, Equatable {
    var cantons: [String]?
    var berufsfelder: [String]?
    var educationType: String?
    var minCompatibility: Double?
}
