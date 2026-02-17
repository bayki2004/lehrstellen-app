import SwiftUI

struct RadarChartView: View {
    let values: [Double] // 6 RIASEC values, 0-1
    let labels: [String]
    var blurAmount: Double = 0 // 0 = clear, 20 = fully blurred

    private let lineColor = Theme.Colors.primaryFallback
    private let fillColor = Theme.Colors.primaryFallback.opacity(0.2)

    var body: some View {
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

                // Value shape
                valuePath(center: center, radius: radius)
                    .fill(fillColor)
                valuePath(center: center, radius: radius)
                    .stroke(lineColor, lineWidth: 2)

                // Value dots
                ForEach(0..<min(values.count, 6), id: \.self) { i in
                    let angle = angleFor(index: i)
                    let point = pointAt(center: center, radius: radius * values[i], angle: angle)
                    Circle()
                        .fill(lineColor)
                        .frame(width: 8, height: 8)
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
            .blur(radius: blurAmount)
        }
        .aspectRatio(1, contentMode: .fit)
    }

    private func angleFor(index: Int) -> Double {
        let slice = (2 * .pi) / 6.0
        return slice * Double(index) - .pi / 2 // Start from top
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
                if i == 0 {
                    path.move(to: point)
                } else {
                    path.addLine(to: point)
                }
            }
            path.closeSubpath()
        }
    }

    private func valuePath(center: CGPoint, radius: Double) -> Path {
        Path { path in
            for i in 0..<min(values.count, 6) {
                let angle = angleFor(index: i)
                let point = pointAt(center: center, radius: radius * max(values[i], 0.05), angle: angle)
                if i == 0 {
                    path.move(to: point)
                } else {
                    path.addLine(to: point)
                }
            }
            path.closeSubpath()
        }
    }
}
