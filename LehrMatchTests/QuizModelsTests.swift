import XCTest
@testable import LehrMatch

final class QuizModelsTests: XCTestCase {

    // MARK: - QuizDimension

    func testQuizDimensionHasAllRIASECCases() {
        let riasec: [QuizDimension] = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        XCTAssertEqual(riasec.count, 6)
    }

    func testQuizDimensionHasAllWorkValueCases() {
        let values: [QuizDimension] = [.teamwork, .independence, .creativity, .stability, .variety, .helpingOthers, .physicalActivity, .technology]
        XCTAssertEqual(values.count, 8)
    }

    func testQuizDimensionIsRIASEC() {
        XCTAssertTrue(QuizDimension.realistic.isRIASEC)
        XCTAssertTrue(QuizDimension.conventional.isRIASEC)
        XCTAssertFalse(QuizDimension.teamwork.isRIASEC)
        XCTAssertFalse(QuizDimension.technology.isRIASEC)
    }

    // MARK: - ActivityTile

    func testActivityTileStartsUnselected() {
        let tile = ActivityTile(id: "t1", label: "Test", iconName: "star", scores: [.realistic: 1.0])
        XCTAssertFalse(tile.isSelected)
    }

    func testActivityTileScores() {
        let tile = ActivityTile(id: "t1", label: "Maschine", iconName: "gearshape.2", scores: [.realistic: 1.0, .investigative: 0.3])
        XCTAssertEqual(tile.scores[.realistic], 1.0)
        XCTAssertEqual(tile.scores[.investigative], 0.3)
        XCTAssertNil(tile.scores[.artistic])
    }

    // MARK: - QuizPhase

    func testQuizPhaseOrdering() {
        XCTAssertTrue(QuizPhase.morning.rawValue < QuizPhase.afternoon.rawValue)
        XCTAssertTrue(QuizPhase.afternoon.rawValue < QuizPhase.scenarios.rawValue)
    }

    func testQuizPhaseRequiredPicks() {
        XCTAssertEqual(QuizPhase.morning.requiredPicks, 8)
        XCTAssertEqual(QuizPhase.afternoon.requiredPicks, 8)
        XCTAssertEqual(QuizPhase.scenarios.requiredPicks, 10)
    }

    func testQuizPhaseTitle() {
        XCTAssertEqual(QuizPhase.morning.title, "Dein Morgen")
        XCTAssertEqual(QuizPhase.afternoon.title, "Dein Nachmittag")
        XCTAssertEqual(QuizPhase.scenarios.title, "Was zählt für dich?")
    }
}
