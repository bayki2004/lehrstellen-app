import SwiftUI

struct SearchView: View {
    @Environment(AppState.self) private var appState
    @Environment(NavigationRouter.self) private var router
    @State private var viewModel: SearchViewModel?

    private let cantons = [
        "ZH", "BE", "LU", "UR", "SZ", "OW", "NW", "GL", "ZG", "FR",
        "SO", "BS", "BL", "SH", "AR", "AI", "SG", "GR", "AG", "TG",
        "TI", "VD", "VS", "NE", "GE", "JU"
    ]

    var body: some View {
        Group {
            if let viewModel {
                searchContent(viewModel: viewModel)
            } else {
                ProgressView()
            }
        }
        .navigationTitle("Suche")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            if viewModel == nil {
                let vm = SearchViewModel(apiClient: appState.apiClient)
                viewModel = vm
                await vm.loadData()
            }
        }
    }

    private func searchContent(viewModel: SearchViewModel) -> some View {
        VStack(spacing: 0) {
            // Search bar
            HStack(spacing: Theme.Spacing.sm) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(Theme.Colors.textTertiary)
                TextField("Lehrstelle, Beruf oder Schule suchen...", text: Binding(
                    get: { viewModel.searchText },
                    set: { viewModel.searchText = $0 }
                ))
                .textFieldStyle(.plain)

                if !viewModel.searchText.isEmpty {
                    Button {
                        viewModel.searchText = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(Theme.Colors.textTertiary)
                    }
                }
            }
            .padding(Theme.Spacing.sm)
            .background(Theme.Colors.backgroundSecondary)
            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.small))
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.top, Theme.Spacing.sm)

            // Canton filter chips
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Theme.Spacing.xs) {
                    ForEach(cantons, id: \.self) { canton in
                        cantonChip(canton, viewModel: viewModel)
                    }
                }
                .padding(.horizontal, Theme.Spacing.md)
            }
            .padding(.vertical, Theme.Spacing.sm)

            // Segment picker
            Picker("Bereich", selection: Binding(
                get: { viewModel.selectedSegment },
                set: { viewModel.selectedSegment = $0 }
            )) {
                ForEach(SearchSegment.allCases, id: \.self) { segment in
                    Text(segment.rawValue).tag(segment)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.bottom, Theme.Spacing.sm)

            // Results count
            HStack {
                Text("\(viewModel.activeResultCount) Ergebnisse")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
                Spacer()
                if !viewModel.selectedCantons.isEmpty {
                    Button("Filter zurücksetzen") {
                        viewModel.clearFilters()
                    }
                    .font(Theme.Typography.caption)
                }
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.bottom, Theme.Spacing.xs)

            // Results list
            if viewModel.isLoading {
                Spacer()
                ProgressView()
                Spacer()
            } else {
                resultsList(viewModel: viewModel)
            }
        }
    }

    private func resultsList(viewModel: SearchViewModel) -> some View {
        ScrollView {
            LazyVStack(spacing: Theme.Spacing.xs) {
                switch viewModel.selectedSegment {
                case .lehrstellen:
                    ForEach(viewModel.filteredLehrstellen) { lehrstelle in
                        Button {
                            router.navigate(to: .cardDetail(id: lehrstelle.id))
                        } label: {
                            LehrstelleRowView(lehrstelle: lehrstelle)
                        }
                        .buttonStyle(.plain)
                    }
                case .berufe:
                    ForEach(viewModel.filteredBerufe) { beruf in
                        BerufRowView(beruf: beruf)
                    }
                case .berufsschulen:
                    ForEach(viewModel.filteredBerufsschulen) { school in
                        Button {
                            router.navigate(to: .berufsschuleDetail(id: school.id))
                        } label: {
                            BerufsschuleRowView(school: school)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.bottom, Theme.Spacing.lg)
        }
    }

    private func cantonChip(_ canton: String, viewModel: SearchViewModel) -> some View {
        let isSelected = viewModel.selectedCantons.contains(canton)
        return Button {
            viewModel.toggleCanton(canton)
        } label: {
            Text(canton)
                .font(Theme.Typography.badge)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(isSelected ? Theme.Colors.primaryFallback : Theme.Colors.backgroundSecondary)
                .foregroundStyle(isSelected ? .white : Theme.Colors.textPrimary)
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }
}
