import SwiftUI

struct QuizProgressHeader: View {
    let gamification: QuizGamificationState
    let currentPhase: QuizPhase
    let overallProgress: Double

    var body: some View {
        VStack(spacing: Theme.Spacing.sm) {
            // Phase indicator
            HStack(spacing: Theme.Spacing.md) {
                ForEach(QuizPhase.allCases, id: \.rawValue) { phase in
                    phaseIndicator(phase)
                }
            }

            // XP bar
            HStack(spacing: Theme.Spacing.sm) {
                Image(systemName: gamification.levelIcon)
                    .foregroundStyle(Theme.Colors.accentFallback)
                    .font(.title3)

                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text(gamification.levelTitle)
                            .font(Theme.Typography.badge)
                            .foregroundStyle(Theme.Colors.textPrimary)
                        Spacer()
                        Text("\(gamification.xp) XP")
                            .font(Theme.Typography.badge)
                            .foregroundStyle(Theme.Colors.primaryFallback)
                    }

                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Theme.Colors.backgroundSecondary)
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Theme.Colors.primaryFallback.gradient)
                                .frame(width: geo.size.width * gamification.progressToNextLevel)
                                .animation(Theme.Animation.swipeSpring, value: gamification.progressToNextLevel)
                        }
                    }
                    .frame(height: 8)
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)

            // Overall progress bar
            ProgressView(value: overallProgress)
                .tint(Theme.Colors.primaryFallback)
                .padding(.horizontal, Theme.Spacing.lg)
        }
        .padding(.vertical, Theme.Spacing.sm)
    }

    private func phaseIndicator(_ phase: QuizPhase) -> some View {
        let isActive = phase == currentPhase
        let isCompleted = phase.rawValue < currentPhase.rawValue

        return VStack(spacing: 4) {
            ZStack {
                Circle()
                    .fill(isCompleted ? Theme.Colors.compatibilityHigh : (isActive ? Theme.Colors.primaryFallback : Theme.Colors.backgroundSecondary))
                    .frame(width: 28, height: 28)

                if isCompleted {
                    Image(systemName: "checkmark")
                        .font(.caption.bold())
                        .foregroundStyle(.white)
                } else {
                    Text("\(phase.rawValue)")
                        .font(Theme.Typography.badge)
                        .foregroundStyle(isActive ? .white : Theme.Colors.textTertiary)
                }
            }

            Text(phase.title)
                .font(.system(size: 10))
                .foregroundStyle(isActive ? Theme.Colors.textPrimary : Theme.Colors.textTertiary)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity)
    }
}
