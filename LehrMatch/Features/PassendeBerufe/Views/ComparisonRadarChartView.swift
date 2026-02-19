import SwiftUI

struct ComparisonRadarChartView: View {
    let userValues: [Double]
    let berufValues: [Double]
    let labels: [String]

    private let userColor = Theme.Colors.primaryFallback
    private let berufColor = Color.orange

    var body: some View {
        VStack(spacing: Theme.Spacing.sm) {
            GeometryReader { geo in
                let center = CGPoint(x: geo.size.width / 2, y: geo.size.height / 2)
                let radius = min(geo.size.width, geo.size.height) / 2 - 30

                ZStack {
                    // Background web
                    ForEach([0.25, 0.5, 0.75, 1.0], id: \.self) { scale in
                        hexagonPath(center: center, radius: radius * scale)
                            .stroke(Theme.Colors.textTertiary.opacity(0.3), lineWidth: 0.5)
                    }

                    // Axis lines
                    ForEach(0..<6, id: \.self) { i in
                        let angle = angleFor(index: i)
                        let point = pointAt(center: center, radius: radius, angle: angle)
                        Path { path in
                            path.move(to: center)
                            path.addLine(to: point)
                        }
                        .stroke(Theme.Colors.textTertiary.opacity(0.2), lineWidth: 0.5)
                    }

                    // Beruf shape (behind)
                    valuePath(values: berufValues, center: center, radius: radius)
                        .fill(berufColor.opacity(0.15))
                    valuePath(values: berufValues, center: center, radius: radius)
                        .stroke(berufColor, lineWidth: 2)

                    // User shape (front)
                    valuePath(values: userValues, center: center, radius: radius)
                        .fill(userColor.opacity(0.15))
                    valuePath(values: userValues, center: center, radius: radius)
                        .stroke(userColor, lineWidth: 2)

                    // Dots
                    ForEach(0..<min(userValues.count, 6), id: \.self) { i in
                        let angle = angleFor(index: i)
                        let point = pointAt(center: center, radius: radius * userValues[i], angle: angle)
                        Circle()
                            .fill(userColor)
                            .frame(width: 6, height: 6)
                            .position(point)
                    }
                    ForEach(0..<min(berufValues.count, 6), id: \.self) { i in
                        let angle = angleFor(index: i)
                        let point = pointAt(center: center, radius: radius * berufValues[i], angle: angle)
                        Circle()
                            .fill(berufColor)
                            .frame(width: 6, height: 6)
                            .position(point)
                    }

                    // Labels
                    ForEach(0..<min(labels.count, 6), id: \.self) { i in
                        let angle = angleFor(index: i)
                        let labelPoint = pointAt(center: center, radius: radius + 20, angle: angle)
                        Text(labels[i])
                            .font(Theme.Typography.badge)
                            .foregroundStyle(Theme.Colors.textSecondary)
                            .position(labelPoint)
                    }
                }
            }
            .aspectRatio(1, contentMode: .fit)

            // Legend
            HStack(spacing: Theme.Spacing.lg) {
                HStack(spacing: Theme.Spacing.xs) {
                    Circle().fill(userColor).frame(width: 10, height: 10)
                    Text("Du").font(Theme.Typography.caption)
                }
                HStack(spacing: Theme.Spacing.xs) {
                    Circle().fill(berufColor).frame(width: 10, height: 10)
                    Text("Beruf").font(Theme.Typography.caption)
                }
            }
        }
    }

    private func angleFor(index: Int) -> Double {
        let slice = (2 * .pi) / 6.0
        return slice * Double(index) - .pi / 2
    }

    private func pointAt(center: CGPoint, radius: Double, angle: Double) -> CGPoint {
        CGPoint(
            x: center.x + radius * cos(angle),
            y: center.y + radius * sin(angle)
        )
    }

    private func hexagonPath(center: CGPoint, radius: Double) -> Path {
        Path { path in
            for i in 0..<6 {
                let angle = angleFor(index: i)
                let point = pointAt(center: center, radius: radius, angle: angle)
                if i == 0 { path.move(to: point) } else { path.addLine(to: point) }
            }
            path.closeSubpath()
        }
    }

    private func valuePath(values: [Double], center: CGPoint, radius: Double) -> Path {
        Path { path in
            for i in 0..<min(values.count, 6) {
                let angle = angleFor(index: i)
                let point = pointAt(center: center, radius: radius * max(values[i], 0.05), angle: angle)
                if i == 0 { path.move(to: point) } else { path.addLine(to: point) }
            }
            path.closeSubpath()
        }
    }
}
