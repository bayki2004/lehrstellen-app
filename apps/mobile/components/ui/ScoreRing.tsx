import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontWeights } from '../../constants/theme';

interface ScoreRingProps {
  score: number;
  size?: number;
}

export default function ScoreRing({ score, size = 56 }: ScoreRingProps) {
  const getColor = () => {
    if (score >= 80) return colors.compatibilityHigh;
    if (score >= 60) return colors.compatibilityMedium;
    return colors.compatibilityLow;
  };

  const getLabel = () => {
    if (score >= 80) return 'Top';
    if (score >= 60) return 'Gut';
    return 'OK';
  };

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: getColor(),
        },
      ]}
    >
      <Text style={[styles.score, { color: getColor(), fontSize: size * 0.3 }]}>
        {score}%
      </Text>
      <Text style={[styles.label, { color: getColor(), fontSize: size * 0.16 }]}>
        {getLabel()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  score: {
    fontWeight: fontWeights.bold,
  },
  label: {
    fontWeight: fontWeights.medium,
    marginTop: -2,
  },
});
