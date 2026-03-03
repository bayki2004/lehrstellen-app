'use client';

import { useCulturePresets } from '@/hooks/use-culture-presets';
import { CULTURE_DIMENSIONS } from '@lehrstellen/shared';
import type { CultureScores, CultureDealbreakers } from '@lehrstellen/shared';

interface CultureProfileSectionProps {
  isEditing: boolean;
  cultureScores: Partial<CultureScores>;
  onCultureChange: (scores: Partial<CultureScores>) => void;
  dealbreakers: Partial<CultureDealbreakers>;
  onDealbreakersChange: (dealbreakers: Partial<CultureDealbreakers>) => void;
  presetId: string | undefined;
  onPresetChange: (presetId: string | undefined) => void;
}

export default function CultureProfileSection({
  isEditing,
  cultureScores,
  onCultureChange,
  dealbreakers,
  onDealbreakersChange,
  presetId,
  onPresetChange,
}: CultureProfileSectionProps) {
  const { data: presets } = useCulturePresets();

  const hasCultureData = CULTURE_DIMENSIONS.some(
    (d) => cultureScores[d.key] != null,
  );

  const handlePresetSelect = (id: string) => {
    const preset = presets?.find((p) => p.id === id);
    if (!preset) return;
    onPresetChange(id);
    onCultureChange({ ...preset.cultureScores });
  };

  const handleSliderChange = (key: keyof CultureScores, value: number) => {
    onCultureChange({ ...cultureScores, [key]: value });
    if (presetId) onPresetChange(undefined);
  };

  const handleDealbreakerToggle = (key: keyof CultureDealbreakers) => {
    onDealbreakersChange({
      ...dealbreakers,
      [key]: !dealbreakers[key],
    });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h3 className="text-[15px] font-semibold text-text mb-4">
        Unternehmenskultur
      </h3>

      {isEditing ? (
        <div className="space-y-6">
          {/* Preset selector */}
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-text-secondary">
              Branchenvorlage
            </label>
            <select
              value={presetId || ''}
              onChange={(e) => {
                if (e.target.value) handlePresetSelect(e.target.value);
                else onPresetChange(undefined);
              }}
              className="w-full rounded-xl border border-border-light bg-background/50 px-4 py-2.5 text-[14px] text-text outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
            >
              <option value="">— Keine Vorlage —</option>
              {presets?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          <div className="space-y-5">
            {CULTURE_DIMENSIONS.map((dim) => {
              const value = cultureScores[dim.key] ?? 50;
              const isBreaker = dealbreakers[dim.key] ?? false;

              return (
                <div key={dim.key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-medium text-text">
                      {dim.icon} {dim.labelLow} — {dim.labelHigh}
                    </span>
                    <span className="text-[12px] font-semibold text-primary tabular-nums">
                      {value}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={value}
                    onChange={(e) =>
                      handleSliderChange(dim.key, Number(e.target.value))
                    }
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border-light accent-primary"
                  />

                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-text-tertiary">
                      {dim.labelLow}
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isBreaker}
                        onChange={() => handleDealbreakerToggle(dim.key)}
                        className="h-3.5 w-3.5 rounded border-border accent-error cursor-pointer"
                      />
                      <span
                        className={`text-[11px] font-medium ${
                          isBreaker ? 'text-error' : 'text-text-tertiary'
                        }`}
                      >
                        Dealbreaker
                      </span>
                    </label>
                    <span className="text-[11px] text-text-tertiary">
                      {dim.labelHigh}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : hasCultureData ? (
        <div className="space-y-3.5">
          {CULTURE_DIMENSIONS.map((dim) => {
            const value = cultureScores[dim.key];
            if (value == null) return null;
            const isBreaker = dealbreakers[dim.key] ?? false;

            return (
              <div key={dim.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-text-secondary">
                    {dim.icon} {dim.labelLow}
                  </span>
                  <div className="flex items-center gap-2">
                    {isBreaker && (
                      <span className="text-[10px] font-semibold text-error bg-error-light px-1.5 py-0.5 rounded-md">
                        Dealbreaker
                      </span>
                    )}
                    <span className="text-[12px] text-text-secondary">
                      {dim.labelHigh}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-background overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[13px] text-text-tertiary">
          Noch keine Unternehmenskultur definiert. Klicken Sie auf
          &quot;Bearbeiten&quot;, um Ihre Kultur festzulegen.
        </p>
      )}
    </div>
  );
}
