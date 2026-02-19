import SwiftUI

@MainActor
@Observable
final class NavigationRouter {
    var selectedTab: AppTab = .discover
    var discoverPath = NavigationPath()
    var mapPath = NavigationPath()
    var searchPath = NavigationPath()
    var bewerbungenPath = NavigationPath()
    var profilePath = NavigationPath()
    var pendingFilters: FeedFilters?

    func navigate(to destination: AppDestination) {
        switch destination {
        case .cardDetail, .filter, .berufsschuleDetail:
            switch selectedTab {
            case .map:
                mapPath.append(destination)
            case .search:
                searchPath.append(destination)
            default:
                discoverPath.append(destination)
            }
        case .bewerbungDetail:
            bewerbungenPath.append(destination)
        case .editProfile, .settings, .personalityResults, .profileBuilder, .passendeBerufe, .berufDetail:
            profilePath.append(destination)
        }
    }

    func popCurrent() {
        switch selectedTab {
        case .discover: if !discoverPath.isEmpty { discoverPath.removeLast() }
        case .map: if !mapPath.isEmpty { mapPath.removeLast() }
        case .search: if !searchPath.isEmpty { searchPath.removeLast() }
        case .bewerbungen: if !bewerbungenPath.isEmpty { bewerbungenPath.removeLast() }
        case .profile: if !profilePath.isEmpty { profilePath.removeLast() }
        }
    }
}

// MARK: - Student Tabs

enum AppTab: Int, CaseIterable {
    case discover
    case map
    case search
    case bewerbungen
    case profile

    var title: String {
        switch self {
        case .discover: "Entdecken"
        case .map: "Karte"
        case .search: "Suche"
        case .bewerbungen: "Bewerbungen"
        case .profile: "Profil"
        }
    }

    var icon: String {
        switch self {
        case .discover: "flame.fill"
        case .map: "map.fill"
        case .search: "magnifyingglass"
        case .bewerbungen: "doc.text.fill"
        case .profile: "person.fill"
        }
    }
}

// MARK: - Company Tabs

enum CompanyTab: Int, CaseIterable {
    case dashboard
    case listings
    case bewerbungen
    case companyProfile

    var title: String {
        switch self {
        case .dashboard: "Dashboard"
        case .listings: "Lehrstellen"
        case .bewerbungen: "Bewerbungen"
        case .companyProfile: "Profil"
        }
    }

    var icon: String {
        switch self {
        case .dashboard: "chart.bar.fill"
        case .listings: "briefcase.fill"
        case .bewerbungen: "tray.full.fill"
        case .companyProfile: "building.2.fill"
        }
    }
}

// MARK: - Navigation Destinations

enum AppDestination: Hashable {
    case cardDetail(id: UUID)
    case filter
    case berufsschuleDetail(id: UUID)
    case bewerbungDetail(id: UUID)
    case editProfile
    case settings
    case personalityResults
    case profileBuilder
    case passendeBerufe
    case berufDetail(code: String)
}
