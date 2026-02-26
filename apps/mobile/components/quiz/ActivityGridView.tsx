import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ActivityTileView from './ActivityTileView';
import { colors, typography, spacing, fontWeights } from '../../constants/theme';
import type { ActivityTile } from '../../types/quiz.types';

interface Props {
  tiles: ActivityTile[];
  onToggle: (id: string) => void;
  requiredPicks: number;
  selectedCount: number;
  title: string;
  subtitle: string;
}

export default function ActivityGridView({ tiles, onToggle, requiredPicks, selectedCount, title, subtitle }: Props) {
  const maxReached = selectedCount >= requiredPicks;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Text style={styles.counter}>
        {selectedCount} / {requiredPicks} gewählt
      </Text>
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <ActivityTileView
            key={tile.id}
            tile={tile}
            onToggle={onToggle}
            disabled={maxReached}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  counter: {
    fontSize: typography.bodySmall,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
