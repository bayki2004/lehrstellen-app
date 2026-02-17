import SwiftUI

@MainActor
@Observable
final class NavigationRouter {
    var selectedTab: AppTab = .discover
    var discoverPath = NavigationPath()
    var matchesPath = NavigationPath()
    var videosPath = NavigationPath()
    var profilePath = NavigationPath()

    func navigate(to destination: AppDestination) {
        switch destination {
        case .cardDetail, .filter:
            discoverPath.append(destination)
        case .matchDetail, .chat:
            matchesPath.append(destination)
        case .videoGenerator, .videoPreview:
            videosPath.append(destination)
        case .editProfile, .settings, .personalityResults:
            profilePath.append(destination)
        }
    }

    func popCurrent() {
        switch selectedTab {
        case .discover: if !discoverPath.isEmpty { discoverPath.removeLast() }
        case .matches: if !matchesPath.isEmpty { matchesPath.removeLast() }
        case .videos: if !videosPath.isEmpty { videosPath.removeLast() }
        case .profile: if !profilePath.isEmpty { profilePath.removeLast() }
        }
    }
}

enum AppTab: Int, CaseIterable {
    case discover
    case matches
    case videos
    case profile

    var title: String {
        switch self {
        case .discover: "Entdecken"
        case .matches: "Matches"
        case .videos: "Videos"
        case .profile: "Profil"
        }
    }

    var icon: String {
        switch self {
        case .discover: "flame.fill"
        case .matches: "heart.fill"
        case .videos: "play.rectangle.fill"
        case .profile: "person.fill"
        }
    }
}

enum AppDestination: Hashable {
    case cardDetail(id: UUID)
    case filter
    case matchDetail(id: UUID)
    case chat(matchId: UUID)
    case videoGenerator(matchId: UUID?)
    case videoPreview(videoId: UUID)
    case editProfile
    case settings
    case personalityResults
}
