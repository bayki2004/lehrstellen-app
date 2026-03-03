import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CULTURE_DIMENSIONS } from '@lehrstellen/shared';
import type { StudentProfileDTO, CultureScores } from '@lehrstellen/shared';
import api from '../../../../services/api';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../../../constants/theme';

const AVATAR_SIZE = 96;

const RIASEC_LABELS: { key: string; label: string; icon: string }[] = [
  { key: 'realistic', label: 'Praktisch', icon: '🔧' },
  { key: 'investigative', label: 'Analytisch', icon: '🔬' },
  { key: 'artistic', label: 'Kreativ', icon: '🎨' },
  { key: 'social', label: 'Sozial', icon: '🤝' },
  { key: 'enterprising', label: 'Unternehmerisch', icon: '📈' },
  { key: 'conventional', label: 'Strukturiert', icon: '📋' },
];

const OCEAN_LABELS: { key: string; label: string; icon: string }[] = [
  { key: 'openness', label: 'Offenheit', icon: '💡' },
  { key: 'conscientiousness', label: 'Gewissenhaftigkeit', icon: '✅' },
  { key: 'extraversion', label: 'Extraversion', icon: '🗣️' },
  { key: 'agreeableness', label: 'Verträglichkeit', icon: '🫶' },
  { key: 'neuroticism', label: 'Sensibilität', icon: '🌊' },
];

export default function ProfileViewScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfileDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<StudentProfileDTO>('/students/me')
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Profil konnte nöd glade werde.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${(profile.firstName || '')[0] || ''}${(profile.lastName || '')[0] || ''}`.toUpperCase();

  const age = Math.floor(
    (Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Mis Profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.location}>
            {age} Jahr{age !== 1 ? 'e' : ''} — {profile.city}, {profile.canton}
          </Text>
        </View>

        {/* Bio */}
        {profile.bio ? (
          <View style={styles.card}>
            <SectionTitle icon="person" title="Über mich" />
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        ) : null}

        {/* RIASEC scores */}
        {profile.quizCompleted ? (
          <View style={styles.card}>
            <SectionTitle icon="compass" title="Berufs-Interesse (RIASEC)" />
            {RIASEC_LABELS.map((item) => (
              <ScoreBar
                key={item.key}
                label={`${item.icon} ${item.label}`}
                value={Math.round(
                  (profile.riasecScores[item.key as keyof typeof profile.riasecScores] ?? 0) * 100,
                )}
                color={colors.primary}
              />
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <SectionTitle icon="compass" title="Berufs-Interesse (RIASEC)" />
            <EmptyState text="Quiz no nöd gmacht — mach's im Persönlichkeits-Quiz!" />
          </View>
        )}

        {/* OCEAN scores */}
        {profile.quizCompleted ? (
          <View style={styles.card}>
            <SectionTitle icon="sparkles" title="Persönlichkeit (OCEAN)" />
            {OCEAN_LABELS.map((item) => (
              <ScoreBar
                key={item.key}
                label={`${item.icon} ${item.label}`}
                value={Math.round(
                  (profile.oceanScores[item.key as keyof typeof profile.oceanScores] ?? 0) * 100,
                )}
                color={colors.radarUser}
              />
            ))}
          </View>
        ) : null}

        {/* Culture preferences (mandatory in onboarding — always available) */}
        <View style={styles.card}>
          <SectionTitle icon="layers" title="Kultur-Vorliebe" />
          {CULTURE_DIMENSIONS.map((dim) => {
            const val = profile.cultureScores?.[dim.key as keyof CultureScores] ?? 50;
            return (
              <View key={dim.key} style={styles.cultureDimRow}>
                <Text style={styles.cultureLabelLow}>{dim.labelLow}</Text>
                <View style={styles.cultureTrack}>
                  <View
                    style={[
                      styles.cultureThumb,
                      { left: `${Math.max(0, Math.min(100, val))}%` },
                    ]}
                  />
                </View>
                <Text style={styles.cultureLabelHigh}>{dim.labelHigh}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as any} size={20} color={colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.scoreBarRow}>
      <Text style={styles.scoreBarLabel}>{label}</Text>
      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            { width: `${Math.max(2, Math.min(100, value))}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.scoreBarValue}>{value}%</Text>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="lock-closed-outline" size={28} color={colors.textTertiary} />
      <Text style={styles.emptyStateText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },

  // Header bar
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 80,
  },

  // Profile header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: 34,
    fontWeight: fontWeights.bold,
  },
  name: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  location: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },

  // Bio
  bioText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Score bars (RIASEC / OCEAN)
  scoreBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
  },
  scoreBarLabel: {
    width: 140,
    fontSize: typography.bodySmall,
    color: colors.text,
  },
  scoreBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: 8,
    borderRadius: 4,
  },
  scoreBarValue: {
    width: 40,
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    color: colors.textSecondary,
    textAlign: 'right',
  },

  // Culture dimension bars
  cultureDimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cultureLabelLow: {
    width: 80,
    fontSize: typography.tiny,
    color: colors.textSecondary,
    textAlign: 'right',
    paddingRight: spacing.sm,
  },
  cultureTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 3,
    position: 'relative',
  },
  cultureThumb: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    marginLeft: -7,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  cultureLabelHigh: {
    width: 80,
    fontSize: typography.tiny,
    color: colors.textSecondary,
    paddingLeft: spacing.sm,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
