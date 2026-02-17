import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../../../../components/ui/Button';
import { useAuthStore } from '../../../../stores/auth.store';
import api from '../../../../services/api';
import type { StudentProfileDTO } from '@lehrstellen/shared';

const OCEAN_LABELS = ['Offenheit', 'Gewissenhaftigkeit', 'Extraversion', 'Verträglichkeit', 'Neurotizismus'];
const RIASEC_LABELS = ['Realistisch', 'Forschend', 'Künstlerisch', 'Sozial', 'Unternehmerisch', 'Konventionell'];

export default function StudentProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<StudentProfileDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.firstName || user?.email || '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>
            {profile ? `${profile.firstName} ${profile.lastName}` : user?.email}
          </Text>
          {profile?.canton && (
            <Text style={styles.location}>{profile.canton}, {profile.city}</Text>
          )}
        </View>

        {profile?.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Über mich</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        {profile?.oceanScores && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Persönlichkeit (OCEAN)</Text>
            {OCEAN_LABELS.map((label, i) => {
              const keys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;
              const value = (profile.oceanScores as any)?.[keys[i]] ?? 0;
              return (
                <View key={label} style={styles.traitRow}>
                  <Text style={styles.traitLabel}>{label}</Text>
                  <View style={styles.traitBarBg}>
                    <View style={[styles.traitBarFill, { width: `${value * 100}%` }]} />
                  </View>
                  <Text style={styles.traitValue}>{Math.round(value * 100)}%</Text>
                </View>
              );
            })}
          </View>
        )}

        {profile?.riasecScores && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interessen (RIASEC)</Text>
            {RIASEC_LABELS.map((label, i) => {
              const keys = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'] as const;
              const value = (profile.riasecScores as any)?.[keys[i]] ?? 0;
              return (
                <View key={label} style={styles.traitRow}>
                  <Text style={styles.traitLabel}>{label}</Text>
                  <View style={styles.traitBarBg}>
                    <View
                      style={[styles.traitBarFill, styles.riasecFill, { width: `${value * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.traitValue}>{Math.round(value * 100)}%</Text>
                </View>
              );
            })}
          </View>
        )}

        {profile?.desiredFields && profile.desiredFields.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gewünschte Berufsfelder</Text>
            <View style={styles.tags}>
              {profile.desiredFields.map((field) => (
                <View key={field} style={styles.tag}>
                  <Text style={styles.tagText}>{field}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.logoutSection}>
          <Button title="Abmelden" variant="outline" onPress={handleLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  traitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  traitLabel: {
    width: 120,
    fontSize: 13,
    color: '#6B7280',
  },
  traitBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  traitBarFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  riasecFill: {
    backgroundColor: '#FF6B35',
  },
  traitValue: {
    width: 40,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '500',
  },
  logoutSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
