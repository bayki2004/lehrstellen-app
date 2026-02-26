import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, fontWeights, spacing } from '../../constants/theme';

const LABELS = [
  'Stimme nicht zu',
  '',
  'Neutral',
  '',
  'Stimme zu',
];

interface LikertScaleProps {
  value?: number;
  onSelect: (value: number) => void;
}

export default function LikertScale({ value, onSelect }: LikertScaleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.scaleRow}>
        {[1, 2, 3, 4, 5].map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.dot, value === v && styles.dotSelected]}
            onPress={() => onSelect(v)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dotText, value === v && styles.dotTextSelected]}>
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.labelText}>{LABELS[0]}</Text>
        <Text style={styles.labelText}>{LABELS[2]}</Text>
        <Text style={styles.labelText}>{LABELS[4]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  dot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  dotSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  dotText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.textSecondary,
  },
  dotTextSelected: {
    color: colors.white,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  labelText: {
    fontSize: typography.tiny,
    color: colors.textTertiary,
    textAlign: 'center',
    maxWidth: 80,
  },
});
