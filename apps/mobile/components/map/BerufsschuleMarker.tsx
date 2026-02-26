import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MAP_SCHOOL_COLOR } from '../../constants/mapCategories';
import { shadows } from '../../constants/theme';
import type { Berufsschule } from '../../types/beruf.types';

interface Props {
  school: Berufsschule;
  onPress: () => void;
}

let MarkerComponent: any = null;
try {
  const maps = require('react-native-maps');
  MarkerComponent = maps.Marker;
} catch {}

/**
 * An orange graduation-cap marker for a Berufsschule on the map.
 */
export default function BerufsschuleMarker({ school, onPress }: Props) {
  if (!MarkerComponent) return null;

  return (
    <MarkerComponent
      coordinate={{
        latitude: (school as any)._lat ?? school.lat ?? 0,
        longitude: (school as any)._lng ?? school.lng ?? 0,
      }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={styles.marker}>
        <Text style={styles.emoji}>🎓</Text>
      </View>
    </MarkerComponent>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MAP_SCHOOL_COLOR + '25',
    borderWidth: 2.5,
    borderColor: MAP_SCHOOL_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  emoji: {
    fontSize: 14,
  },
});
