import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { borderRadius, spacing, typography, fontWeights } from '../../constants/theme';
import { BEWERBUNG_STATUS_CONFIG, type BewerbungStatus } from '../../types/bewerbung.types';

interface Props {
  status: BewerbungStatus;
}

const FALLBACK_CONFIG = { displayName: 'Unbekannt', icon: '❓', color: '#AEAEB2', isActive: false };

export default function BewerbungStatusBadge({ status }: Props) {
  const config = BEWERBUNG_STATUS_CONFIG[status] ?? FALLBACK_CONFIG;
  return (
    <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={[styles.label, { color: config.color }]}>{config.displayName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  icon: { fontSize: 14 },
  label: { fontSize: typography.caption, fontWeight: fontWeights.semiBold },
});
