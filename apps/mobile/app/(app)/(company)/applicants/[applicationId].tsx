import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useBewerbungen } from '../../../../hooks/queries/useBewerbungen';
import { useUpdateApplicationStatus } from '../../../../hooks/queries/useCompanyBewerbungen';
import CompatibilityBadge from '../../../../components/ui/CompatibilityBadge';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../../../constants/theme';

export default function ApplicationDetailScreen() {
  const { applicationId } = useLocalSearchParams<{ applicationId: string }>();
  const { data: bewerbungen = [], isLoading } = useBewerbungen();
  const updateStatus = useUpdateApplicationStatus();

  const item = useMemo(
    () => bewerbungen.find((b) => b.applicationId === applicationId),
    [bewerbungen, applicationId],
  );

  const handleAccept = () => {
    Alert.alert(
      'Bewerbung annehmen?',
      'Der/die Lernende erhält Zugang zum Chat und kann Ihnen Nachrichten senden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Annehmen',
          style: 'default',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            try {
              await updateStatus.mutateAsync({
                applicationId: applicationId!,
                status: 'ACCEPTED',
                note: 'Bewerbung angenommen',
              });
              Alert.alert('Angenommen!', 'Der Chat ist jetzt freigeschaltet.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch {
              Alert.alert('Fehler', 'Status konnte nicht aktualisiert werden.');
            }
          },
        },
      ],
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Bewerbung absagen?',
      'Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Absagen',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            try {
              await updateStatus.mutateAsync({
                applicationId: applicationId!,
                status: 'REJECTED',
                note: 'Bewerbung abgesagt',
              });
              router.back();
            } catch {
              Alert.alert('Fehler', 'Status konnte nicht aktualisiert werden.');
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Bewerbung</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bewerbung nicht gefunden.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isFinal = ['ACCEPTED', 'REJECTED', 'WITHDRAWN'].includes(item.applicationStatus ?? '');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Bewerbung prüfen</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Student Info */}
        <View style={styles.studentCard}>
          <View style={styles.studentAvatar}>
            <Text style={styles.studentAvatarText}>
              {(item.studentName ?? 'B')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.studentName ?? 'Bewerber'}</Text>
            <Text style={styles.studentMeta}>
              {item.studentCanton ?? ''}
              {item.studentCity ? ` · ${item.studentCity}` : ''}
            </Text>
          </View>
          <CompatibilityBadge score={item.compatibilityScore} size="sm" />
        </View>

        {/* Listing Info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Lehrstelle</Text>
          <Text style={styles.sectionValue}>{item.listing.title}</Text>
          <Text style={styles.sectionSubvalue}>
            {item.listing.canton}
            {item.listing.city ? ` · ${item.listing.city}` : ''}
          </Text>
        </View>

        {/* Motivationsschreiben */}
        {item.motivationsschreiben && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Motivationsschreiben</Text>
            <Text style={styles.sectionText}>{item.motivationsschreiben}</Text>
          </View>
        )}

        {/* Verfügbarkeit */}
        {item.verfuegbarkeit && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Verfügbarkeit</Text>
            <Text style={styles.sectionValue}>{item.verfuegbarkeit}</Text>
          </View>
        )}

        {/* Relevante Erfahrungen */}
        {item.relevanteErfahrungen && item.relevanteErfahrungen.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Relevante Erfahrungen</Text>
            <View style={styles.chipWrap}>
              {item.relevanteErfahrungen.map((exp, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{exp}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Fragen an den Betrieb */}
        {item.fragenAnBetrieb && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Fragen an den Betrieb</Text>
            <Text style={styles.sectionText}>{item.fragenAnBetrieb}</Text>
          </View>
        )}

        {/* Schnupperlehre-Wunsch */}
        {item.schnupperlehreWunsch && (
          <View style={styles.section}>
            <View style={styles.schnupperRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.schnupperText}>
                Wünscht sich eine Schnupperlehre
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* Action Buttons (only for non-final statuses) */}
      {!isFinal && (
        <View style={styles.bottomBar}>
          <Pressable
            style={styles.rejectButton}
            onPress={handleReject}
            disabled={updateStatus.isPending}
          >
            <Ionicons name="close" size={20} color={colors.error} />
            <Text style={styles.rejectButtonText}>Absagen</Text>
          </Pressable>
          <Pressable
            style={styles.acceptButton}
            onPress={handleAccept}
            disabled={updateStatus.isPending}
          >
            {updateStatus.isPending ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color={colors.white} />
                <Text style={styles.acceptButtonText}>Annehmen</Text>
              </>
            )}
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },

  // Student card
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.card,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  studentAvatarText: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  studentInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  studentName: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  studentMeta: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },

  // Sections
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  sectionValue: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  sectionSubvalue: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 22,
  },

  // Chips
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  chipText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },

  // Schnupperlehre
  schnupperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  schnupperText: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.error + '30',
  },
  rejectButtonText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.error,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  acceptButtonText: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
});
