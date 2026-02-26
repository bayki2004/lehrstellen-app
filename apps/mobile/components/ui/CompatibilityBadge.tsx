import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontWeights } from '../../constants/theme';

interface CompatibilityBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function CompatibilityBadge({ score: rawScore, size = 'md' }: CompatibilityBadgeProps) {
  const score = rawScore || 0;
  const badgeColor = score >= 75 ? colors.compatibilityHigh
    : score >= 50 ? colors.compatibilityMedium
    : colors.compatibilityLow;

  // Lighter variant for gradient effect (matches SwiftUI .gradient modifier)
  const badgeColorLight = score >= 75 ? '#5CD97A'
    : score >= 50 ? '#FFB733'
    : '#FF6B61';

  const fontSize = size === 'sm' ? 10 : size === 'md' ? 12 : 15;
  const paddingH = size === 'sm' ? 8 : size === 'md' ? 12 : 16;
  const paddingV = size === 'sm' ? 4 : size === 'md' ? 6 : 8;

  return (
    <LinearGradient
      colors={[badgeColor, badgeColorLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.badge,
        { paddingHorizontal: paddingH, paddingVertical: paddingV },
      ]}
    >
      <Text style={[styles.text, { fontSize }]}>✨</Text>
      <Text style={[styles.text, { fontSize }]}>{Math.round(score)}% Match</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontWeight: fontWeights.bold,
    color: '#FFFFFF',
  },
});
