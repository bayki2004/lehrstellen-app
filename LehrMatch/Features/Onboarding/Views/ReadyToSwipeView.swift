import SwiftUI

struct ReadyToSwipeView: View {
    let onStart: () -> Void
    @State private var showContent = false

    var body: some View {
        VStack(spacing: Theme.Spacing.xl) {
            Spacer()

            if showContent {
                Image(systemName: "flame.fill")
                    .font(.system(size: 100))
                    .foregroundStyle(Theme.Colors.primaryFallback.gradient)
                    .transition(.scale.combined(with: .opacity))

                Text("Du bist bereit!")
                    .font(Theme.Typography.largeTitle)
                    .transition(.move(edge: .bottom).combined(with: .opacity))

                Text("Entdecke jetzt Lehrstellen, die zu dir passen.")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Theme.Spacing.xl)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }

            Spacer()

            if showContent {
                VStack(spacing: Theme.Spacing.md) {
                    swipeTip(icon: "hand.point.right.fill", color: .green, text: "Swipe rechts = Interesse")
                    swipeTip(icon: "hand.point.left.fill", color: .red, text: "Swipe links = Weiter")
                    swipeTip(icon: "hand.point.up.fill", color: .blue, text: "Swipe hoch = Super Like")
                }
                .padding(.horizontal, Theme.Spacing.xl)
                .transition(.move(edge: .bottom).combined(with: .opacity))

                PrimaryButton(title: "Lehrstellen entdecken", action: onStart)
                    .padding(.horizontal, Theme.Spacing.lg)
                    .padding(.bottom, Theme.Spacing.xl)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .background(Theme.Colors.backgroundPrimary)
        .onAppear {
            withAnimation(Theme.Animation.matchCelebration.delay(0.2)) {
                showContent = true
            }
        }
    }

    private func swipeTip(icon: String, color: Color, text: String) -> some View {
        HStack(spacing: Theme.Spacing.md) {
            Image(systemName: icon)
                .foregroundStyle(color)
                .frame(width: 30)
            Text(text)
                .font(Theme.Typography.body)
            Spacer()
        }
    }
}

#Preview {
    ReadyToSwipeView(onStart: {})
}
