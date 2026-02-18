import XCTest
@testable import LehrMatch

final class QuizScoringEngineTests: XCTestCase {

    func testEmptyInputProducesZeroScores() {
        let result = QuizScoringEngine.compute(
            morningPicks: [],
            afternoonPicks: [],
            scenarioAnswers: []
        )
        XCTAssertEqual(result.hollandCodes.realistic, 0)
        XCTAssertEqual(result.hollandCodes.investigative, 0)
    }

    func testSingleMorningPickScoresCorrectly() {
        // Pick tile m01: R: 1.0, I: 0.3
        let tile = QuizContent.morningTiles.first { $0.id == "m01" }!
        let result = QuizScoringEngine.compute(
            morningPicks: [tile],
            afternoonPicks: [],
            scenarioAnswers: []
        )
        // Morning weight = 0.3, so R = 1.0 * 0.3 = 0.3 (before normalization)
        XCTAssertGreaterThan(result.hollandCodes.realistic, 0)
        XCTAssertGreaterThan(result.hollandCodes.investigative, 0)
        XCTAssertEqual(result.hollandCodes.artistic, 0)
    }

    func testAllRealisticPicksMaximizeRealistic() {
        // Pick all tiles that score Realistic
        let realisticMorning = QuizContent.morningTiles.filter { $0.scores[.realistic] != nil }.prefix(8)
        let realisticAfternoon = QuizContent.afternoonTiles.filter { $0.scores[.realistic] != nil }.prefix(8)

        let result = QuizScoringEngine.compute(
            morningPicks: Array(realisticMorning),
            afternoonPicks: Array(realisticAfternoon),
            scenarioAnswers: []
        )
        // Realistic should be the highest dimension
        let codes = result.hollandCodes
        XCTAssertEqual(codes.dominantType, "R")
    }

    func testScenarioAnswerContributesToWorkValues() {
        // Answer s01, option 0: S: 1.0, teamwork: 0.8
        let answer = QuizAnswer(questionId: "s01", selectedOptionIndex: 0)
        let result = QuizScoringEngine.compute(
            morningPicks: [],
            afternoonPicks: [],
            scenarioAnswers: [answer]
        )
        XCTAssertGreaterThan(result.workValues.teamwork, 0)
        XCTAssertGreaterThan(result.hollandCodes.social, 0)
    }

    func testNormalizationStaysWithinBounds() {
        // Full quiz with 8+8 picks and 10 answers
        let morningPicks = Array(QuizContent.morningTiles.prefix(8))
        let afternoonPicks = Array(QuizContent.afternoonTiles.prefix(8))
        let answers = QuizContent.scenarioQuestions.enumerated().map { index, q in
            QuizAnswer(questionId: q.id, selectedOptionIndex: index % 4)
        }

        let result = QuizScoringEngine.compute(
            morningPicks: morningPicks,
            afternoonPicks: afternoonPicks,
            scenarioAnswers: answers
        )

        let codes = result.hollandCodes
        for value in codes.asVector {
            XCTAssertGreaterThanOrEqual(value, 0.0, "RIASEC score below 0")
            XCTAssertLessThanOrEqual(value, 1.0, "RIASEC score above 1")
        }
    }

    func testTopThreeCodesReturnsThreeLetters() {
        let morningPicks = Array(QuizContent.morningTiles.prefix(8))
        let afternoonPicks = Array(QuizContent.afternoonTiles.prefix(8))
        let result = QuizScoringEngine.compute(
            morningPicks: morningPicks,
            afternoonPicks: afternoonPicks,
            scenarioAnswers: []
        )
        XCTAssertEqual(result.hollandCodes.topThreeCodes.count, 3)
    }
}
