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
                            destinationView(for: destination)
                        }
                }
            }

            Tab(AppTab.bewerbungen.title, systemImage: AppTab.bewerbungen.icon, value: .bewerbungen) {
                NavigationStack(path: $router.bewerbungenPath) {
                    BewerbungenListView()
                        .navigationDestination(for: AppDestination.self) { destination in
                            destinationView(for: destination)
                        }
                }
            }

            Tab(AppTab.profile.title, systemImage: AppTab.profile.icon, value: .profile) {
                NavigationStack(path: $router.profilePath) {
                    ProfileView()
                        .navigationDestination(for: AppDestination.self) { destination in
                            destinationView(for: destination)
                        }
                }
            }
        }
        .tint(Theme.Colors.primary)
    }

    // MARK: - Company Tabs

    private var companyTabView: some View {
        TabView {
            CompanyDashboardView()
                .tabItem { Label(CompanyTab.dashboard.title, systemImage: CompanyTab.dashboard.icon) }

            CompanyListingsView()
                .tabItem { Label(CompanyTab.listings.title, systemImage: CompanyTab.listings.icon) }

            CompanyBewerbungenView()
                .tabItem { Label(CompanyTab.bewerbungen.title, systemImage: CompanyTab.bewerbungen.icon) }

            CompanyProfileView()
                .tabItem { Label(CompanyTab.companyProfile.title, systemImage: CompanyTab.companyProfile.icon) }
        }
        .tint(Theme.Colors.primary)
    }

    // MARK: - Destination Routing

    @ViewBuilder
    private func destinationView(for destination: AppDestination) -> some View {
        switch destination {
        case .cardDetail(let id):
            CardDetailView(lehrstelleId: id)
        case .filter:
            FilterSheetView()
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
        }
    }
}
