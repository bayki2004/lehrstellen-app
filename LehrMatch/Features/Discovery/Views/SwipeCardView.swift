import SwiftUI

struct SwipeCardView: View {
    let card: LehrstelleCard
    let isTopCard: Bool
    let swipeEngine: SwipeEngine
    let onSwipe: (SwipeDirection) -> Void
    let onTap: () -> Void

    @State private var showDetail = false

    var body: some View {
        CardContainer {
            ZStack(alignment: .bottom) {
                // Background image/gradient
                cardBackground

                // Gradient overlay for text readability
                LinearGradient(
                    colors: [.clear, .clear, .black.opacity(0.3), .black.opacity(0.7)],
                    startPoint: .top,
                    endPoint: .bottom
                )

                // Card content
                cardContent

                // Swipe overlays
                if isTopCard {
                    swipeOverlays
                }
            }
        }
        .frame(height: 520)
        .offset(isTopCard ? swipeEngine.dragOffset : .zero)
        .rotationEffect(isTopCard ? swipeEngine.dragRotation : .zero)
        .scaleEffect(isTopCard ? 1.0 : 0.95)
        .opacity(isTopCard ? 1.0 : 0.8)
        .gesture(isTopCard ? swipeGesture : nil)
        .onTapGesture {
            if isTopCard { onTap() }
        }
        .animation(Theme.Animation.swipeSpring, value: isTopCard)
    }

    // MARK: - Card Background

    private var cardBackground: some View {
        Group {
            if let photoUrl = card.primaryPhotoUrl {
                AsyncImage(url: photoUrl) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    placeholderGradient
                }
            } else {
                placeholderGradient
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .clipped()
    }

    private var placeholderGradient: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Theme.Colors.primaryFallback.opacity(0.6),
                    Theme.Colors.primaryFallback.opacity(0.9)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            // Company initial
            Text(String(card.companyName.prefix(1)))
                .font(.system(size: 120, weight: .bold, design: .rounded))
                .foregroundStyle(.white.opacity(0.2))
        }
    }

    // MARK: - Card Content

    private var cardContent: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Spacer()

            HStack {
                CompatibilityBadge(score: card.compatibilityScore, size: .medium)
                Spacer()
                if card.isPremium {
                    Image(systemName: "star.fill")
                        .foregroundStyle(.yellow)
                }
                if card.isVerified {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundStyle(.blue)
                }
            }

            Text(card.companyName)
                .font(Theme.Typography.cardTitle)
                .foregroundStyle(.white)

            Text(card.berufTitle)
                .font(Theme.Typography.cardSubtitle)
                .foregroundStyle(.white.opacity(0.9))

            HStack(spacing: Theme.Spacing.sm) {
                Label(card.locationDisplay, systemImage: "mappin")
                Spacer()
                Label(card.educationType.displayName, systemImage: "graduationcap")
            }
            .font(Theme.Typography.caption)
            .foregroundStyle(.white.opacity(0.8))

            if !card.cultureTags.isEmpty {
                HStack(spacing: Theme.Spacing.xs) {
                    ForEach(card.cultureTags.prefix(3), id: \.self) { tag in
                        Text(tag)
                            .font(Theme.Typography.badge)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.white.opacity(0.2))
                            .clipShape(Capsule())
                    }
                }
                .foregroundStyle(.white)
            }
        }
        .padding(Theme.Spacing.lg)
    }

    // MARK: - Swipe Overlays

    private var swipeOverlays: some View {
        ZStack {
            // LIKE overlay (right)
            swipeLabel(text: "LIKE", color: .green, rotation: -15)
                .opacity(swipeEngine.isSwipingRight ? swipeEngine.swipeOverlayOpacity : 0)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .padding(Theme.Spacing.xl)

            // NOPE overlay (left)
            swipeLabel(text: "NOPE", color: .red, rotation: 15)
                .opacity(swipeEngine.isSwipingLeft ? swipeEngine.swipeOverlayOpacity : 0)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                .padding(Theme.Spacing.xl)

            // SUPER LIKE overlay (up)
            swipeLabel(text: "SUPER", color: .blue, rotation: 0)
                .opacity(swipeEngine.isSwipingUp ? swipeEngine.swipeOverlayOpacity : 0)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                .padding(.top, Theme.Spacing.xxl)
        }
    }

    private func swipeLabel(text: String, color: Color, rotation: Double) -> some View {
        Text(text)
            .font(.system(size: 42, weight: .black, design: .rounded))
            .foregroundStyle(color)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(color, lineWidth: 4)
            )
            .rotationEffect(.degrees(rotation))
    }

    // MARK: - Gesture

    private var swipeGesture: some Gesture {
        DragGesture()
            .onChanged { value in
                swipeEngine.activeCardId = card.id
                swipeEngine.onDragChanged(value)
            }
            .onEnded { value in
                if let direction = swipeEngine.onDragEnded(value) {
                    swipeEngine.animateSwipe(direction: direction)
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        onSwipe(direction)
                        swipeEngine.resetPosition()
                    }
                } else {
                    swipeEngine.resetPosition()
                }
            }
    }
}
