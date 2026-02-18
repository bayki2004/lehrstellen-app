import SwiftUI
import AVKit

struct MotivationVideoStepView: View {
    @Bindable var viewModel: ProfileBuilderViewModel
    @State private var showCamera = false

    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            // Info header
            VStack(spacing: Theme.Spacing.sm) {
                Image(systemName: "video.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(Theme.Colors.primaryFallback)

                Text("Dein Motivationsvideo")
                    .font(Theme.Typography.title)

                Text("Stelle dich in 30-60 Sekunden vor. Erzähl, wer du bist und warum du dich für diesen Beruf interessierst.")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
            }

            if let videoUrl = viewModel.motivationVideoUrl, let url = URL(string: videoUrl) {
                // Show video preview
                VideoPlayer(player: AVPlayer(url: url))
                    .frame(height: 300)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.large))

                PrimaryButton(title: "Neues Video aufnehmen", action: {
                    showCamera = true
                }, style: .outlined)
            } else {
                // Prompt to record
                VStack(spacing: Theme.Spacing.md) {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.large)
                        .fill(Theme.Colors.backgroundSecondary)
                        .frame(height: 250)
                        .overlay {
                            VStack(spacing: Theme.Spacing.md) {
                                Image(systemName: "video.badge.plus")
                                    .font(.system(size: 50))
                                    .foregroundStyle(Theme.Colors.textTertiary)
                                Text("Noch kein Video aufgenommen")
                                    .font(Theme.Typography.callout)
                                    .foregroundStyle(Theme.Colors.textTertiary)
                            }
                        }

                    PrimaryButton(title: "Video aufnehmen") {
                        showCamera = true
                    }
                }
            }

            // Tips
            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                Text("Tipps:")
                    .font(Theme.Typography.headline)

                tipRow("Schau in die Kamera und lächle")
                tipRow("Sprich klar und deutlich")
                tipRow("Erzähl, was dich besonders macht")
                tipRow("Halte es unter 60 Sekunden")
            }
            .padding(Theme.Spacing.md)
            .background(Theme.Colors.backgroundSecondary)
            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))

            Text("Du kannst diesen Schritt auch überspringen und später aufnehmen.")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
                .multilineTextAlignment(.center)
        }
        .fullScreenCover(isPresented: $showCamera) {
            CameraRecorderView { videoData in
                showCamera = false
                if let data = videoData {
                    Task { await viewModel.uploadVideo(data: data) }
                }
            }
        }
    }

    private func tipRow(_ text: String) -> some View {
        HStack(spacing: Theme.Spacing.sm) {
            Image(systemName: "checkmark.circle.fill")
                .font(.caption)
                .foregroundStyle(Theme.Colors.swipeRight)
            Text(text)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
    }
}
