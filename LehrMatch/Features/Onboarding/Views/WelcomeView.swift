import SwiftUI

struct WelcomeView: View {
    let onContinue: () -> Void
    @State private var currentPage = 0

    private let pages: [(icon: String, title: String, description: String)] = [
        (
            "sparkles",
            "Entdecke deine Zukunft",
            "Finde die Lehrstelle, die wirklich zu dir passt — mit smarter KI-Unterstützung."
        ),
        (
            "hand.draw",
            "Swipe durch Lehrstellen",
            "Wie bei deinen Lieblings-Apps: Swipe nach rechts, wenn eine Lehrstelle dich interessiert."
        ),
        (
            "person.2.fill",
            "Matche mit Firmen",
            "Wenn eine Firma auch an dir interessiert ist, entsteht ein Match — und ihr könnt chatten."
        ),
    ]

    var body: some View {
        VStack(spacing: 0) {
            TabView(selection: $currentPage) {
                ForEach(pages.indices, id: \.self) { index in
                    welcomePage(pages[index])
                        .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .always))

            VStack(spacing: Theme.Spacing.md) {
                PrimaryButton(title: currentPage == pages.count - 1 ? "Los geht's" : "Weiter") {
                    if currentPage < pages.count - 1 {
                        withAnimation { currentPage += 1 }
                    } else {
                        onContinue()
                    }
                }

                if currentPage < pages.count - 1 {
                    Button("Überspringen") {
                        onContinue()
                    }
                    .font(Theme.Typography.callout)
                    .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.bottom, Theme.Spacing.xl)
        }
        .background(Theme.Colors.backgroundPrimary)
    }

    private func welcomePage(_ page: (icon: String, title: String, description: String)) -> some View {
        VStack(spacing: Theme.Spacing.lg) {
            Spacer()

            Image(systemName: page.icon)
                .font(.system(size: 80))
                .foregroundStyle(Theme.Colors.primaryFallback.gradient)
                .padding(.bottom, Theme.Spacing.md)

            Text(page.title)
                .font(Theme.Typography.largeTitle)
                .multilineTextAlignment(.center)

            Text(page.description)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.lg)

            Spacer()
            Spacer()
        }
    }
}

#Preview {
    WelcomeView(onContinue: {})
}
