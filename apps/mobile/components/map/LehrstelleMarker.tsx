import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ListingDTO } from '@lehrstellen/shared';
import { shadows } from '../../constants/theme';

interface Props {
  listing: ListingDTO;
  categoryColor: string;
  onPress: () => void;
}

let MarkerComponent: any = null;
try {
  const maps = require('react-native-maps');
  MarkerComponent = maps.Marker;
} catch {}

/**
 * A colored circle marker for a Lehrstelle on the map.
 * The color is derived from the career category via getCategoryColor().
 */
export default function LehrstelleMarker({
  listing,
  categoryColor,
  onPress,
}: Props) {
  if (!MarkerComponent) return null;

  return (
    <MarkerComponent
      coordinate={{
        latitude: (listing as any)._lat ?? 0,
        longitude: (listing as any)._lng ?? 0,
      }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={[styles.outerRing, { borderColor: categoryColor }]}>
        <View style={[styles.innerDot, { backgroundColor: categoryColor }]} />
      </View>
    </MarkerComponent>
  );
}

const styles = StyleSheet.create({
  outerRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  innerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
