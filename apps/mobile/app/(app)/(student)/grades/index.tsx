import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradeCard from '../../../../components/grades/GradeCard';
import api from '../../../../services/api';
import type { StudentGradeDTO } from '@lehrstellen/shared';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../../../constants/theme';

export default function GradesOverviewScreen() {
  const router = useRouter();
  const [grades, setGrades] = useState<StudentGradeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGrades = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<StudentGradeDTO[]>('/grades');
      setGrades(res.data);
    } catch {
      // silent — empty state will show
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGrades();
    }, [loadGrades])
  );

  const handleDelete = (grade: StudentGradeDTO) => {
    const label = grade.documentType === 'zeugnis'
      ? `Zeugnis ${grade.schoolYear} (Semester ${grade.semester})`
      : grade.testVariant ?? grade.documentType;

    Alert.alert(
      'Lösche?',
      `"${label}" wirklich lösche?`,
      [
        { text: 'Abbreche', style: 'cancel' },
        {
          text: 'Lösche',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/grades/${grade.id}`);
              setGrades((prev) => prev.filter((g) => g.id !== grade.id));
            } catch {
              Alert.alert('Fehler', 'Chönnt nöd glöscht werde.');
            }
          },
        },
      ]
    );
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Noote & Testergebnis</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {grades.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>📄</Text>
            </View>
            <Text style={styles.emptyTitle}>Nöd erfasst</Text>
            <Text style={styles.emptySubtitle}>
              Trag dini Zeugnis-Noote oder Multicheck-Ergebnis ii, damit Firme dini Leischtige gsehnd.
            </Text>
          </View>
        ) : (
          <View style={styles.gradesList}>
            {grades.map((grade) => (
              <GradeCard key={grade.id} grade={grade} onDelete={() => handleDelete(grade)} />
            ))}
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.actionButtonDisabled]}
            disabled
          >
            <Text style={styles.actionButtonIcon}>📸</Text>
            <View>
              <Text style={styles.actionButtonTitle}>Dokument scanne</Text>
              <Text style={styles.actionButtonSubtitle}>Chunnt bald!</Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/(app)/(student)/grades/choose-type')}
          >
            <Text style={styles.actionButtonIcon}>✏️</Text>
            <View>
              <Text style={styles.actionButtonTitle}>Manuell iiträge</Text>
              <Text style={styles.actionButtonSubtitle}>Ohni Foto</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} style={styles.actionChevron} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyIconText: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
  gradesList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonIcon: {
    fontSize: 28,
  },
  actionButtonTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  actionButtonSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionChevron: {
    marginLeft: 'auto',
  },
});
