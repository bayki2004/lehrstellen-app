import SwiftUI

struct MapPinView: View {
    let berufCategory: String?
    let isSelected: Bool
    let isApplied: Bool

    var body: some View {
        ZStack {
            Circle()
                .fill(pinColor)
                .frame(width: isSelected ? 40 : 32, height: isSelected ? 40 : 32)
                .overlay(
                    Circle()
                        .stroke(.white, lineWidth: isSelected ? 3 : 2)
                )
                .shadow(color: isSelected ? pinColor.opacity(0.4) : .clear, radius: 6)

            Image(systemName: pinIcon)
                .font(.system(size: isSelected ? 16 : 13))
                .foregroundStyle(.white)

            if isApplied {
                Circle()
                    .fill(.green)
                    .frame(width: 14, height: 14)
                    .overlay(
                        Image(systemName: "checkmark")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundStyle(.white)
                    )
                    .overlay(
                        Circle()
                            .stroke(.white, lineWidth: 1.5)
                    )
                    .offset(x: isSelected ? 14 : 11, y: isSelected ? -14 : -11)
            }
        }
        .animation(Theme.Animation.quick, value: isSelected)
    }

    private var pinColor: Color {
        guard let category = berufCategory else { return Theme.Colors.primaryFallback }
        switch category {
        case "technik": return .blue
        case "informatik": return .indigo
        case "gesundheit": return .pink
        case "kaufmaennisch": return .gray
        case "handwerk": return .orange
        case "gastronomie": return .brown
        case "detailhandel": return .teal
        case "design": return .purple
        case "soziales": return .mint
        case "bau": return .yellow
        case "logistik": return .cyan
        case "natur": return .green
        default: return Theme.Colors.primaryFallback
        }
    }

    private var pinIcon: String {
        guard let category = berufCategory else { return "mappin" }
        switch category {
        case "technik": return "gearshape.2"
        case "informatik": return "desktopcomputer"
        case "gesundheit": return "heart"
        case "kaufmaennisch": return "briefcase"
        case "handwerk": return "wrench"
        case "gastronomie": return "fork.knife"
        case "detailhandel": return "bag"
        case "design": return "paintbrush"
        case "soziales": return "person.2"
        case "bau": return "building.2"
        case "logistik": return "shippingbox"
        case "natur": return "leaf"
        default: return "mappin"
        }
    }
}
