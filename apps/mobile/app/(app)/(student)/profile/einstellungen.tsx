import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../../stores/auth.store';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../../../constants/theme';

export default function EinstellungenScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Text style={styles.backText}>Zurück</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Einstellungen</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Account Section */}
        <Text style={styles.sectionHeader}>ACCOUNT</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>E-Mail</Text>
            <Text style={styles.rowValue} numberOfLines={1}>{user?.email || '–'}</Text>
          </View>
        </View>

        {/* App Section */}
        <Text style={styles.sectionHeader}>APP</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Benachrichtigungen</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textTertiary}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons name="moon-outline" size={20} color={colors.textSecondary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Dunkelmodus</Text>
            <Text style={styles.rowValueMuted}>Bald verfügbar</Text>
          </View>
        </View>

        {/* Info Section */}
        <Text style={styles.sectionHeader}>INFO</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.white} style={{ marginRight: spacing.sm }} />
          <Text style={styles.logoutText}>Abmelden</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  backText: {
    fontSize: typography.body,
    color: colors.primary,
    marginLeft: 2,
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    minWidth: 80,
  },

  // Content
  content: {
    paddingBottom: 64,
  },

  // Section header
  sectionHeader: {
    fontSize: typography.caption,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    ...shadows.card,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowIcon: {
    width: 28,
    textAlign: 'center',
    marginRight: spacing.sm + 4,
  },
  rowLabel: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
  },
  rowValue: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    maxWidth: 180,
  },
  rowValueMuted: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 52,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.card,
  },
  logoutText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.white,
  },
});
