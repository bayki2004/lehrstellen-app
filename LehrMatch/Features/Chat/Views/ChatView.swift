import SwiftUI

struct ChatView: View {
    let matchId: UUID
    @Environment(AppState.self) private var appState
    @State private var viewModel: ChatViewModel?
    @FocusState private var isInputFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            if let viewModel {
                // Messages list
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: Theme.Spacing.sm) {
                            ForEach(viewModel.messages) { message in
                                MessageBubbleView(
                                    message: message,
                                    isOwn: message.isFromStudent
                                )
                                .id(message.id)
                            }
                        }
                        .padding(.horizontal, Theme.Spacing.md)
                        .padding(.vertical, Theme.Spacing.sm)
                    }
                    .onChange(of: viewModel.messages.count) {
                        if let lastId = viewModel.messages.last?.id {
                            withAnimation {
                                proxy.scrollTo(lastId, anchor: .bottom)
                            }
                        }
                    }
                }

                Divider()

                // Input bar
                inputBar(viewModel: viewModel)
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task {
            if viewModel == nil {
                viewModel = ChatViewModel(
                    apiClient: appState.apiClient,
                    realtimeClient: RealtimeClient(),
                    matchId: matchId,
                    studentId: appState.authManager.currentUserId ?? UUID()
                )
            }
            await viewModel?.loadMessages()
            viewModel?.subscribeToRealtime()
        }
        .onDisappear {
            viewModel?.unsubscribeFromRealtime()
        }
    }

    private func inputBar(viewModel: ChatViewModel) -> some View {
        HStack(spacing: Theme.Spacing.sm) {
            TextField("Nachricht schreiben...", text: Binding(
                get: { viewModel.newMessageText },
                set: { viewModel.newMessageText = $0 }
            ), axis: .vertical)
                .textFieldStyle(.roundedBorder)
                .lineLimit(1...5)
                .focused($isInputFocused)

            Button {
                Task { await viewModel.sendMessage() }
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.title2)
                    .foregroundStyle(viewModel.canSend ? Theme.Colors.primaryFallback : Theme.Colors.textTertiary)
            }
            .disabled(!viewModel.canSend)
        }
        .padding(.horizontal, Theme.Spacing.md)
        .padding(.vertical, Theme.Spacing.sm)
        .background(Theme.Colors.backgroundPrimary)
    }
}
