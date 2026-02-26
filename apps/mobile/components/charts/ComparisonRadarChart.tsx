import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { colors, spacing, typography, fontWeights } from '../../constants/theme';

interface Props {
  userValues: number[];
  berufValues: number[];
  labels: string[];
  size?: number;
}

export default function ComparisonRadarChart({ userValues, berufValues, labels, size = 250 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 30;

  const angleFor = (index: number) => ((2 * Math.PI) / 6) * index - Math.PI / 2;
  const pointAt = (r: number, angle: number) => ({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });

  const hexagonPoints = (scale: number) =>
    Array.from({ length: 6 }, (_, i) => { const p = pointAt(radius * scale, angleFor(i)); return `${p.x},${p.y}`; }).join(' ');

  const toPoints = (vals: number[]) =>
    vals.slice(0, 6).map((v, i) => { const p = pointAt(radius * Math.max(v, 0.05), angleFor(i)); return `${p.x},${p.y}`; }).join(' ');

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {[0.25, 0.5, 0.75, 1.0].map((s) => (<Polygon key={s} points={hexagonPoints(s)} fill="none" stroke={colors.radarGrid} strokeWidth={0.5} />))}
        {Array.from({ length: 6 }, (_, i) => { const p = pointAt(radius, angleFor(i)); return (<Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={colors.radarAxis} strokeWidth={0.5} />); })}

        {/* Beruf polygon (orange, behind) */}
        <Polygon points={toPoints(berufValues)} fill={colors.radarBeruf} fillOpacity={0.15} stroke={colors.radarBeruf} strokeWidth={2} />

        {/* User polygon (blue, on top) */}
        <Polygon points={toPoints(userValues)} fill={colors.radarUser} fillOpacity={0.2} stroke={colors.radarUser} strokeWidth={2} />

        {/* User dots */}
        {userValues.slice(0, 6).map((v, i) => { const p = pointAt(radius * Math.max(v, 0.05), angleFor(i)); return (<Circle key={`u${i}`} cx={p.x} cy={p.y} r={4} fill={colors.radarUser} />); })}

        {/* Labels */}
        {labels.slice(0, 6).map((label, i) => { const p = pointAt(radius + 20, angleFor(i)); return (<SvgText key={i} x={p.x} y={p.y} fontSize={11} fill={colors.textSecondary} textAnchor="middle" alignmentBaseline="middle">{label}</SvgText>); })}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.radarUser }]} />
          <Text style={styles.legendLabel}>Du</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.radarBeruf }]} />
          <Text style={styles.legendLabel}>Beruf</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  legend: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: typography.bodySmall, color: colors.textSecondary, fontWeight: fontWeights.medium },
});
