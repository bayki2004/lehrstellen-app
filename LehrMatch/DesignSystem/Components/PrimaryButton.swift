import SwiftUI

struct PrimaryButton: View {
    let title: String
    let action: () -> Void
    var isLoading: Bool = false
    var isDisabled: Bool = false
    var style: ButtonStyle = .filled

    enum ButtonStyle {
        case filled
        case outlined
        case text
    }

    var body: some View {
        Button(action: action) {
            Group {
                if isLoading {
                    ProgressView()
                        .tint(style == .filled ? .white : Theme.Colors.primaryFallback)
                } else {
                    Text(title)
                        .font(Theme.Typography.headline)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(background)
            .foregroundStyle(foregroundColor)
            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
            .overlay {
                if style == .outlined {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.medium)
                        .stroke(Theme.Colors.primaryFallback, lineWidth: 2)
                }
            }
        }
        .disabled(isDisabled || isLoading)
        .opacity(isDisabled ? 0.5 : 1.0)
    }

    private var background: Color {
        switch style {
        case .filled: Theme.Colors.primaryFallback
        case .outlined: .clear
        case .text: .clear
        }
    }

    private var foregroundColor: Color {
        switch style {
        case .filled: .white
        case .outlined: Theme.Colors.primaryFallback
        case .text: Theme.Colors.primaryFallback
        }
    }
}

#Preview {
    VStack(spacing: Theme.Spacing.md) {
        PrimaryButton(title: "Weiter", action: {})
        PrimaryButton(title: "Weiter", action: {}, isLoading: true)
        PrimaryButton(title: "Abbrechen", action: {}, style: .outlined)
        PrimaryButton(title: "Überspringen", action: {}, style: .text)
    }
    .padding()
}
