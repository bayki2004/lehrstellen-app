import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, typography, fontWeights, spacing } from '../../constants/theme';

interface CultureSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  labelLow: string;
  labelHigh: string;
  icon: string;
  isDealbreaker: boolean;
  onDealbreakerToggle: (value: boolean) => void;
}

export default function CultureSlider({
  value,
  onValueChange,
  labelLow,
  labelHigh,
  icon,
  isDealbreaker,
  onDealbreakerToggle,
}: CultureSliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.value}>{Math.round(value)}</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.borderLight}
        thumbTintColor={colors.primary}
      />

      <View style={styles.labels}>
        <Text style={styles.labelLow}>{labelLow}</Text>
        <Text style={styles.labelHigh}>{labelHigh}</Text>
      </View>

      <View style={styles.dealbreakerRow}>
        <Text
          style={[
            styles.dealbreakerLabel,
            isDealbreaker && styles.dealbreakerLabelActive,
          ]}
        >
          Dealbreaker
        </Text>
        <Switch
          value={isDealbreaker}
          onValueChange={onDealbreakerToggle}
          trackColor={{ false: colors.borderLight, true: colors.error + '60' }}
          thumbColor={isDealbreaker ? colors.error : '#f4f3f4'}
          ios_backgroundColor={colors.borderLight}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 20,
  },
  value: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.primary,
    minWidth: 30,
    textAlign: 'right',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  labelLow: {
    fontSize: 11,
    color: colors.textTertiary,
    flex: 1,
  },
  labelHigh: {
    fontSize: 11,
    color: colors.textTertiary,
    flex: 1,
    textAlign: 'right',
  },
  dealbreakerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  dealbreakerLabel: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.textTertiary,
  },
  dealbreakerLabelActive: {
    color: colors.error,
    fontWeight: fontWeights.semiBold,
  },
});
