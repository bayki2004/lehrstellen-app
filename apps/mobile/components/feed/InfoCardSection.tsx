import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { InfoCard } from '@lehrstellen/shared';
import {
  colors,
  typography,
  fontWeights,
  spacing,
  borderRadius,
  shadows,
} from '../../constants/theme';

interface InfoCardSectionProps {
  cards?: InfoCard[];
}

export default function InfoCardSection({ cards }: InfoCardSectionProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <>
      {cards.map((card, index) => (
        <View key={`${card.type}-${index}`} style={styles.card}>
          <View style={styles.headerRow}>
            {card.icon ? <Text style={styles.icon}>{card.icon}</Text> : null}
            <Text style={styles.title}>{card.title}</Text>
          </View>
          {card.items.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bullet}>{'\u2022'}</Text>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  bullet: {
    fontSize: typography.body,
    color: colors.primary,
    marginRight: spacing.sm,
    lineHeight: 22,
  },
  itemText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    flex: 1,
  },
});
