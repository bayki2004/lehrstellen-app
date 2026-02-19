import SwiftUI

struct PassendeBerufeView: View {
    @Environment(AppState.self) private var appState
    @Environment(NavigationRouter.self) private var router
    @State private var viewModel: PassendeBerufeViewModel?

    private var hollandCodes: HollandCodes? {
        appState.currentStudent?.personalityProfile?.hollandCodes
    }

    var body: some View {
        Group {
            if let vm = viewModel {
                matchList(vm: vm)
            } else {
                noProfileView
            }
        }
        .navigationTitle("Passende Berufe")
        .task {
            guard let codes = hollandCodes else { return }
            let vm = PassendeBerufeViewModel(apiClient: appState.apiClient, hollandCodes: codes)
            viewModel = vm
            await vm.loadMatches()
        }
    }

    private func matchList(vm: PassendeBerufeViewModel) -> some View {
        ScrollView {
            if vm.isLoading {
                ProgressView()
                    .padding(.top, Theme.Spacing.xxl)
            } else if vm.matches.isEmpty {
                emptyState
            } else {
                LazyVStack(spacing: Theme.Spacing.md) {
                    Text("Basierend uf dim Persönlichkeitsprofil hämmer die Beruef für dich gfunde:")
                        .font(Theme.Typography.callout)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, Theme.Spacing.lg)
                        .padding(.top, Theme.Spacing.md)

                    ForEach(vm.matches) { match in
                        Button {
                            router.navigate(to: .berufDetail(code: match.beruf.code))
                        } label: {
                            BerufMatchCardView(
                                match: match,
                                lehrstellenCount: vm.lehrstellenCounts[match.beruf.code] ?? 0
                            )
                        }
                        .buttonStyle(.plain)
                        .padding(.horizontal, Theme.Spacing.lg)
                    }
                }
                .padding(.bottom, Theme.Spacing.xxl)
            }
        }
    }

    private var noProfileView: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Spacer()
            Image(systemName: "person.crop.circle.badge.questionmark")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.textTertiary)
            Text("Mach zerscht de Persönlichkeitsquiz")
                .font(Theme.Typography.headline)
            Text("Damit mer dir passendi Beruef zeige chönd, bruchemer dis Profil.")
                .font(Theme.Typography.callout)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
            PrimaryButton(title: "Quiz starte") {
                router.navigate(to: .personalityResults)
            }
            .padding(.horizontal, Theme.Spacing.lg)
            Spacer()
        }
        .padding(Theme.Spacing.lg)
    }

    private var emptyState: some View {
        VStack(spacing: Theme.Spacing.md) {
            Spacer()
            Image(systemName: "magnifyingglass")
                .font(.system(size: 48))
                .foregroundStyle(Theme.Colors.textTertiary)
            Text("Kei passendi Beruef gfunde")
                .font(Theme.Typography.headline)
            Text("Probier de Quiz nomal, damit mer besseri Vorschläg chönd mache.")
                .font(Theme.Typography.callout)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
            Spacer()
        }
        .padding(Theme.Spacing.lg)
    }
}
