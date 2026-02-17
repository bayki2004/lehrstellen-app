import Foundation

enum QuizScoringEngine {

    struct Result {
        var hollandCodes: HollandCodes
        var workValues: WorkValues
    }

    /// Compute the final personality profile from all quiz phases.
    static func compute(
        morningPicks: [ActivityTile],
        afternoonPicks: [ActivityTile],
        scenarioAnswers: [QuizAnswer]
    ) -> Result {
        var rawRIASEC: [QuizDimension: Double] = [:]
        var rawWorkValues: [QuizDimension: Double] = [:]

        // Phase 1: Morning grid (weight 0.3)
        let morningWeight = QuizPhase.morning.phaseWeight
        for tile in morningPicks {
            for (dim, score) in tile.scores {
                if dim.isRIASEC {
                    rawRIASEC[dim, default: 0] += score * morningWeight
                } else {
                    rawWorkValues[dim, default: 0] += score * morningWeight
                }
            }
        }

        // Phase 2: Afternoon grid (weight 0.3)
        let afternoonWeight = QuizPhase.afternoon.phaseWeight
        for tile in afternoonPicks {
            for (dim, score) in tile.scores {
                if dim.isRIASEC {
                    rawRIASEC[dim, default: 0] += score * afternoonWeight
                } else {
                    rawWorkValues[dim, default: 0] += score * afternoonWeight
                }
            }
        }

        // Phase 3: Scenarios (weight 0.4)
        let scenarioWeight = QuizPhase.scenarios.phaseWeight
        let questions = QuizContent.scenarioQuestions
        for answer in scenarioAnswers {
            guard let question = questions.first(where: { $0.id == answer.questionId }),
                  answer.selectedOptionIndex < question.options.count else { continue }
            let option = question.options[answer.selectedOptionIndex]
            for (dim, score) in option.scores {
                if dim.isRIASEC {
                    rawRIASEC[dim, default: 0] += score * scenarioWeight
                } else {
                    rawWorkValues[dim, default: 0] += score * scenarioWeight
                }
            }
        }

        // Normalize RIASEC to [0, 1]
        let maxRIASEC = max(rawRIASEC.values.max() ?? 1.0, 0.001)
        let maxWorkValue = max(rawWorkValues.values.max() ?? 1.0, 0.001)

        var holland = HollandCodes()
        holland.realistic     = min((rawRIASEC[.realistic] ?? 0) / maxRIASEC, 1.0)
        holland.investigative = min((rawRIASEC[.investigative] ?? 0) / maxRIASEC, 1.0)
        holland.artistic      = min((rawRIASEC[.artistic] ?? 0) / maxRIASEC, 1.0)
        holland.social        = min((rawRIASEC[.social] ?? 0) / maxRIASEC, 1.0)
        holland.enterprising  = min((rawRIASEC[.enterprising] ?? 0) / maxRIASEC, 1.0)
        holland.conventional  = min((rawRIASEC[.conventional] ?? 0) / maxRIASEC, 1.0)

        var values = WorkValues()
        values.teamwork        = min((rawWorkValues[.teamwork] ?? 0) / maxWorkValue, 1.0)
        values.independence    = min((rawWorkValues[.independence] ?? 0) / maxWorkValue, 1.0)
        values.creativity      = min((rawWorkValues[.creativity] ?? 0) / maxWorkValue, 1.0)
        values.stability       = min((rawWorkValues[.stability] ?? 0) / maxWorkValue, 1.0)
        values.variety         = min((rawWorkValues[.variety] ?? 0) / maxWorkValue, 1.0)
        values.helpingOthers   = min((rawWorkValues[.helpingOthers] ?? 0) / maxWorkValue, 1.0)
        values.physicalActivity = min((rawWorkValues[.physicalActivity] ?? 0) / maxWorkValue, 1.0)
        values.technology      = min((rawWorkValues[.technology] ?? 0) / maxWorkValue, 1.0)

        return Result(hollandCodes: holland, workValues: values)
    }
}
