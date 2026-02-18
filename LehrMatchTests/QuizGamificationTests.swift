import XCTest
@testable import LehrMatch

final class QuizGamificationTests: XCTestCase {

    func testInitialState() {
        let state = QuizGamificationState()
        XCTAssertEqual(state.xp, 0)
        XCTAssertEqual(state.level, 1)
        XCTAssertEqual(state.levelTitle, "Entdecker/in")
        XCTAssertTrue(state.earnedBadges.isEmpty)
    }

    func testAddXPStaysLevel1() {
        var state = QuizGamificationState()
        let leveled = state.addXP(50)
        XCTAssertEqual(state.xp, 50)
        XCTAssertEqual(state.level, 1)
        XCTAssertFalse(leveled)
    }

    func testAddXPTriggersLevel2() {
        var state = QuizGamificationState()
        _ = state.addXP(100)
        let leveled = state.addXP(25)
        XCTAssertEqual(state.xp, 125)
        XCTAssertEqual(state.level, 2)
        XCTAssertEqual(state.levelTitle, "Profi")
        XCTAssertTrue(leveled)
    }

    func testAddXPTriggersLevel3() {
        var state = QuizGamificationState()
        _ = state.addXP(245)
        let leveled = state.addXP(10)
        XCTAssertEqual(state.level, 3)
        XCTAssertEqual(state.levelTitle, "Persönlichkeits-Guru")
        XCTAssertTrue(leveled)
    }

    func testLevelDoesNotExceed3() {
        var state = QuizGamificationState()
        _ = state.addXP(500)
        XCTAssertEqual(state.level, 3)
    }

    func testEarnBadge() {
        var state = QuizGamificationState()
        state.earnBadge(.morningComplete)
        XCTAssertEqual(state.earnedBadges.count, 1)
        XCTAssertEqual(state.earnedBadges.first, .morningComplete)
    }

    func testNoDuplicateBadges() {
        var state = QuizGamificationState()
        state.earnBadge(.morningComplete)
        state.earnBadge(.morningComplete)
        XCTAssertEqual(state.earnedBadges.count, 1)
    }

    func testXPPerGridPick() {
        XCTAssertEqual(QuizGamificationState.xpPerGridPick, 10)
    }

    func testXPPerScenarioAnswer() {
        XCTAssertEqual(QuizGamificationState.xpPerScenarioAnswer, 15)
    }

    func testXPSpeedBonus() {
        XCTAssertEqual(QuizGamificationState.xpSpeedBonus, 5)
    }

    func testProgressToNextLevel() {
        var state = QuizGamificationState()
        _ = state.addXP(60)
        // Level 1: 0-119, so progress = 60/120 = 0.5
        XCTAssertEqual(state.progressToNextLevel, 0.5, accuracy: 0.01)
    }

    func testProgressAtMaxLevel() {
        var state = QuizGamificationState()
        _ = state.addXP(300)
        XCTAssertEqual(state.progressToNextLevel, 1.0)
    }
}
