import SwiftUI

struct VideoGeneratorView: View {
    let matchId: UUID?
    @Environment(AppState.self) private var appState
    @State private var viewModel: VideoMotivationViewModel?
    @State private var selectedLanguage: AppLanguage = .de
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                // Header
                Image(systemName: "wand.and.stars")
                    .font(.system(size: 50))
                    .foregroundStyle(Theme.Colors.primaryFallback.gradient)
                    .padding(.top, Theme.Spacing.xl)

                Text("AI Motivationsschreiben")
                    .font(Theme.Typography.title)

                Text("KI erstellt ein personalisiertes Video-Motivationsschreiben für dich.")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Theme.Spacing.lg)

                // Language selection
                Picker("Sprache", selection: $selectedLanguage) {
                    ForEach(AppLanguage.allCases, id: \.self) { lang in
                        Text(lang.displayName).tag(lang)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, Theme.Spacing.lg)

                if let viewModel {
                    if viewModel.isGeneratingScript {
                        VStack(spacing: Theme.Spacing.md) {
                            ProgressView()
                            Text("Skript wird generiert...")
                                .font(Theme.Typography.callout)
                                .foregroundStyle(Theme.Colors.textSecondary)
                        }
                        .padding(.vertical, Theme.Spacing.xxl)
                    } else if !viewModel.scriptText.isEmpty {
                        scriptEditView(viewModel: viewModel)
                    } else {
                        // Generate button
                        VStack(spacing: Theme.Spacing.md) {
                            stepsInfo

                            PrimaryButton(title: "Skript generieren") {
                                Task {
                                    await viewModel.generateScript(
                                        lehrstelleId: nil,
                                        matchId: matchId,
                                        language: selectedLanguage
                                    )
                                }
                            }
                            .padding(.horizontal, Theme.Spacing.lg)
                        }
                    }

                    if let error = viewModel.errorMessage {
                        Text(error)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(.red)
                            .padding(.horizontal)
                    }
                }
            }
            .padding(.bottom, Theme.Spacing.xxl)
        }
        .navigationTitle("Video erstellen")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            if viewModel == nil {
                viewModel = VideoMotivationViewModel(
                    apiClient: appState.apiClient,
                    studentId: appState.authManager.currentUserId ?? UUID()
                )
            }
        }
    }

    private var stepsInfo: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            stepRow(number: 1, text: "KI erstellt ein personalisiertes Skript")
            stepRow(number: 2, text: "Du kannst das Skript bearbeiten")
            stepRow(number: 3, text: "KI generiert dein Video (1-3 Min.)")
            stepRow(number: 4, text: "Video ansehen und an Firma senden")
        }
        .padding(Theme.Spacing.lg)
        .background(Theme.Colors.backgroundSecondary)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
        .padding(.horizontal, Theme.Spacing.lg)
    }

    private func stepRow(number: Int, text: String) -> some View {
        HStack(spacing: Theme.Spacing.md) {
            Text("\(number)")
                .font(Theme.Typography.badge)
                .foregroundStyle(.white)
                .frame(width: 24, height: 24)
                .background(Theme.Colors.primaryFallback)
                .clipShape(Circle())

            Text(text)
                .font(Theme.Typography.callout)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
    }

    private func scriptEditView(viewModel: VideoMotivationViewModel) -> some View {
        VStack(spacing: Theme.Spacing.md) {
            Text("Dein Skript")
                .font(Theme.Typography.headline)

            TextEditor(text: Binding(
                get: { viewModel.scriptText },
                set: { viewModel.scriptText = $0 }
            ))
            .frame(minHeight: 200)
            .padding(Theme.Spacing.sm)
            .background(Theme.Colors.backgroundSecondary)
            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
            .padding(.horizontal, Theme.Spacing.lg)

            HStack(spacing: Theme.Spacing.md) {
                PrimaryButton(title: "Neu generieren", action: {
                    Task {
                        await viewModel.generateScript(
                            lehrstelleId: nil,
                            matchId: matchId,
                            language: selectedLanguage
                        )
                    }
                }, style: .outlined)

                PrimaryButton(title: "Video erstellen", action: {
                    Task { await viewModel.createVideo() }
                }, isLoading: viewModel.isCreatingVideo)
            }
            .padding(.horizontal, Theme.Spacing.lg)
        }
    }
}
