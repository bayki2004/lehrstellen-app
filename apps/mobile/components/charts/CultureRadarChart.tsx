import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { CULTURE_DIMENSIONS } from '@lehrstellen/shared';
import type { CultureScores } from '@lehrstellen/shared';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../constants/theme';

const NUM_AXES = CULTURE_DIMENSIONS.length; // 8

interface Props {
  studentScores: CultureScores;
  companyScores: CultureScores;
  size?: number;
  gapThreshold?: number;
}

interface TooltipData {
  label: string;
  labelLow: string;
  labelHigh: string;
  studentScore: number;
  companyScore: number;
  delta: number;
}

export default function CultureRadarChart({
  studentScores,
  companyScores,
  size = 280,
  gapThreshold = 30,
}: Props) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40; // extra padding for labels + icons

  const angleFor = (index: number) =>
    ((2 * Math.PI) / NUM_AXES) * index - Math.PI / 2;

  const pointAt = (r: number, angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const octagonPoints = (scale: number) =>
    Array.from({ length: NUM_AXES }, (_, i) => {
      const p = pointAt(radius * scale, angleFor(i));
      return `${p.x},${p.y}`;
    }).join(' ');

  const scoreToRadius = (score: number | null) => (score ?? 50) / 100;

  const toPoints = (scores: CultureScores) =>
    CULTURE_DIMENSIONS.map((dim, i) => {
      const val = scoreToRadius(scores[dim.key as keyof CultureScores]);
      const p = pointAt(radius * Math.max(val, 0.05), angleFor(i));
      return `${p.x},${p.y}`;
    }).join(' ');

  const getDelta = (dim: (typeof CULTURE_DIMENSIONS)[number]) => {
    const key = dim.key as keyof CultureScores;
    const s = studentScores[key] ?? 50;
    const c = companyScores[key] ?? 50;
    return Math.abs(s - c);
  };

  const handleLabelPress = (dim: (typeof CULTURE_DIMENSIONS)[number]) => {
    const key = dim.key as keyof CultureScores;
    const s = studentScores[key] ?? 50;
    const c = companyScores[key] ?? 50;
    setTooltip({
      label: `${dim.labelLow} ↔ ${dim.labelHigh}`,
      labelLow: dim.labelLow,
      labelHigh: dim.labelHigh,
      studentScore: s,
      companyScore: c,
      delta: Math.abs(s - c),
    });
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Concentric octagon grid */}
        {[0.25, 0.5, 0.75, 1.0].map((s) => (
          <Polygon
            key={s}
            points={octagonPoints(s)}
            fill="none"
            stroke={colors.radarGrid}
            strokeWidth={0.5}
          />
        ))}

        {/* Axis lines */}
        {Array.from({ length: NUM_AXES }, (_, i) => {
          const p = pointAt(radius, angleFor(i));
          return (
            <Line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke={colors.radarAxis}
              strokeWidth={0.5}
            />
          );
        })}

        {/* Company polygon (gray, behind) */}
        <Polygon
          points={toPoints(companyScores)}
          fill={colors.textTertiary}
          fillOpacity={0.15}
          stroke={colors.textTertiary}
          strokeWidth={1.5}
        />

        {/* Student polygon (blue, on top) */}
        <Polygon
          points={toPoints(studentScores)}
          fill={colors.radarUser}
          fillOpacity={0.2}
          stroke={colors.radarUser}
          strokeWidth={2}
        />

        {/* Student dots */}
        {CULTURE_DIMENSIONS.map((dim, i) => {
          const val = scoreToRadius(studentScores[dim.key as keyof CultureScores]);
          const p = pointAt(radius * Math.max(val, 0.05), angleFor(i));
          return (
            <Circle
              key={`dot-${i}`}
              cx={p.x}
              cy={p.y}
              r={3.5}
              fill={colors.radarUser}
            />
          );
        })}

        {/* Axis labels + warning icons */}
        {CULTURE_DIMENSIONS.map((dim, i) => {
          const labelRadius = radius + 28;
          const p = pointAt(labelRadius, angleFor(i));
          const delta = getDelta(dim);
          const hasWarning = delta > gapThreshold;

          return (
            <React.Fragment key={`lbl-${i}`}>
              <SvgText
                x={p.x}
                y={p.y}
                fontSize={10}
                fill={hasWarning ? colors.warning : colors.textSecondary}
                fontWeight={hasWarning ? '700' : '400'}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {dim.icon} {dim.labelHigh}
              </SvgText>
              {hasWarning && (
                <SvgText
                  x={p.x}
                  y={p.y + 12}
                  fontSize={10}
                  fill={colors.warning}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  ⚠️
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Pressable overlay labels for tap-to-tooltip */}
      {CULTURE_DIMENSIONS.map((dim, i) => {
        const labelRadius = radius + 28;
        const p = pointAt(labelRadius, angleFor(i));
        const hitSize = 60;
        return (
          <Pressable
            key={`press-${i}`}
            onPress={() => handleLabelPress(dim)}
            style={{
              position: 'absolute',
              left: p.x - hitSize / 2,
              top: p.y - hitSize / 2,
              width: hitSize,
              height: hitSize,
            }}
            hitSlop={8}
          />
        );
      })}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.radarUser }]} />
          <Text style={styles.legendLabel}>Du</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.textTertiary }]} />
          <Text style={styles.legendLabel}>Firma</Text>
        </View>
      </View>

      {/* Tooltip Modal */}
      <Modal
        visible={tooltip !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setTooltip(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setTooltip(null)}>
          <View style={styles.tooltipCard}>
            <Text style={styles.tooltipTitle}>{tooltip?.label}</Text>
            <View style={styles.tooltipRow}>
              <View style={[styles.tooltipDot, { backgroundColor: colors.radarUser }]} />
              <Text style={styles.tooltipScore}>Du: {tooltip?.studentScore}</Text>
            </View>
            <View style={styles.tooltipRow}>
              <View style={[styles.tooltipDot, { backgroundColor: colors.textTertiary }]} />
              <Text style={styles.tooltipScore}>Firma: {tooltip?.companyScore}</Text>
            </View>
            {tooltip && tooltip.delta > gapThreshold && (
              <Text style={styles.tooltipWarning}>
                Grosse Lücke ({tooltip.delta} Punkt{tooltip.delta !== 1 ? 'e' : ''}): Du bisch meh «{tooltip.studentScore < 50 ? tooltip.labelLow : tooltip.labelHigh}», d'Firma eher «{tooltip.companyScore < 50 ? tooltip.labelLow : tooltip.labelHigh}»
              </Text>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  tooltipCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 320,
  },
  tooltipTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  tooltipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tooltipScore: {
    fontSize: typography.body,
    color: colors.text,
  },
  tooltipWarning: {
    fontSize: typography.bodySmall,
    color: colors.warning,
    marginTop: spacing.md,
    lineHeight: 20,
  },
});
