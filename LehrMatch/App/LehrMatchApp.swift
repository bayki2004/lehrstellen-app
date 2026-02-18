import SwiftUI

@main
struct LehrMatchApp: App {
    @State private var appState = AppState()
    @State private var navigationRouter = NavigationRouter()

    var body: some Scene {
        WindowGroup {
            Group {
                if appState.isAuthenticated {
                    MainTabView()
                } else if appState.hasCompletedOnboarding {
                    AuthView()
                } else {
                    OnboardingFlowView()
                }
            }
            .environment(appState)
            .environment(navigationRouter)
            .environment(appState.authManager)
            .environment(appState.apiClient)
        }
    }
}
