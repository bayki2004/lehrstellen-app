import SwiftUI

struct AvatarView: View {
    let imageURL: URL?
    let name: String
    var size: CGFloat = 48

    var body: some View {
        Group {
            if let imageURL {
                AsyncImage(url: imageURL) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    initialsView
                }
            } else {
                initialsView
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
    }

    private var initialsView: some View {
        ZStack {
            Circle()
                .fill(Theme.Colors.primaryFallback.gradient)
            Text(initials)
                .font(.system(size: size * 0.36, weight: .semibold, design: .rounded))
                .foregroundStyle(.white)
        }
    }

    private var initials: String {
        let words = name.split(separator: " ")
        let firstLetters = words.prefix(2).compactMap { $0.first }
        return String(firstLetters).uppercased()
    }
}

#Preview {
    HStack(spacing: Theme.Spacing.md) {
        AvatarView(imageURL: nil, name: "Müller AG", size: 48)
        AvatarView(imageURL: nil, name: "Swiss Re", size: 64)
        AvatarView(imageURL: nil, name: "Post", size: 36)
    }
}
