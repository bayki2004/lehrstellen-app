import SwiftUI

struct MainTabView: View {
    @Environment(AppState.self) private var appState
    @Environment(NavigationRouter.self) private var router

    var body: some View {
        if appState.userType == .company {
            companyTabView
        } else {
            studentTabView
        }
    }

    // MARK: - Student Tabs

    private var studentTabView: some View {
        @Bindable var router = router

        return TabView(selection: $router.selectedTab) {
            Tab(AppTab.discover.title, systemImage: AppTab.discover.icon, value: .discover) {
                NavigationStack(path: $router.discoverPath) {
                    DiscoveryFeedView()
                        .navigationDestination(for: AppDestination.self) { destination in
                            studentDestinationView(for: destination)
                        }
                }
            }

            Tab(AppTab.map.title, systemImage: AppTab.map.icon, value: .map) {
                NavigationStack(path: $router.mapPath) {
                    MapView()
                        .navigationDestination(for: AppDestination.self) { destination in
                            studentDestinationView(for: destination)
                        }
                }
            }

            Tab(AppTab.search.title, systemImage: AppTab.search.icon, value: .search) {
                NavigationStack(path: $router.searchPath) {
                    SearchView()
                        .navigationDestination(for: AppDestination.self) { destination in
                            studentDestinationView(for: destination)
                        }
                }
            }

            Tab(AppTab.bewerbungen.title, systemImage: AppTab.bewerbungen.icon, value: .bewerbungen) {
                NavigationStack(path: $router.bewerbungenPath) {
                    BewerbungenListView()
                        .navigationDestination(for: AppDestination.self) { destination in
                            studentDestinationView(for: destination)
                        }
                }
            }

            Tab(AppTab.profile.title, systemImage: AppTab.profile.icon, value: .profile) {
                NavigationStack(path: $router.profilePath) {
                    ProfileView()
                        .navigationDestination(for: AppDestination.self) { destination in
                            studentDestinationView(for: destination)
                        }
                }
            }
        }
        .tint(Theme.Colors.primary)
    }

    // MARK: - Company Tabs

    private var companyTabView: some View {
        @Bindable var router = router

        return TabView(selection: $router.selectedCompanyTab) {
            Tab(CompanyTab.dashboard.title, systemImage: CompanyTab.dashboard.icon, value: .dashboard) {
                NavigationStack(path: $router.companyDashboardPath) {
                    CompanyDashboardView()
                        .navigationDestination(for: CompanyDestination.self) { destination in
                            companyDestinationView(for: destination)
                        }
                }
            }

            Tab(CompanyTab.listings.title, systemImage: CompanyTab.listings.icon, value: .listings) {
                NavigationStack(path: $router.companyListingsPath) {
                    CompanyListingsView()
                        .navigationDestination(for: CompanyDestination.self) { destination in
                            companyDestinationView(for: destination)
                        }
                }
            }

            Tab(CompanyTab.bewerbungen.title, systemImage: CompanyTab.bewerbungen.icon, value: .bewerbungen) {
                NavigationStack(path: $router.companyBewerbungenPath) {
                    CompanyBewerbungenView()
                        .navigationDestination(for: CompanyDestination.self) { destination in
                            companyDestinationView(for: destination)
                        }
                }
            }

            Tab(CompanyTab.companyProfile.title, systemImage: CompanyTab.companyProfile.icon, value: .companyProfile) {
                NavigationStack(path: $router.companyProfilePath) {
                    CompanyProfileView()
                        .navigationDestination(for: CompanyDestination.self) { destination in
                            companyDestinationView(for: destination)
                        }
                }
            }
        }
        .tint(Theme.Colors.primary)
    }

    // MARK: - Student Destination Routing

    @ViewBuilder
    private func studentDestinationView(for destination: AppDestination) -> some View {
        switch destination {
        case .cardDetail(let id):
            CardDetailView(lehrstelleId: id)
        case .filter:
            FilterSheetView()
        case .berufsschuleDetail(let id):
            BerufsschuleDetailView(schoolId: id)
        case .bewerbungDetail(let id):
            BewerbungDetailView(bewerbungId: id)
        case .editProfile:
            EditProfileView()
        case .settings:
            SettingsView()
        case .personalityResults:
            PersonalityResultsView()
        case .profileBuilder:
            ProfileBuilderView()
        case .passendeBerufe:
            PassendeBerufeView()
        case .berufDetail(let code):
            BerufDetailView(berufCode: code)
        }
    }

    // MARK: - Company Destination Routing

    @ViewBuilder
    private func companyDestinationView(for destination: CompanyDestination) -> some View {
        switch destination {
        case .listingDetail:
            EmptyView() // TODO: Listing detail view
        case .createListing:
            EmptyView() // Handled via sheet in CompanyListingsView
        case .bewerbungDetail(let id):
            CompanyBewerbungDetailView(applicationId: id)
        case .editProfile:
            EmptyView() // Handled in-place via edit mode
        }
    }
}
