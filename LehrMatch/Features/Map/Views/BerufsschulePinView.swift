import SwiftUI

struct BerufsschulePinView: View {
    let isSelected: Bool

    var body: some View {
        ZStack {
            Circle()
                .fill(.orange)
                .frame(width: isSelected ? 36 : 28, height: isSelected ? 36 : 28)
                .overlay(
                    Circle()
                        .stroke(.white, lineWidth: isSelected ? 3 : 2)
                )
                .shadow(color: isSelected ? .orange.opacity(0.4) : .clear, radius: 6)

            Image(systemName: "graduationcap.fill")
                .font(.system(size: isSelected ? 14 : 11))
                .foregroundStyle(.white)
        }
        .animation(Theme.Animation.quick, value: isSelected)
    }
}
