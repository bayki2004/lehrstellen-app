import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useBerufeMatches } from '../../../../hooks/queries/useBerufe';
import BerufMatchCard from '../../../../components/berufe/BerufMatchCard';
import RadarChart from '../../../../components/charts/RadarChart';
import { colors, typography, spacing, fontWeights, borderRadius, shadows } from '../../../../constants/theme';

const RIASEC_LABELS = ['R', 'I', 'A', 'S', 'E', 'C'];

export default function PassendeBerufeScreen() {
  const { data: matches = [], isLoading } = useBerufeMatches();

  // Extract user RIASEC from the first match's shared dimensions (if available)
  const firstMatch = matches[0];
  const values = firstMatch?.sharedDimensions
    ? RIASEC_LABELS.map((_, i) => {
        const keys = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];
        const dim = firstMatch.sharedDimensions.find((d) => d.key === keys[i]);
        return dim?.userScore ?? 0;
      })
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.beruf.code}
        ListHeaderComponent={
          <View style={styles.header}>
            {values && (
              <View style={styles.radarCard}>
                <RadarChart values={values} labels={RIASEC_LABELS} size={200} />
              </View>
            )}
            <Text style={styles.title}>Deine Top-Berufe</Text>
            <Text style={styles.subtitle}>{matches.length} passende Berufe gefunden</Text>
          </View>
        }
        renderItem={({ item }) => (
          <BerufMatchCard match={item} onPress={() => router.push(`/berufe/${item.beruf.code}`)} />
        )}
        ListEmptyComponent={
          isLoading ? <ActivityIndicator color={colors.primary} size="large" /> :
          <Text style={styles.empty}>Mach zuerst das Persönlichkeitsquiz!</Text>
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingVertical: spacing.lg },
  radarCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, ...shadows.card },
  title: { fontSize: typography.h3, fontWeight: fontWeights.bold, color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.md },
  list: { paddingBottom: spacing.xxxl },
  empty: { textAlign: 'center', color: colors.textTertiary, fontSize: typography.body, marginTop: spacing.xl },
});
