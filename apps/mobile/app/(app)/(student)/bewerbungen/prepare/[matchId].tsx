import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useBewerbungen, useSubmitBewerbung } from '../../../../../hooks/queries/useBewerbungen';
import { useProfileBuilderStore } from '../../../../../stores/profileBuilder.store';
import CompatibilityBadge from '../../../../../components/ui/CompatibilityBadge';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../../../../constants/theme';

export default function PrepareBewerbungScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const insets = useSafeAreaInsets();
  const { data: bewerbungen = [], isLoading: loadingBewerbungen } = useBewerbungen();
  const submitMutation = useSubmitBewerbung();
  const profileStore = useProfileBuilderStore();

  const item = useMemo(
    () => bewerbungen.find((b) => b.matchId === matchId),
    [bewerbungen, matchId],
  );

  // Form state — pre-fill motivation from global profile
  const [motivationsschreiben, setMotivationsschreiben] = useState(
    profileStore.motivationLetter || '',
  );
  const [verfuegbarkeit, setVerfuegbarkeit] = useState('');
  const [fragenAnBetrieb, setFragenAnBetrieb] = useState('');
  const [schnupperlehreWunsch, setSchnupperlehreWunsch] = useState(false);

  // Selectable experiences from profile
  const allSchnupperlehren = profileStore.schnupperlehren || [];
  const allSkills = profileStore.skills || [];
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);

  const toggleExperience = (exp: string) => {
    setSelectedExperiences((prev) =>
      prev.includes(exp) ? prev.filter((e) => e !== exp) : [...prev, exp],
    );
  };

  const handleSubmit = async () => {
    if (!matchId) return;

    if (!motivationsschreiben.trim()) {
      Alert.alert('Motivationsschreiben fehlt', 'Bitte schreibe ein Motivationsschreiben.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await submitMutation.mutateAsync({
        matchId,
        motivationsschreiben: motivationsschreiben.trim(),
        verfuegbarkeit: verfuegbarkeit.trim() || undefined,
        relevanteErfahrungen: selectedExperiences.length > 0 ? selectedExperiences : undefined,
        fragenAnBetrieb: fragenAnBetrieb.trim() || undefined,
        schnupperlehreWunsch,
      });
      Alert.alert('Bewerbung gesendet!', 'Deine Bewerbung wurde erfolgreich abgeschickt.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Fehler', 'Bewerbung konnte nicht gesendet werden. Bitte versuche es erneut.');
    }
  };

  if (loadingBewerbungen) {
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

  const initial = (item.listing.companyName ?? '?')[0].toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Bewerbung vorbereiten</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Company Card */}
          <View style={styles.companyCard}>
            <View style={styles.companyCardTop}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{initial}</Text>
              </LinearGradient>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName} numberOfLines={1}>
                  {item.listing.companyName}
                </Text>
                <Text style={styles.listingTitle} numberOfLines={1}>
                  {item.listing.title}
                </Text>
                <Text style={styles.listingMeta} numberOfLines={1}>
                  {item.listing.canton}
                  {item.listing.city ? ` · ${item.listing.city}` : ''}
                  {item.listing.durationYears ? ` · ${item.listing.durationYears} Jahre` : ''}
                </Text>
              </View>
              <CompatibilityBadge score={item.compatibilityScore} size="sm" />
            </View>
          </View>

          {/* Motivationsschreiben */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Motivationsschreiben</Text>
            <Text style={styles.sectionHint}>
              Passe dein Motivationsschreiben für diese Lehrstelle an
            </Text>
            <TextInput
              style={styles.textArea}
              value={motivationsschreiben}
              onChangeText={setMotivationsschreiben}
              placeholder="Warum interessierst du dich für diese Lehrstelle?"
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {motivationsschreiben.length} Zeichen
            </Text>
          </View>

          {/* Verfügbarkeit */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verfügbarkeit</Text>
            <Text style={styles.sectionHint}>Wann könntest du starten?</Text>
            <TextInput
              style={styles.input}
              value={verfuegbarkeit}
              onChangeText={setVerfuegbarkeit}
              placeholder="z.B. August 2026"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* Relevante Erfahrungen */}
          {(allSchnupperlehren.length > 0 || allSkills.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Relevante Erfahrungen</Text>
              <Text style={styles.sectionHint}>
                Wähle aus, was für diese Stelle relevant ist
              </Text>

              {allSchnupperlehren.length > 0 && (
                <>
                  <Text style={styles.subLabel}>Schnupperlehren</Text>
                  <View style={styles.chipWrap}>
                    {allSchnupperlehren.map((s) => {
                      const label = `${s.beruf} bei ${s.companyName}`;
                      const isSelected = selectedExperiences.includes(label);
                      return (
                        <Pressable
                          key={s.id}
                          style={[styles.chip, isSelected && styles.chipActive]}
                          onPress={() => toggleExperience(label)}
                        >
                          <Text
                            style={[styles.chipText, isSelected && styles.chipTextActive]}
                          >
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {allSkills.length > 0 && (
                <>
                  <Text style={styles.subLabel}>Skills</Text>
                  <View style={styles.chipWrap}>
                    {allSkills.map((skill) => {
                      const isSelected = selectedExperiences.includes(skill);
                      return (
                        <Pressable
                          key={skill}
                          style={[styles.chip, isSelected && styles.chipActive]}
                          onPress={() => toggleExperience(skill)}
                        >
                          <Text
                            style={[styles.chipText, isSelected && styles.chipTextActive]}
                          >
                            {skill}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          )}

          {/* Fragen an den Betrieb */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fragen an den Betrieb</Text>
            <Text style={styles.sectionHint}>
              Hast du Fragen zur Lehrstelle? (zeigt echtes Interesse)
            </Text>
            <TextInput
              style={styles.textAreaSmall}
              value={fragenAnBetrieb}
              onChangeText={setFragenAnBetrieb}
              placeholder="z.B. Wie sieht ein typischer Arbeitstag aus?"
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Schnupperlehre-Wunsch */}
          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Schnupperlehre gewünscht</Text>
                <Text style={styles.sectionHint}>
                  Möchtest du vorher schnuppern gehen?
                </Text>
              </View>
              <Switch
                value={schnupperlehreWunsch}
                onValueChange={setSchnupperlehreWunsch}
                trackColor={{ false: colors.border, true: colors.primary + '60' }}
                thumbColor={schnupperlehreWunsch ? colors.primary : colors.textTertiary}
              />
            </View>
          </View>

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Action — extra padding for floating tab bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) + 72 }]}>
        <Pressable
          style={[styles.submitButton, submitMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="paper-plane" size={18} color={colors.white} />
              <Text style={styles.submitButtonText}>Bewerbung absenden</Text>
            </>
          )}
        </Pressable>
      </View>
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

  // Company Card
  companyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.card,
  },
  companyCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  companyInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  companyName: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  listingTitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listingMeta: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },

  // Section
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: 2,
  },
  sectionHint: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  subLabel: {
    fontSize: typography.caption,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  // Inputs
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  textArea: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderLight,
    minHeight: 150,
  },
  textAreaSmall: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderLight,
    minHeight: 80,
  },
  charCount: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
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
    backgroundColor: colors.secondaryBackground,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.caption,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
});
