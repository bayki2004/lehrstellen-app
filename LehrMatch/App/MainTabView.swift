import SwiftUI

struct MainTabView: View {
    @Environment(NavigationRouter.self) private var router

    var body: some View {
        @Bindable var router = router

        TabView(selection: $router.selectedTab) {
            Tab(AppTab.discover.title, systemImage: AppTab.discover.icon, value: .discover) {
                NavigationStack(path: $router.discoverPath) {
                    DiscoveryFeedView()
                        .navigationDestination(for: AppDestination.self) { destination in
                            destinationView(for: destination)
                        }
                }
            }

            Tab(AppTab.matches.title, systemImage: AppTab.matches.icon, value: .matches) {
                NavigationStack(path: $router.matchesPath) {
                    MatchesListView()
                        .navigationDestination(for: AppDestination.self) { destination in
                            destinationView(for: destination)
                        }
                }
            }

            Tab(AppTab.videos.title, systemImage: AppTab.videos.icon, value: .videos) {
                NavigationStack(path: $router.videosPath) {
                    VideoLibraryView()
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

    @ViewBuilder
    private func destinationView(for destination: AppDestination) -> some View {
        switch destination {
        case .cardDetail(let id):
            CardDetailView(lehrstelleId: id)
        case .filter:
            FilterSheetView()
        case .matchDetail(let id):
            MatchDetailView(matchId: id)
        case .chat(let matchId):
            ChatView(matchId: matchId)
        case .videoGenerator(let matchId):
            VideoGeneratorView(matchId: matchId)
        case .videoPreview(let videoId):
            VideoPreviewView(videoId: videoId)
        case .editProfile:
            EditProfileView()
        case .settings:
            SettingsView()
        case .personalityResults:
            PersonalityResultsView()
        }
    }
}
