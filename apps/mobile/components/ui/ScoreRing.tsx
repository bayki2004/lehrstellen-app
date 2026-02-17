import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreRingProps {
  score: number;
  size?: number;
}

export default function ScoreRing({ score, size = 56 }: ScoreRingProps) {
  const getColor = () => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    return '#FF6B35';
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
    backgroundColor: '#FFFFFF',
  },
  score: {
    fontWeight: '700',
  },
  label: {
    fontWeight: '500',
    marginTop: -2,
  },
});
