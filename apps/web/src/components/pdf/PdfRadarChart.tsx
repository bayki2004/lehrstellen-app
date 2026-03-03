import { Svg, Polygon, Line, Circle, G, Text as SvgText } from '@react-pdf/renderer';
import { CULTURE_DIMENSIONS } from '@lehrstellen/shared';
import type { CultureScores } from '@lehrstellen/shared';

const NUM_AXES = CULTURE_DIMENSIONS.length; // 8

const COLORS = {
  student: '#00C2FF',
  company: '#AEAEB2',
  grid: 'rgba(174, 174, 178, 0.3)',
  axis: 'rgba(174, 174, 178, 0.2)',
};

interface PdfRadarChartProps {
  studentScores: Partial<CultureScores>;
  companyScores: Partial<CultureScores>;
  size?: number;
}

function angleFor(index: number) {
  return ((2 * Math.PI) / NUM_AXES) * index - Math.PI / 2;
}

function pointAt(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function scoreToFraction(score: number | null | undefined): number {
  return (score ?? 50) / 100;
}

function buildPolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  scores: Partial<CultureScores>,
) {
  return CULTURE_DIMENSIONS.map((dim, i) => {
    const val = scoreToFraction(scores[dim.key as keyof CultureScores]);
    const p = pointAt(cx, cy, radius * Math.max(val, 0.05), angleFor(i));
    return `${p.x},${p.y}`;
  }).join(' ');
}

function octagonPoints(cx: number, cy: number, radius: number, scale: number) {
  return Array.from({ length: NUM_AXES }, (_, i) => {
    const p = pointAt(cx, cy, radius * scale, angleFor(i));
    return `${p.x},${p.y}`;
  }).join(' ');
}

export default function PdfRadarChart({
  studentScores,
  companyScores,
  size = 200,
}: PdfRadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 32;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Concentric octagon grid */}
      {[0.25, 0.5, 0.75, 1.0].map((s) => (
        <Polygon
          key={String(s)}
          points={octagonPoints(cx, cy, radius, s)}
          fill="none"
          stroke={COLORS.grid}
          strokeWidth={0.5}
        />
      ))}

      {/* Axis lines */}
      {Array.from({ length: NUM_AXES }, (_, i) => {
        const p = pointAt(cx, cy, radius, angleFor(i));
        return (
          <Line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke={COLORS.axis}
            strokeWidth={0.5}
          />
        );
      })}

      {/* Company polygon (gray, behind) */}
      <Polygon
        points={buildPolygonPoints(cx, cy, radius, companyScores)}
        fill={COLORS.company}
        fillOpacity={0.15}
        stroke={COLORS.company}
        strokeWidth={1}
      />

      {/* Student polygon (cyan, on top) */}
      <Polygon
        points={buildPolygonPoints(cx, cy, radius, studentScores)}
        fill={COLORS.student}
        fillOpacity={0.2}
        stroke={COLORS.student}
        strokeWidth={1.5}
      />

      {/* Student dots */}
      {CULTURE_DIMENSIONS.map((dim, i) => {
        const val = scoreToFraction(studentScores[dim.key as keyof CultureScores]);
        const p = pointAt(cx, cy, radius * Math.max(val, 0.05), angleFor(i));
        return (
          <Circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r={2.5}
            fill={COLORS.student}
          />
        );
      })}

      {/* Axis labels */}
      {CULTURE_DIMENSIONS.map((dim, i) => {
        const labelRadius = radius + 22;
        const p = pointAt(cx, cy, labelRadius, angleFor(i));
        return (
          <G key={`lbl-${i}`}>
            <SvgText
              x={p.x}
              y={p.y}
              style={{ fontSize: 6, fill: '#636366', textAnchor: 'middle' } as any}
            >
              {dim.labelHigh}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}
