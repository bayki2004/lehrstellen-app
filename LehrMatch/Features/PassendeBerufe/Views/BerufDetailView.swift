import SwiftUI

struct BerufDetailView: View {
    let berufCode: String

    @Environment(AppState.self) private var appState
    @Environment(NavigationRouter.self) private var router
    @State private var viewModel: BerufDetailViewModel?

    private var hollandCodes: HollandCodes? {
        appState.currentStudent?.personalityProfile?.hollandCodes
    }

    var body: some View {
        Group {
            if let vm = viewModel {
                content(vm: vm)
            } else {
                ProgressView()
            }
        }
        .navigationTitle(viewModel?.beruf?.nameDe ?? "Beruf")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            guard let codes = hollandCodes else { return }
            let vm = BerufDetailViewModel(apiClient: appState.apiClient, hollandCodes: codes, berufCode: berufCode)
            viewModel = vm
            await vm.load()
        }
    }

    private func content(vm: BerufDetailViewModel) -> some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                if vm.isLoading {
                    ProgressView()
                        .padding(.top, Theme.Spacing.xxl)
                } else if let beruf = vm.beruf {
                    // Match hero
                    matchHero(percentage: vm.matchPercentage, berufName: beruf.nameDe)

                    // Comparison radar chart
                    ComparisonRadarChartView(
                        userValues: vm.userVector,
                        berufValues: vm.berufVector,
                        labels: ["R", "I", "A", "S", "E", "C"]
                    )
                    .frame(height: 280)
                    .padding(.horizontal, Theme.Spacing.lg)

                    // Explanations
                    if !vm.explanations.isEmpty {
                        explanationsSection(explanations: vm.explanations)
                    }

                    // Beruf info
                    berufInfoSection(beruf: beruf)

                    // Lehrstellen button
                    if vm.lehrstellenCount > 0 {
                        lehrstellenButton(count: vm.lehrstellenCount, field: beruf.field)
                    }
                } else {
                    Text("Beruf nöd gfunde")
                        .font(Theme.Typography.callout)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .padding(.top, Theme.Spacing.xxl)
                }
            }
            .padding(.bottom, Theme.Spacing.xxl)
        }
    }

    private func matchHero(percentage: Int, berufName: String) -> some View {
        VStack(spacing: Theme.Spacing.sm) {
            ZStack {
                Circle()
                    .stroke(matchColor(percentage).opacity(0.2), lineWidth: 8)
                    .frame(width: 100, height: 100)
                Circle()
                    .trim(from: 0, to: Double(percentage) / 100)
                    .stroke(matchColor(percentage), style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .frame(width: 100, height: 100)
                    .rotationEffect(.degrees(-90))
                Text("\(percentage)%")
                    .font(Theme.Typography.largeTitle)
                    .foregroundStyle(matchColor(percentage))
            }
            Text("Match mit \(berufName)")
                .font(Theme.Typography.headline)
                .multilineTextAlignment(.center)
        }
        .padding(.top, Theme.Spacing.lg)
    }

    private func explanationsSection(explanations: [String]) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            Text("Warum passt das zu dir?")
                .font(Theme.Typography.title)
                .padding(.horizontal, Theme.Spacing.lg)

            ForEach(explanations, id: \.self) { text in
                HStack(alignment: .top, spacing: Theme.Spacing.sm) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                        .font(.title3)
                    Text(text)
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
                .padding(.horizontal, Theme.Spacing.lg)
            }
        }
    }

    private func berufInfoSection(beruf: Beruf) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            Text("Über de Beruf")
                .font(Theme.Typography.title)
                .padding(.horizontal, Theme.Spacing.lg)

            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                if let desc = beruf.descriptionDe {
                    Text(desc)
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }

                HStack(spacing: Theme.Spacing.lg) {
                    if let years = beruf.durationYears {
                        Label("\(years) Jahre", systemImage: "clock")
                            .font(Theme.Typography.callout)
                    }
                    if let edu = beruf.educationType {
                        Label(edu, systemImage: "graduationcap")
                            .font(Theme.Typography.callout)
                    }
                }
                .foregroundStyle(Theme.Colors.textSecondary)

                if let field = beruf.field {
                    Text(field)
                        .font(Theme.Typography.badge)
                        .foregroundStyle(Theme.Colors.primaryFallback)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Theme.Colors.primaryFallback.opacity(0.1))
                        .clipShape(Capsule())
                }

                if let code = beruf.hollandCode {
                    Text("Holland-Code: \(code)")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)
        }
    }

    private func lehrstellenButton(count: Int, field: String?) -> some View {
        PrimaryButton(title: "\(count) offeni Lehrstelle\(count == 1 ? "" : "n") azeige") {
            if let field {
                router.pendingFilters = FeedFilters(berufCategory: field)
            }
            router.selectedTab = .discover
        }
        .padding(.horizontal, Theme.Spacing.lg)
    }

    private func matchColor(_ percentage: Int) -> Color {
        if percentage >= 75 { return .green }
        if percentage >= 50 { return .orange }
        return .red
    }
}
