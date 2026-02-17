import XCTest
@testable import LehrMatch

final class QuizContentTests: XCTestCase {

    // MARK: - Grid Tiles

    func testMorningTilesCount() {
        XCTAssertEqual(QuizContent.morningTiles.count, 16)
    }

    func testAfternoonTilesCount() {
        XCTAssertEqual(QuizContent.afternoonTiles.count, 16)
    }

    func testAllTileIdsAreUnique() {
        let allTiles = QuizContent.morningTiles + QuizContent.afternoonTiles
        let ids = allTiles.map(\.id)
        XCTAssertEqual(ids.count, Set(ids).count, "Duplicate tile IDs found")
    }

    func testEachTileHasAtLeastOneScore() {
        let allTiles = QuizContent.morningTiles + QuizContent.afternoonTiles
        for tile in allTiles {
            XCTAssertFalse(tile.scores.isEmpty, "Tile '\(tile.label)' has no scores")
        }
    }

    func testMorningTilesCoverAllRIASECDimensions() {
        let dimensions = Set(QuizContent.morningTiles.flatMap { $0.scores.keys }.filter(\.isRIASEC))
        let allRIASEC: Set<QuizDimension> = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        XCTAssertEqual(dimensions, allRIASEC, "Morning tiles don't cover all RIASEC dimensions")
    }

    func testAfternoonTilesCoverAllRIASECDimensions() {
        let dimensions = Set(QuizContent.afternoonTiles.flatMap { $0.scores.keys }.filter(\.isRIASEC))
        let allRIASEC: Set<QuizDimension> = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        XCTAssertEqual(dimensions, allRIASEC, "Afternoon tiles don't cover all RIASEC dimensions")
    }

    func testEachRIASECDimensionHasMinimum2MorningTiles() {
        let riasec: [QuizDimension] = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        for dim in riasec {
            let count = QuizContent.morningTiles.filter { $0.scores[dim] != nil }.count
            XCTAssertGreaterThanOrEqual(count, 2, "Morning: dimension \(dim) only has \(count) tiles (need >=2)")
        }
    }

    func testEachRIASECDimensionHasMinimum2AfternoonTiles() {
        let riasec: [QuizDimension] = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        for dim in riasec {
            let count = QuizContent.afternoonTiles.filter { $0.scores[dim] != nil }.count
            XCTAssertGreaterThanOrEqual(count, 2, "Afternoon: dimension \(dim) only has \(count) tiles (need >=2)")
        }
    }

    // MARK: - Scenario Questions

    func testScenarioQuestionsCount() {
        XCTAssertEqual(QuizContent.scenarioQuestions.count, 10)
    }

    func testAllScenarioQuestionsHave4Options() {
        for question in QuizContent.scenarioQuestions {
            XCTAssertEqual(question.options.count, 4, "Question '\(question.text)' doesn't have 4 options")
        }
    }

    func testAllQuestionIdsAreUnique() {
        let ids = QuizContent.scenarioQuestions.map(\.id)
        XCTAssertEqual(ids.count, Set(ids).count, "Duplicate question IDs found")
    }

    func testEachOptionHasAtLeastOneScore() {
        for question in QuizContent.scenarioQuestions {
            for option in question.options {
                XCTAssertFalse(option.scores.isEmpty, "Option '\(option.text)' in question '\(question.id)' has no scores")
            }
        }
    }

    func testScenariosCoverAllRIASECDimensions() {
        let dimensions = Set(
            QuizContent.scenarioQuestions
                .flatMap { $0.options }
                .flatMap { $0.scores.keys }
                .filter(\.isRIASEC)
        )
        let allRIASEC: Set<QuizDimension> = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        XCTAssertEqual(dimensions, allRIASEC, "Scenarios don't cover all RIASEC dimensions")
    }

    // MARK: - Overall Coverage

    func testEachRIASECDimensionTestedAtLeast5TimesTotal() {
        let riasec: [QuizDimension] = [.realistic, .investigative, .artistic, .social, .enterprising, .conventional]
        let allTiles = QuizContent.morningTiles + QuizContent.afternoonTiles
        let allOptions = QuizContent.scenarioQuestions.flatMap(\.options)

        for dim in riasec {
            let tileCount = allTiles.filter { $0.scores[dim] != nil }.count
            let optionCount = allOptions.filter { $0.scores[dim] != nil }.count
            let total = tileCount + optionCount
            XCTAssertGreaterThanOrEqual(total, 5, "Dimension \(dim) only tested \(total) times (need >=5)")
        }
    }
}
