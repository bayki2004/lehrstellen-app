import SwiftUI
import AVKit

struct VideoPreviewView: View {
    let videoId: UUID
    @State private var video: MotivationVideo = .sample

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                // Video player area
                ZStack {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.large)
                        .fill(Color.black)
                        .aspectRatio(16/9, contentMode: .fit)

                    if let videoURL = video.videoURL {
                        VideoPlayer(player: AVPlayer(url: videoURL))
                            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.large))
                    } else {
                        VStack(spacing: Theme.Spacing.md) {
                            Image(systemName: video.isProcessing ? "clock" : "play.circle")
                                .font(.system(size: 50))
                                .foregroundStyle(.white)

                            Text(video.isProcessing ? "Video wird erstellt..." : "Kein Video verfügbar")
                                .font(Theme.Typography.callout)
                                .foregroundStyle(.white.opacity(0.7))

                            if video.isProcessing {
                                ProgressView()
                                    .tint(.white)
                            }
                        }
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)

                // Script text
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Text("Skript")
                        .font(Theme.Typography.headline)

                    Text(video.scriptText)
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
                .padding(.horizontal, Theme.Spacing.lg)

                // Actions
                if video.isReady {
                    VStack(spacing: Theme.Spacing.md) {
                        PrimaryButton(title: "An Match senden") {
                            // Send video to matched company
                        }

                        PrimaryButton(title: "Teilen", action: {}, style: .outlined)
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                }
            }
            .padding(.bottom, Theme.Spacing.xxl)
        }
        .navigationTitle("Video-Vorschau")
        .navigationBarTitleDisplayMode(.inline)
    }
}
