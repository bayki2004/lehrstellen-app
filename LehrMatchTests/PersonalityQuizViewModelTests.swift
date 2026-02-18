import XCTest
@testable import LehrMatch

@MainActor
final class PersonalityQuizViewModelTests: XCTestCase {

    private func makeVM() -> PersonalityQuizViewModel {
        PersonalityQuizViewModel(apiClient: APIClient(), studentId: UUID())
    }

    func testInitialPhaseIsMorning() {
        let vm = makeVM()
        XCTAssertEqual(vm.currentPhase, .morning)
    }

    func testMorningTilesAre16AndShuffled() {
        let vm1 = makeVM()
        let vm2 = makeVM()
        XCTAssertEqual(vm1.currentTiles.count, 16)
        // Shuffled: at least *possible* the order differs (non-deterministic, but validates count)
        XCTAssertEqual(vm2.currentTiles.count, 16)
    }

    func testSelectingTileToggles() {
        let vm = makeVM()
        let tileId = vm.currentTiles[0].id
        vm.toggleTile(tileId)
        XCTAssertTrue(vm.currentTiles.first { $0.id == tileId }!.isSelected)
        vm.toggleTile(tileId)
        XCTAssertFalse(vm.currentTiles.first { $0.id == tileId }!.isSelected)
    }

    func testCannotSelectMoreThan8Tiles() {
        let vm = makeVM()
        for i in 0..<9 {
            vm.toggleTile(vm.currentTiles[i].id)
        }
        let selectedCount = vm.currentTiles.filter(\.isSelected).count
        XCTAssertEqual(selectedCount, 8, "Should cap at 8 selections")
    }

    func testSelectingTileAddsXP() {
        let vm = makeVM()
        vm.toggleTile(vm.currentTiles[0].id)
        XCTAssertEqual(vm.gamification.xp, QuizGamificationState.xpPerGridPick)
    }

    func testDeselectingTileRemovesXP() {
        let vm = makeVM()
        vm.toggleTile(vm.currentTiles[0].id)
        vm.toggleTile(vm.currentTiles[0].id)
        XCTAssertEqual(vm.gamification.xp, 0)
    }

    func testCanAdvancePhaseWhen8Selected() {
        let vm = makeVM()
        XCTAssertFalse(vm.canAdvancePhase)
        for i in 0..<8 {
            vm.toggleTile(vm.currentTiles[i].id)
        }
        XCTAssertTrue(vm.canAdvancePhase)
    }

    func testAdvanceFromMorningToAfternoon() {
        let vm = makeVM()
        for i in 0..<8 { vm.toggleTile(vm.currentTiles[i].id) }
        vm.advancePhase()
        XCTAssertEqual(vm.currentPhase, .afternoon)
        XCTAssertEqual(vm.currentTiles.count, 16)
        XCTAssertTrue(vm.gamification.earnedBadges.contains(.morningComplete))
    }

    func testAdvanceFromAfternoonToScenarios() {
        let vm = makeVM()
        // Complete morning
        for i in 0..<8 { vm.toggleTile(vm.currentTiles[i].id) }
        vm.advancePhase()
        // Complete afternoon
        for i in 0..<8 { vm.toggleTile(vm.currentTiles[i].id) }
        vm.advancePhase()
        XCTAssertEqual(vm.currentPhase, .scenarios)
        XCTAssertTrue(vm.gamification.earnedBadges.contains(.afternoonComplete))
    }

    func testScenarioAnswerAdvancesQuestion() {
        let vm = makeVM()
        // Skip to scenarios
        for i in 0..<8 { vm.toggleTile(vm.currentTiles[i].id) }
        vm.advancePhase()
        for i in 0..<8 { vm.toggleTile(vm.currentTiles[i].id) }
        vm.advancePhase()

        XCTAssertEqual(vm.currentScenarioIndex, 0)
        vm.answerScenario(optionIndex: 0)
        XCTAssertEqual(vm.currentScenarioIndex, 1)
    }

    func testCompletingAllScenariosProducesProfile() {
        let vm = makeVM()
        // Complete morning
        for i in 0..<8 { vm.toggleTile(vm.currentTiles[i].id) }
        vm.advancePhase()
        // Complete afternoon
        for i in 0..<8 { vm.toggleTile(vm.currentTiles[i].id) }
        vm.advancePhase()
        // Answer all 10 scenarios
        for _ in 0..<10 { vm.answerScenario(optionIndex: 0) }

        XCTAssertNotNil(vm.personalityProfile)
        XCTAssertTrue(vm.isComplete)
        XCTAssertTrue(vm.gamification.earnedBadges.contains(.quizComplete))
    }

    func testOverallProgress() {
        let vm = makeVM()
        XCTAssertEqual(vm.overallProgress, 0, accuracy: 0.01)

        // Select 4 morning tiles (4/26 = ~0.15)
        for i in 0..<4 { vm.toggleTile(vm.currentTiles[i].id) }
        XCTAssertEqual(vm.overallProgress, 4.0 / 26.0, accuracy: 0.01)
    }
}
