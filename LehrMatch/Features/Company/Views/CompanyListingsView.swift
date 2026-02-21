import SwiftUI

struct CompanyListingsView: View {
    @Environment(AppState.self) private var appState
    @Environment(NavigationRouter.self) private var router
    @State private var viewModel: CompanyListingsViewModel?
    @State private var showCreateListing = false

    var body: some View {
        Group {
            if let vm = viewModel {
                listingsContent(vm)
            } else {
                ProgressView()
            }
        }
        .task {
            if viewModel == nil {
                viewModel = CompanyListingsViewModel(apiClient: appState.expressClient)
            }
            await viewModel?.loadListings()
        }
    }

    private func listingsContent(_ vm: CompanyListingsViewModel) -> some View {
        List {
            if vm.listings.isEmpty && !vm.isLoading {
                ContentUnavailableView(
                    "Keine Lehrstellen",
                    systemImage: "briefcase",
                    description: Text("Erstellen Sie Ihre erste Lehrstelle, um Bewerbungen zu erhalten.")
                )
            } else {
                ForEach(vm.listings) { listing in
                    CompanyListingRowView(listing: listing)
                }
                .onDelete { indexSet in
                    for index in indexSet {
                        let listing = vm.listings[index]
                        Task { await vm.deleteListing(id: listing.id) }
                    }
                }
            }
        }
        .navigationTitle("Lehrstellen")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    showCreateListing = true
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .refreshable {
            await vm.loadListings()
        }
        .sheet(isPresented: $showCreateListing) {
            CreateListingView(apiClient: appState.expressClient) {
                Task { await vm.loadListings() }
            }
        }
        .overlay {
            if vm.isLoading && vm.listings.isEmpty {
                ProgressView()
            }
        }
    }
}
