import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { colors, borderRadius, spacing, typography } from '../../constants/theme';
import type { ActivityTile } from '../../types/quiz.types';

interface Props {
  tile: ActivityTile;
  onToggle: (id: string) => void;
  disabled: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ActivityTileView({ tile, onToggle, disabled }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled && !tile.isSelected) return;
    scale.value = withSpring(0.9, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
    onToggle(tile.id);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.tile,
        tile.isSelected && styles.selected,
        disabled && !tile.isSelected && styles.disabled,
        animatedStyle,
      ]}
    >
      {tile.isSelected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
      <Text style={styles.icon}>{tile.icon}</Text>
      <Text style={[styles.label, tile.isSelected && styles.labelSelected]} numberOfLines={2}>
        {tile.label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    margin: '1%',
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  disabled: {
    opacity: 0.4,
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  icon: {
    fontSize: 28,
    marginBottom: 4,
  },
  label: {
    fontSize: typography.tiny,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 12,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
