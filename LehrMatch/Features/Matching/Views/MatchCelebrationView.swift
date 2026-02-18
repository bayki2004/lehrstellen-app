import SwiftUI

struct MatchCelebrationView: View {
    let card: LehrstelleCard
    let onDismiss: () -> Void

    @State private var showContent = false
    @State private var showButtons = false

    var body: some View {
        ZStack {
            // Blurred background
            Color.black.opacity(0.7)
                .ignoresSafeArea()
                .onTapGesture { onDismiss() }

            VStack(spacing: Theme.Spacing.xl) {
                Spacer()

                if showContent {
                    // Match icon
                    Image(systemName: "heart.fill")
                        .font(.system(size: 80))
                        .foregroundStyle(.red.gradient)
                        .transition(.scale.combined(with: .opacity))

                    Text("It's a Match!")
                        .font(.system(size: 36, weight: .black, design: .rounded))
                        .foregroundStyle(.white)
                        .transition(.scale.combined(with: .opacity))

                    Text("Du und \(card.companyName) habt gegenseitiges Interesse!")
                        .font(Theme.Typography.body)
                        .foregroundStyle(.white.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, Theme.Spacing.xl)
                        .transition(.move(edge: .bottom).combined(with: .opacity))

                    // Company info card
                    HStack(spacing: Theme.Spacing.md) {
                        AvatarView(imageURL: card.companyLogoURL, name: card.companyName, size: 56)

                        VStack(alignment: .leading) {
                            Text(card.companyName)
                                .font(Theme.Typography.headline)
                                .foregroundStyle(.white)
                            Text(card.berufTitle)
                                .font(Theme.Typography.callout)
                                .foregroundStyle(.white.opacity(0.7))
                        }

                        Spacer()

                        CompatibilityBadge(score: card.compatibilityScore)
                    }
                    .padding(Theme.Spacing.md)
                    .background(.white.opacity(0.15))
                    .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
                    .padding(.horizontal, Theme.Spacing.lg)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }

                Spacer()

                if showButtons {
                    VStack(spacing: Theme.Spacing.md) {
                        PrimaryButton(title: "Nachricht senden") {
                            onDismiss()
                            // Navigate to chat
                        }

                        PrimaryButton(title: "AI Motivationsschreiben erstellen", action: {
                            onDismiss()
                            // Navigate to video generator
                        }, style: .outlined)

                        Button("Weiter swipen") {
                            onDismiss()
                        }
                        .font(Theme.Typography.callout)
                        .foregroundStyle(.white.opacity(0.7))
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                    .padding(.bottom, Theme.Spacing.xxl)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
        }
        .onAppear {
            withAnimation(Theme.Animation.matchCelebration.delay(0.1)) {
                showContent = true
            }
            withAnimation(Theme.Animation.standard.delay(0.6)) {
                showButtons = true
            }
        }
    }
}
