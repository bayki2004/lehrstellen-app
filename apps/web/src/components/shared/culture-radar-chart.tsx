'use client';

import { CULTURE_DIMENSIONS } from '@lehrstellen/shared';
import type { CultureScores } from '@lehrstellen/shared';
import * as Tooltip from '@radix-ui/react-tooltip';

const NUM_AXES = CULTURE_DIMENSIONS.length; // 8

const COLORS = {
  student: '#5A78F2',
  company: '#AEAEB2',
  grid: 'rgba(174, 174, 178, 0.3)',
  axis: 'rgba(174, 174, 178, 0.2)',
  warning: '#FF9500',
};

interface CultureRadarChartProps {
  studentScores: Partial<CultureScores>;
  companyScores: Partial<CultureScores>;
  size?: number;
  gapThreshold?: number;
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

export default function CultureRadarChart({
  studentScores,
  companyScores,
  size = 320,
  gapThreshold = 30,
}: CultureRadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 50; // room for labels

  const octagonPoints = (scale: number) =>
    Array.from({ length: NUM_AXES }, (_, i) => {
      const p = pointAt(cx, cy, radius * scale, angleFor(i));
      return `${p.x},${p.y}`;
    }).join(' ');

  const buildPolygon = (scores: Partial<CultureScores>) =>
    CULTURE_DIMENSIONS.map((dim, i) => {
      const val = scoreToFraction(scores[dim.key as keyof CultureScores]);
      const p = pointAt(cx, cy, radius * Math.max(val, 0.05), angleFor(i));
      return `${p.x},${p.y}`;
    }).join(' ');

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="flex flex-col items-center gap-3">
        <svg width={size} height={size} className="overflow-visible">
          {/* Concentric octagon grid */}
          {[0.25, 0.5, 0.75, 1.0].map((s) => (
            <polygon
              key={s}
              points={octagonPoints(s)}
              fill="none"
              stroke={COLORS.grid}
              strokeWidth={0.5}
            />
          ))}

          {/* Axis lines */}
          {Array.from({ length: NUM_AXES }, (_, i) => {
            const p = pointAt(cx, cy, radius, angleFor(i));
            return (
              <line
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
          <polygon
            points={buildPolygon(companyScores)}
            fill={COLORS.company}
            fillOpacity={0.15}
            stroke={COLORS.company}
            strokeWidth={1.5}
          />

          {/* Student polygon (blue, on top) */}
          <polygon
            points={buildPolygon(studentScores)}
            fill={COLORS.student}
            fillOpacity={0.2}
            stroke={COLORS.student}
            strokeWidth={2}
          />

          {/* Student dots */}
          {CULTURE_DIMENSIONS.map((dim, i) => {
            const val = scoreToFraction(studentScores[dim.key as keyof CultureScores]);
            const p = pointAt(cx, cy, radius * Math.max(val, 0.05), angleFor(i));
            return (
              <circle
                key={`dot-${i}`}
                cx={p.x}
                cy={p.y}
                r={3.5}
                fill={COLORS.student}
              />
            );
          })}

          {/* Axis labels with tooltips */}
          {CULTURE_DIMENSIONS.map((dim, i) => {
            const key = dim.key as keyof CultureScores;
            const sVal = studentScores[key] ?? 50;
            const cVal = companyScores[key] ?? 50;
            const delta = Math.abs(sVal - cVal);
            const hasWarning = delta > gapThreshold;

            const labelRadius = radius + 36;
            const p = pointAt(cx, cy, labelRadius, angleFor(i));

            return (
              <Tooltip.Root key={`lbl-${i}`}>
                <Tooltip.Trigger asChild>
                  <g className="cursor-pointer">
                    <text
                      x={p.x}
                      y={p.y}
                      fontSize={11}
                      fill={hasWarning ? COLORS.warning : '#636366'}
                      fontWeight={hasWarning ? 700 : 400}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {dim.icon} {dim.labelHigh}
                    </text>
                    {hasWarning && (
                      <text
                        x={p.x}
                        y={p.y + 14}
                        fontSize={11}
                        fill={COLORS.warning}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        ⚠
                      </text>
                    )}
                  </g>
                </Tooltip.Trigger>

                <Tooltip.Portal>
                  <Tooltip.Content
                    className="z-50 rounded-xl bg-white px-4 py-3 shadow-lg border border-gray-100 max-w-[260px]"
                    sideOffset={8}
                  >
                    <p className="text-sm font-semibold text-gray-900 mb-1.5">
                      {dim.labelLow} ↔ {dim.labelHigh}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-0.5">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS.student }}
                      />
                      Kandidat: {sVal}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS.company }}
                      />
                      Unternehmen: {cVal}
                    </div>
                    {hasWarning && (
                      <p className="text-xs text-amber-600 mt-2">
                        Grosse Lücke ({delta} Punkte): Der Kandidat bevorzugt «{sVal < 50 ? dim.labelLow : dim.labelHigh}», Ihr Unternehmen eher «{cVal < 50 ? dim.labelLow : dim.labelHigh}»
                      </p>
                    )}
                    <Tooltip.Arrow className="fill-white" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS.student }}
            />
            Kandidat
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS.company }}
            />
            Unternehmen
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
}
