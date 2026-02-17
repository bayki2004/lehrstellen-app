import SwiftUI

struct VideoLibraryView: View {
    @Environment(AppState.self) private var appState
    @Environment(NavigationRouter.self) private var router
    @State private var viewModel: VideoMotivationViewModel?

    var body: some View {
        Group {
            if let viewModel {
                if viewModel.videos.isEmpty {
                    emptyStateView
                } else {
                    videoList(viewModel: viewModel)
                }
            } else {
                ProgressView()
            }
        }
        .navigationTitle("Motivationsvideos")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    router.navigate(to: .videoGenerator(matchId: nil))
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .task {
            if viewModel == nil {
                let vm = VideoMotivationViewModel(
                    apiClient: appState.apiClient,
                    studentId: appState.authManager.currentUserId ?? UUID()
                )
                viewModel = vm
                await vm.loadVideos()
            }
        }
    }

    private func videoList(viewModel: VideoMotivationViewModel) -> some View {
        List(viewModel.videos) { video in
            videoRow(video)
                .onTapGesture {
                    router.navigate(to: .videoPreview(videoId: video.id))
                }
        }
        .listStyle(.insetGrouped)
    }

    private func videoRow(_ video: MotivationVideo) -> some View {
        HStack(spacing: Theme.Spacing.md) {
            // Thumbnail placeholder
            RoundedRectangle(cornerRadius: Theme.CornerRadius.small)
                .fill(Theme.Colors.primaryFallback.gradient)
                .frame(width: 72, height: 54)
                .overlay {
                    Image(systemName: video.isReady ? "play.fill" : "clock")
                        .foregroundStyle(.white)
                }

            VStack(alignment: .leading, spacing: 2) {
                Text(video.language.displayName)
                    .font(Theme.Typography.headline)

                Text(video.scriptText.prefix(50) + "...")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .lineLimit(2)

                HStack {
                    statusBadge(video.generationStatus)

                    if let duration = video.durationSeconds {
                        Text("\(duration)s")
                            .font(Theme.Typography.badge)
                            .foregroundStyle(Theme.Colors.textTertiary)
                    }
                }
            }
        }
    }

    private func statusBadge(_ status: VideoGenerationStatus) -> some View {
        let (text, color): (String, Color) = switch status {
        case .pending: ("Warten", .gray)
        case .generatingScript: ("Skript wird erstellt", .blue)
        case .scriptReady: ("Skript bereit", .orange)
        case .processing: ("Video wird erstellt", .blue)
        case .completed: ("Fertig", .green)
        case .failed: ("Fehlgeschlagen", .red)
        }

        return Text(text)
            .font(Theme.Typography.badge)
            .foregroundStyle(color)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(color.opacity(0.1))
            .clipShape(Capsule())
    }

    private var emptyStateView: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Image(systemName: "video.badge.plus")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.textTertiary)

            Text("Noch keine Videos")
                .font(Theme.Typography.title)

            Text("Erstelle ein AI-Motivationsschreiben als Video. KI generiert ein personalisiertes Skript und ein professionelles Video für dich.")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)

            PrimaryButton(title: "Erstes Video erstellen") {
                router.navigate(to: .videoGenerator(matchId: nil))
            }
            .frame(width: 240)
        }
        .padding(Theme.Spacing.xl)
    }
}
