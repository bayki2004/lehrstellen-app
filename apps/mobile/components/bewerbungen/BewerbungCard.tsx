import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../constants/theme';
import type { Bewerbung, BewerbungStatus } from '../../types/bewerbung.types';

interface Props {
  bewerbung: Bewerbung;
  onPress: () => void;
}

const STATUS_ICON_MAP: Record<BewerbungStatus, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  sent: { icon: 'paper-plane', color: colors.primary, label: 'Gesendet' },
  viewed: { icon: 'eye', color: colors.primary, label: 'Angesehen' },
  interview_invited: { icon: 'calendar', color: colors.success, label: 'Einladung' },
  schnupperlehre_scheduled: { icon: 'briefcase', color: colors.warning, label: 'Schnupperlehre' },
  offer: { icon: 'gift', color: colors.success, label: 'Angebot' },
  accepted: { icon: 'checkmark-circle', color: colors.success, label: 'Angenommen' },
  rejected: { icon: 'close-circle', color: colors.error, label: 'Abgesagt' },
  withdrawn: { icon: 'arrow-undo', color: colors.textTertiary, label: 'Zurückgezogen' },
};

export default function BewerbungCard({ bewerbung, onPress }: Props) {
  const initial = (bewerbung.companyName || '?').charAt(0).toUpperCase();
  const date = bewerbung.sentAt ? new Date(bewerbung.sentAt).toLocaleDateString('de-CH', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  const statusInfo = STATUS_ICON_MAP[bewerbung.status] ?? { icon: 'help-circle' as const, color: colors.textTertiary, label: 'Unbekannt' };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.avatar}
      >
        <Text style={styles.avatarText}>{initial}</Text>
      </LinearGradient>
      <View style={styles.info}>
        <Text style={styles.company} numberOfLines={1}>{bewerbung.companyName ?? 'Unbekannt'}</Text>
        <Text style={styles.beruf} numberOfLines={1}>{bewerbung.berufTitle ?? 'Lehrstelle'}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {bewerbung.canton ? `${bewerbung.canton} · ` : ''}{date}
        </Text>
      </View>
      <View style={styles.statusContainer}>
        <Ionicons name={statusInfo.icon} size={22} color={statusInfo.color} />
        <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: typography.h3, fontWeight: fontWeights.bold, color: colors.white },
  info: { flex: 1, marginRight: spacing.sm },
  company: { fontSize: typography.body, fontWeight: fontWeights.bold, color: colors.text },
  beruf: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 2 },
  meta: { fontSize: typography.caption, color: colors.textTertiary, marginTop: 2 },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  statusText: {
    fontSize: typography.tiny,
    fontWeight: fontWeights.medium,
    marginTop: 4,
    textAlign: 'center',
  },
});
