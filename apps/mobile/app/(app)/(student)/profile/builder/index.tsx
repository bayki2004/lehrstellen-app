import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const STEPS = [
  { key: 'personal', emoji: '👤', title: 'Persönliche Daten', subtitle: 'Name, Telefon, Nationalität, Bio' },
  { key: 'motivation-letter', emoji: '✍️', title: 'Motivationsschreiben', subtitle: 'Deine Motivation in eigenen Worten' },
  { key: 'education', emoji: '🏫', title: 'Schulbildung', subtitle: 'Aktuelle und frühere Schulen' },
  { key: 'experience', emoji: '🔬', title: 'Schnupperlehren', subtitle: 'Deine bisherigen Schnupperlehren' },
  { key: 'skills', emoji: '⚡', title: 'Fähigkeiten & Sprachen', subtitle: 'Kenntnisse und Sprachkenntnisse' },
];

export default function ProfileBuilderIndexScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bewerbungsprofil</Text>
        <Text style={styles.subtitle}>Vervollständige dein Profil Schritt für Schritt</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {STEPS.map((step, index) => (
          <TouchableOpacity
            key={step.key}
            style={styles.stepCard}
            onPress={() => router.push(`/(app)/(student)/profile/builder/${step.key}` as any)}
            activeOpacity={0.7}
          >
            <View style={styles.stepIndex}>
              <Text style={styles.stepIndexText}>{index + 1}</Text>
            </View>
            <View style={styles.stepIcon}>
              <Text style={{ fontSize: 24 }}>{step.emoji}</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  backButton: { marginBottom: 12 },
  backText: { fontSize: 16, color: '#4A90E2', fontWeight: '500' },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A2E' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepIndexText: { fontSize: 13, fontWeight: '700', color: '#4A90E2' },
  stepIcon: { marginRight: 12 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  stepSubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  chevron: { fontSize: 22, color: '#C4C9D4', fontWeight: '300' },
});
