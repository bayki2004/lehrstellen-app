import SwiftUI

struct MapFilterBar: View {
    @Binding var activeFilters: FeedFilters?
    @Binding var showBerufsschulen: Bool

    private let categories: [(key: String, label: String, icon: String)] = [
        ("informatik", "Informatik", "desktopcomputer"),
        ("technik", "Technik", "gearshape.2"),
        ("gesundheit", "Gesundheit", "heart"),
        ("kaufmaennisch", "KV", "briefcase"),
        ("handwerk", "Handwerk", "wrench"),
        ("gastronomie", "Gastro", "fork.knife"),
        ("detailhandel", "Handel", "bag"),
        ("design", "Design", "paintbrush"),
        ("soziales", "Soziales", "person.2"),
        ("bau", "Bau", "building.2"),
        ("logistik", "Logistik", "shippingbox"),
        ("natur", "Natur", "leaf"),
    ]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Theme.Spacing.sm) {
                // Schulen toggle chip
                schulenChip

                // Radius chip
                radiusChip

                // Category chips
                ForEach(categories, id: \.key) { category in
                    categoryChip(category)
                }
            }
            .padding(.horizontal, Theme.Spacing.md)
        }
        .padding(.vertical, Theme.Spacing.xs)
    }

    private func categoryChip(_ category: (key: String, label: String, icon: String)) -> some View {
        let isActive = activeFilters?.berufCategory == category.key
        return Button {
            var filters = activeFilters ?? FeedFilters()
            if isActive {
                filters.berufCategory = nil
            } else {
                filters.berufCategory = category.key
            }
            activeFilters = filters
        } label: {
            HStack(spacing: 4) {
                Image(systemName: category.icon)
                    .font(.system(size: 10))
                Text(category.label)
                    .font(Theme.Typography.badge)
                if isActive {
                    Image(systemName: "xmark")
                        .font(.system(size: 8, weight: .bold))
                }
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(isActive ? Theme.Colors.primaryFallback : Theme.Colors.cardBackground)
            .foregroundStyle(isActive ? .white : Theme.Colors.textPrimary)
            .clipShape(Capsule())
            .overlay(
                Capsule()
                    .stroke(isActive ? .clear : Theme.Colors.textTertiary.opacity(0.3), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.08), radius: 2, y: 1)
        }
        .buttonStyle(.plain)
    }

    private var schulenChip: some View {
        Button {
            showBerufsschulen.toggle()
        } label: {
            HStack(spacing: 4) {
                Image(systemName: "graduationcap.fill")
                    .font(.system(size: 10))
                Text("Schulen")
                    .font(Theme.Typography.badge)
                if showBerufsschulen {
                    Image(systemName: "xmark")
                        .font(.system(size: 8, weight: .bold))
                }
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(showBerufsschulen ? .orange : Theme.Colors.cardBackground)
            .foregroundStyle(showBerufsschulen ? .white : Theme.Colors.textPrimary)
            .clipShape(Capsule())
            .overlay(
                Capsule()
                    .stroke(showBerufsschulen ? .clear : Theme.Colors.textTertiary.opacity(0.3), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.08), radius: 2, y: 1)
        }
        .buttonStyle(.plain)
    }

    private var radiusChip: some View {
        let hasRadius = activeFilters?.radiusKm != nil
        return Menu {
            Button("5 km") { setRadius(5) }
            Button("10 km") { setRadius(10) }
            Button("15 km") { setRadius(15) }
            Button("25 km") { setRadius(25) }
            Button("50 km") { setRadius(50) }
            if hasRadius {
                Divider()
                Button("Entferne", role: .destructive) { setRadius(nil) }
            }
        } label: {
            HStack(spacing: 4) {
                Image(systemName: "location.circle")
                    .font(.system(size: 10))
                if let radius = activeFilters?.radiusKm {
                    Text("\(Int(radius)) km")
                        .font(Theme.Typography.badge)
                    Image(systemName: "xmark")
                        .font(.system(size: 8, weight: .bold))
                } else {
                    Text("Radius")
                        .font(Theme.Typography.badge)
                }
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(hasRadius ? Theme.Colors.primaryFallback : Theme.Colors.cardBackground)
            .foregroundStyle(hasRadius ? .white : Theme.Colors.textPrimary)
            .clipShape(Capsule())
            .overlay(
                Capsule()
                    .stroke(hasRadius ? .clear : Theme.Colors.textTertiary.opacity(0.3), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.08), radius: 2, y: 1)
        }
    }

    private func setRadius(_ km: Double?) {
        var filters = activeFilters ?? FeedFilters()
        filters.radiusKm = km
        activeFilters = filters
    }
}
