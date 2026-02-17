import Foundation

enum SwipeDirection: String, Codable {
    case right    // Interested
    case left     // Pass
    case superLike // Super Like (swipe up)
}

struct SwipeAction: Codable {
    let studentId: UUID
    let lehrstelleId: UUID
    let direction: SwipeDirection
    let createdAt: Date

    init(studentId: UUID, lehrstelleId: UUID, direction: SwipeDirection) {
        self.studentId = studentId
        self.lehrstelleId = lehrstelleId
        self.direction = direction
        self.createdAt = .now
    }
}

enum SwipeResult {
    case recorded
    case matched(Match)
}
