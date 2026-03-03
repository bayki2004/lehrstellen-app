import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../../../constants/theme';

const DOC_TYPES = [
  {
    key: 'zeugnis' as const,
    icon: '📄',
    title: 'Zeugnis',
    subtitle: 'Schuelnote (1-6)',
    route: '/(app)/(student)/grades/manual-zeugnis',
  },
  {
    key: 'multicheck' as const,
    icon: '📊',
    title: 'Multicheck / Basic-Check',
    subtitle: 'Eignigstest-Ergebnis',
    route: '/(app)/(student)/grades/manual-multicheck',
  },
];

export default function ChooseTypeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Was wetsch erfasse?</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {DOC_TYPES.map((type) => (
          <Pressable
            key={type.key}
            style={styles.card}
            onPress={() => router.push(type.route as any)}
          >
            <Text style={styles.cardIcon}>{type.icon}</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{type.title}</Text>
              <Text style={styles.cardSubtitle}>{type.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  cardIcon: {
    fontSize: 32,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
