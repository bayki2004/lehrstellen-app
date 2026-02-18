import SwiftUI

struct BewerbungSentConfirmationView: View {
    let companyName: String
    let berufTitle: String
    let onDismiss: () -> Void

    @State private var showCheckmark = false

    var body: some View {
        ZStack {
            Color.black.opacity(0.6)
                .ignoresSafeArea()
                .onTapGesture { onDismiss() }

            VStack(spacing: Theme.Spacing.lg) {
                ZStack {
                    Circle()
                        .fill(Theme.Colors.swipeRight.opacity(0.15))
                        .frame(width: 120, height: 120)

                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 80))
                        .foregroundStyle(Theme.Colors.swipeRight)
                        .scaleEffect(showCheckmark ? 1.0 : 0.3)
                        .opacity(showCheckmark ? 1.0 : 0.0)
                }

                Text("Bewerbung gesendet!")
                    .font(Theme.Typography.largeTitle)
                    .foregroundStyle(.white)

                Text("Dein Profil wurde an **\(companyName)** für die Stelle **\(berufTitle)** gesendet.")
                    .font(Theme.Typography.body)
                    .foregroundStyle(.white.opacity(0.9))
                    .multilineTextAlignment(.center)

                PrimaryButton(title: "Weiter swipen", action: onDismiss)
                    .frame(width: 200)
            }
            .padding(Theme.Spacing.xl)
        }
        .onAppear {
            withAnimation(Theme.Animation.matchCelebration) {
                showCheckmark = true
            }
            // Auto-dismiss after 3 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                onDismiss()
            }
        }
    }
}
