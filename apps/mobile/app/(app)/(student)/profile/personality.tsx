import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../../../../services/api';
import type { StudentProfileDTO } from '@lehrstellen/shared';

const OCEAN_ITEMS = [
  { key: 'openness', label: 'Offenheit', emoji: '🌟', description: 'Neugier, Kreativität, Offenheit für neue Erfahrungen' },
  { key: 'conscientiousness', label: 'Gewissenhaftigkeit', emoji: '🎯', description: 'Zuverlässigkeit, Fleiß, Selbstdisziplin' },
  { key: 'extraversion', label: 'Extraversion', emoji: '🗣️', description: 'Geselligkeit, Energie, Gesprächigkeit' },
  { key: 'agreeableness', label: 'Verträglichkeit', emoji: '🤝', description: 'Kooperationsbereitschaft, Empathie' },
  { key: 'neuroticism', label: 'Neurotizismus', emoji: '💭', description: 'Emotionale Reaktivität, Sensibilität' },
] as const;

const RIASEC_ITEMS = [
  { key: 'realistic', label: 'Realistisch', emoji: '🔧', code: 'R', description: 'Praktisch, technisch, handwerklich' },
  { key: 'investigative', label: 'Forschend', emoji: '🔬', code: 'I', description: 'Analytisch, wissenschaftlich, logisch' },
  { key: 'artistic', label: 'Künstlerisch', emoji: '🎨', code: 'A', description: 'Kreativ, ausdrucksstark, originell' },
  { key: 'social', label: 'Sozial', emoji: '👥', code: 'S', description: 'Hilfsbereit, kommunikativ, lehrend' },
  { key: 'enterprising', label: 'Unternehmerisch', emoji: '📈', code: 'E', description: 'Führend, überzeugend, ehrgeizig' },
  { key: 'conventional', label: 'Konventionell', emoji: '📋', code: 'C', description: 'Ordentlich, präzise, strukturiert' },
] as const;

export default function PersonalityScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfileDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<StudentProfileDTO>('/students/me').then((res) => {
      setProfile(res.data);
    }).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><ActivityIndicator size="large" color="#4A90E2" /></View>
      </SafeAreaView>
    );
  }

  if (!profile?.quizCompleted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.back} onPress={() => router.back()}>‹ Zurück</Text>
          <Text style={styles.title}>Persönlichkeitsprofil</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🧠</Text>
          <Text style={styles.emptyTitle}>Quiz nicht abgeschlossen</Text>
          <Text style={styles.emptyText}>
            Schliess das OCEAN & RIASEC Quiz ab, um dein Persönlichkeitsprofil zu sehen.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Top 3 RIASEC codes
  const riasecSorted = RIASEC_ITEMS
    .map((item) => ({ ...item, value: (profile.riasecScores as any)[item.key] as number }))
    .sort((a, b) => b.value - a.value);
  const topCodes = riasecSorted.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.back} onPress={() => router.back()}>‹ Zurück</Text>
        <Text style={styles.title}>Persönlichkeitsprofil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Top 3 Holland codes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dein Holland-Code</Text>
          <View style={styles.codesRow}>
            {topCodes.map((item, i) => (
              <View key={item.code} style={[styles.codeCard, i === 0 && styles.codeCardPrimary]}>
                <Text style={styles.codeEmoji}>{item.emoji}</Text>
                <Text style={[styles.codeLetter, i === 0 && styles.codeLetterPrimary]}>{item.code}</Text>
                <Text style={styles.codeLabel}>{item.label}</Text>
                <Text style={styles.codePercent}>{Math.round(item.value * 100)}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* RIASEC bars */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interessen (RIASEC)</Text>
          {riasecSorted.map((item) => (
            <View key={item.key} style={styles.barRow}>
              <View style={styles.barLabelRow}>
                <Text style={styles.barEmoji}>{item.emoji}</Text>
                <View style={styles.barLabelBlock}>
                  <Text style={styles.barLabel}>{item.label}</Text>
                  <Text style={styles.barDesc}>{item.description}</Text>
                </View>
                <Text style={styles.barPercent}>{Math.round(item.value * 100)}%</Text>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.barFill, styles.barFillRiasec, { width: `${item.value * 100}%` }]} />
              </View>
            </View>
          ))}
        </View>

        {/* OCEAN bars */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Persönlichkeit (OCEAN)</Text>
          {OCEAN_ITEMS.map((item) => {
            const value = (profile.oceanScores as any)[item.key] as number;
            return (
              <View key={item.key} style={styles.barRow}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.barEmoji}>{item.emoji}</Text>
                  <View style={styles.barLabelBlock}>
                    <Text style={styles.barLabel}>{item.label}</Text>
                    <Text style={styles.barDesc}>{item.description}</Text>
                  </View>
                  <Text style={styles.barPercent}>{Math.round(value * 100)}%</Text>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${value * 100}%` }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* CTA to passende berufe */}
        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push('/(app)/(student)/profile/passende-berufe')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>🎯  Passende Berufe entdecken</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  back: { fontSize: 16, color: '#4A90E2', fontWeight: '500', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A2E' },
  content: { paddingBottom: 40 },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 14 },
  codesRow: { flexDirection: 'row', gap: 10 },
  codeCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  codeCardPrimary: {
    backgroundColor: '#EBF5FF',
    borderWidth: 1.5,
    borderColor: '#4A90E2',
  },
  codeEmoji: { fontSize: 24, marginBottom: 4 },
  codeLetter: { fontSize: 22, fontWeight: '800', color: '#6B7280' },
  codeLetterPrimary: { color: '#4A90E2' },
  codeLabel: { fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 2 },
  codePercent: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginTop: 4 },
  barRow: { marginBottom: 14 },
  barLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  barEmoji: { fontSize: 18, marginRight: 10 },
  barLabelBlock: { flex: 1 },
  barLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  barDesc: { fontSize: 11, color: '#9CA3AF' },
  barPercent: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginLeft: 8 },
  barBg: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#4A90E2', borderRadius: 4 },
  barFillRiasec: { backgroundColor: '#FF6B35' },
  cta: {
    marginHorizontal: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});
