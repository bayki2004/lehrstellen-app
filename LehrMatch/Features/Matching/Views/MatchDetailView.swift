import SwiftUI

struct MatchDetailView: View {
    let matchId: UUID

    var body: some View {
        // Reuses CardDetailView logic with match-specific context
        Text("Match Detail: \(matchId)")
            .navigationTitle("Match Details")
    }
}
