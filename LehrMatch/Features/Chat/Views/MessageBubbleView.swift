import SwiftUI

struct MessageBubbleView: View {
    let message: ChatMessage
    let isOwn: Bool

    var body: some View {
        HStack {
            if isOwn { Spacer(minLength: 60) }

            VStack(alignment: isOwn ? .trailing : .leading, spacing: 2) {
                if message.messageType == .system {
                    systemMessage
                } else {
                    messageBubble
                }

                Text(message.createdAt, style: .time)
                    .font(.system(size: 10))
                    .foregroundStyle(Theme.Colors.textTertiary)
            }

            if !isOwn { Spacer(minLength: 60) }
        }
    }

    private var messageBubble: some View {
        Text(message.content)
            .font(Theme.Typography.body)
            .foregroundStyle(isOwn ? .white : Theme.Colors.textPrimary)
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.sm)
            .background(
                isOwn
                    ? Theme.Colors.primaryFallback
                    : Theme.Colors.backgroundSecondary
            )
            .clipShape(ChatBubbleShape(isOwn: isOwn))
    }

    private var systemMessage: some View {
        Text(message.content)
            .font(Theme.Typography.caption)
            .foregroundStyle(Theme.Colors.textTertiary)
            .multilineTextAlignment(.center)
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.vertical, Theme.Spacing.sm)
            .frame(maxWidth: .infinity)
    }
}

struct ChatBubbleShape: Shape {
    let isOwn: Bool

    func path(in rect: CGRect) -> Path {
        let radius: CGFloat = 16
        let tailRadius: CGFloat = 6

        var path = Path()

        if isOwn {
            path.addRoundedRect(
                in: CGRect(x: rect.minX, y: rect.minY, width: rect.width - tailRadius, height: rect.height),
                cornerSize: CGSize(width: radius, height: radius)
            )
        } else {
            path.addRoundedRect(
                in: CGRect(x: rect.minX + tailRadius, y: rect.minY, width: rect.width - tailRadius, height: rect.height),
                cornerSize: CGSize(width: radius, height: radius)
            )
        }

        return path
    }
}
