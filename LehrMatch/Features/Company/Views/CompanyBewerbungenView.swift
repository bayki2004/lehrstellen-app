import SwiftUI

struct CompanyBewerbungenView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel: CompanyBewerbungenViewModel?

    var body: some View {
        Group {
            if let vm = viewModel {
                bewerbungenContent(vm)
            } else {
                ProgressView()
            }
        }
        .task {
            if viewModel == nil {
                viewModel = CompanyBewerbungenViewModel(apiClient: appState.expressClient)
            }
            await viewModel?.loadApplications()
        }
    }

    private func bewerbungenContent(_ vm: CompanyBewerbungenViewModel) -> some View {
        VStack(spacing: 0) {
            // Filter picker
            Picker("Filter", selection: Bindable(vm).selectedFilter) {
                ForEach(CompanyApplicationFilter.allCases, id: \.self) { filter in
                    Text(filter.displayName).tag(filter)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.sm)

            // Application list
            List {
                if vm.filteredApplications.isEmpty {
                    ContentUnavailableView(
                        "Keine Bewerbungen",
                        systemImage: "tray",
                        description: Text("Für diesen Filter gibt es keine Bewerbungen.")
                    )
                } else {
                    ForEach(vm.filteredApplications) { application in
                        NavigationLink(value: CompanyDestination.bewerbungDetail(id: application.id)) {
                            CompanyBewerbungRowView(application: application)
                        }
                    }
                }
            }
            .listStyle(.plain)
            .refreshable {
                await vm.loadApplications()
            }
        }
        .navigationTitle("Bewerbungen")
        .overlay {
            if vm.isLoading && vm.applications.isEmpty {
                ProgressView()
            }
        }
    }
}
