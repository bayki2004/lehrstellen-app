import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import Button from '../../../../components/ui/Button';
import { useAuthStore } from '../../../../stores/auth.store';
import { useProfileBuilderStore } from '../../../../stores/profileBuilder.store';
import api from '../../../../services/api';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../../../constants/theme';
import type { StudentProfileDTO } from '@lehrstellen/shared';

const AVATAR_SIZE = 100;
const RING_SIZE = 112;
const RING_STROKE = 6;

export default function StudentProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { getCompletionPercentage, loadExisting } = useProfileBuilderStore();
  const [profile, setProfile] = useState<StudentProfileDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<StudentProfileDTO>('/students/me');
        setProfile(res.data);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    load();
    loadExisting().then(() => {
      setCompletion(getCompletionPercentage());
    });
  }, []);

  useEffect(() => {
    const unsubscribe = useProfileBuilderStore.subscribe(() => {
      setCompletion(useProfileBuilderStore.getState().getCompletionPercentage());
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    Alert.alert('Abmelden', 'Möchtest du dich wirklich abmelden?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Abmelden',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user?.email || '?';
  const initials = profile
    ? `${(profile.firstName || '')[0] || ''}${(profile.lastName || '')[0] || ''}`.toUpperCase()
    : (user?.email || '?')[0].toUpperCase();

  // SVG ring calculations
  const ringRadius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const completionOffset = circumference * (1 - completion / 100);

  const completionColor = completion >= 80 ? colors.success : colors.warning;

  // Stats
  const interestsCount = (profile as any)?.desiredFields?.length || 0;
  const skillsCount = (profile as any)?.skills?.length || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.headerTitle}>Profil</Text>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile header with ring around avatar (matches SwiftUI ProfileView) */}
        <View style={styles.profileHeader}>
          {/* Completeness ring + avatar */}
          <View style={styles.ringContainer}>
            <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
              {/* Background ring */}
              <SvgCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={ringRadius}
                stroke={colors.textTertiary + '33'}
                strokeWidth={RING_STROKE}
                fill="none"
              />
              {/* Progress ring */}
              <SvgCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={ringRadius}
                stroke={completionColor}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={completionOffset}
                rotation="-90"
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          </View>

          <Text style={styles.name}>{fullName}</Text>

          {profile?.canton && (
            <Text style={styles.ageLocation}>
              {(profile as any).age ? `${(profile as any).age} Jahre, ` : ''}
              {profile.canton}
            </Text>
          )}

          {(profile as any)?.schoolName && (
            <Text style={styles.school}>{(profile as any).schoolName}</Text>
          )}

          <Text style={[styles.completionText, { color: completionColor }]}>
            Profil {completion}% vollständig
          </Text>

          <Pressable
            style={styles.editButton}
            onPress={() => router.push('/(app)/(student)/profile/builder')}
          >
            <Text style={styles.editButtonText}>Profil bearbeiten</Text>
          </Pressable>
        </View>

        {/* Stats row (matches SwiftUI statsSection) */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{interestsCount}</Text>
            <Text style={styles.statLabel}>Interessen</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{skillsCount}</Text>
            <Text style={styles.statLabel}>Skills</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Schnupper-{'\n'}lehren</Text>
          </View>
        </View>

        {/* Menu section (matches SwiftUI menuSection) */}
        <View style={styles.menuCard}>
          <MenuItem
            icon="document-text"
            iconColor={colors.primary}
            title="Bewerbungsprofil"
            onPress={() => router.push('/(app)/(student)/profile/builder')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="sparkles"
            iconColor="#AF52DE"
            title="Persönlichkeitsprofil"
            onPress={() => router.push('/(app)/(student)/berufe/quiz')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="briefcase"
            iconColor={colors.warning}
            title="Schnupperlehren"
            onPress={() => router.push('/(app)/(student)/bewerbungen/')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="settings"
            iconColor={colors.textTertiary}
            title="Einstellungen"
            onPress={() => router.push('/(app)/(student)/profile/einstellungen')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  iconColor,
  title,
  onPress,
}: {
  icon: string;
  iconColor: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon as any} size={22} color={iconColor} style={styles.menuIcon} />
      <Text style={styles.menuTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </Pressable>
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
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    textAlign: 'center',
    paddingVertical: spacing.sm + 2,
  },
  content: {
    paddingBottom: 64,
  },

  // Profile header
  profileHeader: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  ringSvg: {
    position: 'absolute',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 36,
    fontWeight: fontWeights.bold,
  },
  name: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  ageLocation: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  school: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  completionText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.medium,
    marginTop: spacing.sm,
  },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.sm + 4,
    marginTop: spacing.md,
    ...shadows.card,
  },
  editButtonText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.white,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // Menu
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    ...shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuIcon: {
    width: 32,
    textAlign: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    marginLeft: spacing.md,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 56,
  },
});
