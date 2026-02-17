import SwiftUI

struct PhaseTransitionView: View {
    let badge: QuizBadge
    let onDismiss: () -> Void
    @State private var showBadge = false
    @State private var showParticles = false

    var body: some View {
        ZStack {
            // Dimmed background
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture { onDismiss() }

            VStack(spacing: Theme.Spacing.lg) {
                // Badge icon
                Image(systemName: badge.iconName)
                    .font(.system(size: 60))
                    .foregroundStyle(Theme.Colors.accentFallback.gradient)
                    .scaleEffect(showBadge ? 1.0 : 0.3)
                    .opacity(showBadge ? 1.0 : 0)

                Text(badge.rawValue)
                    .font(Theme.Typography.largeTitle)
                    .foregroundStyle(.white)
                    .scaleEffect(showBadge ? 1.0 : 0.5)
                    .opacity(showBadge ? 1.0 : 0)

                PrimaryButton(title: "Weiter") {
                    onDismiss()
                }
                .frame(width: 200)
                .opacity(showBadge ? 1.0 : 0)
            }

            // Confetti particles
            if showParticles {
                ConfettiView()
                    .allowsHitTesting(false)
            }
        }
        .onAppear {
            withAnimation(Theme.Animation.matchCelebration) {
                showBadge = true
            }
            withAnimation(Theme.Animation.matchCelebration.delay(0.2)) {
                showParticles = true
            }
        }
        .sensoryFeedback(.success, trigger: showBadge)
    }
}

/// Simple confetti particle effect using Canvas.
struct ConfettiView: View {
    @State private var particles: [ConfettiParticle] = (0..<40).map { _ in ConfettiParticle() }
    @State private var animating = false

    var body: some View {
        TimelineView(.animation) { timeline in
            Canvas { context, size in
                let time = animating ? timeline.date.timeIntervalSinceReferenceDate : 0
                for particle in particles {
                    let age = time.truncatingRemainder(dividingBy: 3.0)
                    let x = particle.startX * size.width + sin(age * particle.wobble) * 30
                    let y = age * particle.speed * size.height / 3.0
                    let opacity = max(0, 1 - age / 3.0)

                    context.opacity = opacity
                    context.fill(
                        Path(CGRect(x: x - 4, y: y - 4, width: 8, height: 8)),
                        with: .color(particle.color)
                    )
                }
            }
        }
        .onAppear { animating = true }
        .ignoresSafeArea()
    }
}

private struct ConfettiParticle {
    let startX = Double.random(in: 0...1)
    let speed = Double.random(in: 0.5...1.5)
    let wobble = Double.random(in: 2...6)
    let color: Color = [
        Theme.Colors.primaryFallback,
        Theme.Colors.accentFallback,
        Theme.Colors.compatibilityHigh,
        Color.purple, Color.orange, Color.pink
    ].randomElement()!
}
