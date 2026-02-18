import SwiftUI

struct InterestSelectionView: View {
    let onComplete: () -> Void
    @State private var selectedBerufsfelder: Set<Berufsfeld> = []
    @State private var selectedCantons: Set<Canton> = []

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                Text("Was interessiert dich?")
                    .font(Theme.Typography.largeTitle)
                    .padding(.top, Theme.Spacing.lg)

                Text("Wähle die Berufsfelder, die dich ansprechen.")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)

                // Berufsfelder chips
                FlowLayout(spacing: Theme.Spacing.sm) {
                    ForEach(Berufsfeld.allCases) { feld in
                        chipButton(
                            title: feld.displayName,
                            icon: feld.icon,
                            isSelected: selectedBerufsfelder.contains(feld)
                        ) {
                            if selectedBerufsfelder.contains(feld) {
                                selectedBerufsfelder.remove(feld)
                            } else {
                                selectedBerufsfelder.insert(feld)
                            }
                        }
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)

                Divider()
                    .padding(.horizontal, Theme.Spacing.lg)

                Text("In welchen Kantonen suchst du?")
                    .font(Theme.Typography.headline)

                FlowLayout(spacing: Theme.Spacing.sm) {
                    ForEach(Canton.allCases) { canton in
                        chipButton(
                            title: canton.rawValue,
                            icon: nil,
                            isSelected: selectedCantons.contains(canton)
                        ) {
                            if selectedCantons.contains(canton) {
                                selectedCantons.remove(canton)
                            } else {
                                selectedCantons.insert(canton)
                            }
                        }
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)

                PrimaryButton(
                    title: "Weiter",
                    action: onComplete,
                    isDisabled: selectedBerufsfelder.isEmpty
                )
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.bottom, Theme.Spacing.xl)
            }
        }
        .background(Theme.Colors.backgroundPrimary)
    }

    private func chipButton(title: String, icon: String?, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: Theme.Spacing.xs) {
                if let icon {
                    Image(systemName: icon)
                        .font(.caption)
                }
                Text(title)
                    .font(Theme.Typography.caption)
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.sm)
            .background(isSelected ? Theme.Colors.primaryFallback : Theme.Colors.backgroundSecondary)
            .foregroundStyle(isSelected ? .white : Theme.Colors.textPrimary)
            .clipShape(Capsule())
        }
    }
}

// MARK: - Berufsfelder

enum Berufsfeld: String, CaseIterable, Identifiable, Codable {
    case technik = "technik"
    case informatik = "informatik"
    case gesundheit = "gesundheit"
    case kaufmaennisch = "kaufmaennisch"
    case handwerk = "handwerk"
    case gastronomie = "gastronomie"
    case detailhandel = "detailhandel"
    case design = "design"
    case soziales = "soziales"
    case bau = "bau"
    case logistik = "logistik"
    case natur = "natur"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .technik: "Technik"
        case .informatik: "Informatik"
        case .gesundheit: "Gesundheit"
        case .kaufmaennisch: "Kaufmännisch"
        case .handwerk: "Handwerk"
        case .gastronomie: "Gastronomie"
        case .detailhandel: "Detailhandel"
        case .design: "Design & Medien"
        case .soziales: "Soziales"
        case .bau: "Bau"
        case .logistik: "Logistik"
        case .natur: "Natur & Umwelt"
        }
    }

    var icon: String {
        switch self {
        case .technik: "gearshape.2"
        case .informatik: "desktopcomputer"
        case .gesundheit: "heart"
        case .kaufmaennisch: "briefcase"
        case .handwerk: "wrench"
        case .gastronomie: "fork.knife"
        case .detailhandel: "bag"
        case .design: "paintbrush"
        case .soziales: "person.2"
        case .bau: "building.2"
        case .logistik: "shippingbox"
        case .natur: "leaf"
        }
    }
}

// MARK: - FlowLayout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = layout(in: proposal.width ?? 0, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = layout(in: bounds.width, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func layout(in width: CGFloat, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var maxWidth: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > width, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
            maxWidth = max(maxWidth, x)
        }

        return (CGSize(width: maxWidth, height: y + rowHeight), positions)
    }
}
