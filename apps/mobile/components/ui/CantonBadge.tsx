import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CANTON_DATA } from '../../constants/cantonWappen';
import { fontWeights } from '../../constants/theme';

interface CantonBadgeProps {
  /** Two-letter canton code (e.g. "ZH", "BE") */
  code: string;
  /** Diameter of the circular badge in pixels. Default: 24 */
  size?: number;
}

/**
 * A small circular badge showing the canton's official heraldic color
 * with the two-letter canton code overlaid in the appropriate text color.
 */
export default function CantonBadge({ code, size = 24 }: CantonBadgeProps) {
  const data = CANTON_DATA[code];
  const bgColor = data?.color ?? '#AEAEB2';
  const txtColor = data?.textColor ?? '#FFFFFF';

  // Scale font size relative to badge size
  const fontSize = Math.round(size * 0.42);

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text
        style={[
          styles.code,
          {
            fontSize,
            color: txtColor,
          },
        ]}
        numberOfLines={1}
      >
        {code}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  code: {
    fontWeight: fontWeights.bold,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
