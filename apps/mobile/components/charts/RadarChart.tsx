import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { colors } from '../../constants/theme';

interface Props {
  values: number[]; // 6 RIASEC values, 0-1
  labels: string[];
  size?: number;
  lineColor?: string;
  fillColor?: string;
  fillOpacity?: number;
}

export default function RadarChart({
  values,
  labels,
  size = 250,
  lineColor = colors.radarUser,
  fillColor = colors.radarUser,
  fillOpacity = 0.2,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 30;

  const angleFor = (index: number) => {
    const slice = (2 * Math.PI) / 6;
    return slice * index - Math.PI / 2;
  };

  const pointAt = (r: number, angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const hexagonPoints = (scale: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const p = pointAt(radius * scale, angleFor(i));
      return `${p.x},${p.y}`;
    }).join(' ');

  const valuePoints = values
    .slice(0, 6)
    .map((v, i) => {
      const p = pointAt(radius * Math.max(v, 0.05), angleFor(i));
      return `${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background web - 4 concentric hexagons */}
        {[0.25, 0.5, 0.75, 1.0].map((scale) => (
          <Polygon
            key={scale}
            points={hexagonPoints(scale)}
            fill="none"
            stroke={colors.radarGrid}
            strokeWidth={0.5}
          />
        ))}

        {/* Axis lines */}
        {Array.from({ length: 6 }, (_, i) => {
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

        {/* Value polygon fill */}
        <Polygon points={valuePoints} fill={fillColor} fillOpacity={fillOpacity} stroke="none" />

        {/* Value polygon stroke */}
        <Polygon points={valuePoints} fill="none" stroke={lineColor} strokeWidth={2} />

        {/* Value dots */}
        {values.slice(0, 6).map((v, i) => {
          const p = pointAt(radius * Math.max(v, 0.05), angleFor(i));
          return <Circle key={`dot-${i}`} cx={p.x} cy={p.y} r={4} fill={lineColor} />;
        })}

        {/* Labels */}
        {labels.slice(0, 6).map((label, i) => {
          const p = pointAt(radius + 20, angleFor(i));
          return (
            <SvgText
              key={`label-${i}`}
              x={p.x}
              y={p.y}
              fontSize={11}
              fill={colors.textSecondary}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});
