import SwiftUI

@MainActor
@Observable
final class SwipeEngine {
    // Current card being interacted with
    var dragOffset: CGSize = .zero
    var dragRotation: Angle = .zero
    var activeCardId: UUID?

    // Swipe thresholds
    private let swipeThreshold: CGFloat = 100
    private let superLikeThreshold: CGFloat = -120 // Negative Y (swipe up)
    private let rotationMultiplier: Double = 0.1

    var swipeOverlayOpacity: Double {
        min(abs(dragOffset.width) / swipeThreshold, 1.0)
    }

    var isSwipingRight: Bool {
        dragOffset.width > swipeThreshold * 0.3
    }

    var isSwipingLeft: Bool {
        dragOffset.width < -swipeThreshold * 0.3
    }

    var isSwipingUp: Bool {
        dragOffset.height < superLikeThreshold * 0.3
    }

    func onDragChanged(_ value: DragGesture.Value) {
        dragOffset = value.translation
        dragRotation = .degrees(Double(value.translation.width) * rotationMultiplier)
    }

    func onDragEnded(_ value: DragGesture.Value) -> SwipeDirection? {
        // Check for super like first (swipe up)
        if value.translation.height < superLikeThreshold {
            return .superLike
        }

        // Check horizontal swipe
        if value.translation.width > swipeThreshold {
            return .right
        }

        if value.translation.width < -swipeThreshold {
            return .left
        }

        // Not enough — snap back
        return nil
    }

    func resetPosition() {
        withAnimation(Theme.Animation.cardReturn) {
            dragOffset = .zero
            dragRotation = .zero
            activeCardId = nil
        }
    }

    func animateSwipe(direction: SwipeDirection) {
        let targetOffset: CGSize
        switch direction {
        case .right:
            targetOffset = CGSize(width: 500, height: 0)
        case .left:
            targetOffset = CGSize(width: -500, height: 0)
        case .superLike:
            targetOffset = CGSize(width: 0, height: -600)
        }

        withAnimation(Theme.Animation.swipeSpring) {
            dragOffset = targetOffset
        }
    }
}
