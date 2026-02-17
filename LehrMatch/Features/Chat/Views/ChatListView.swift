import SwiftUI

// ChatListView is integrated into MatchesListView as the conversations section.
// This file exists for potential standalone use.

struct ChatListView: View {
    @Environment(NavigationRouter.self) private var router

    var body: some View {
        MatchesListView()
    }
}
