import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../../stores/auth.store';
import api from '../../../../services/api';
import ScoreRing from '../../../../components/ui/ScoreRing';
import type { StudentProfileExtendedDTO } from '@lehrstellen/shared';
import { pickImage } from '../../../../utils/mediaPicker';

export default function StudentProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<StudentProfileExtendedDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const res = await api.get<StudentProfileExtendedDTO>('/students/me/extended');
      setProfile(res.data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handlePhotoUpload = async () => {
    const uri = await pickImage();
    if (!uri) return;
    try {
      await api.put('/students/me/extended', { profilePhoto: uri });
      await loadProfile();
    } catch {
      Alert.alert('Fehler', 'Foto konnte nicht hochgeladen werden.');
    }
  };

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

  const completeness = profile?.profileCompleteness ?? 0;
  const skillsCount = profile?.skills?.length ?? 0;
  const schnupperCount = profile?.schnupperlehren?.length ?? 0;
  const interestsCount = profile?.desiredFields?.length ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePhotoUpload} activeOpacity={0.8}>
            {profile?.profilePhoto ? (
              <Image source={{ uri: profile.profilePhoto }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(profile?.firstName || user?.email || '?')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Text style={{ fontSize: 14 }}>📷</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>
            {profile ? `${profile.firstName} ${profile.lastName}` : user?.email}
          </Text>
          {profile?.canton && (
            <Text style={styles.location}>{profile.canton}, {profile.city}</Text>
          )}

          {/* Completeness ring */}
          <View style={styles.completenessRow}>
            <ScoreRing score={completeness} size={64} />
            <Text style={styles.completenessLabel}>Profil{'\n'}vollständig</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{interestsCount}</Text>
            <Text style={styles.statLabel}>Interessen</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{skillsCount}</Text>
            <Text style={styles.statLabel}>Fähigkeiten</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{schnupperCount}</Text>
            <Text style={styles.statLabel}>Schnupperlehren</Text>
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          <MenuRow
            emoji="📝"
            title="Bewerbungsprofil"
            subtitle="Lebenslauf, Schule, Fähigkeiten"
            onPress={() => router.push('/(app)/(student)/profile/builder')}
          />
          <MenuRow
            emoji="🧠"
            title="Persönlichkeitsprofil"
            subtitle={profile?.quizCompleted ? 'RIASEC & OCEAN Ergebnisse' : 'Quiz noch nicht abgeschlossen'}
            onPress={() => router.push('/(app)/(student)/profile/personality')}
          />
          <MenuRow
            emoji="🎯"
            title="Passende Berufe"
            subtitle="Berufe basierend auf deinem Profil"
            onPress={() => router.push('/(app)/(student)/profile/passende-berufe')}
          />
          <MenuRow
            emoji="⚙️"
            title="Einstellungen"
            subtitle="Konto & Abmelden"
            onPress={handleLogout}
            danger
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({
  emoji,
  title,
  subtitle,
  onPress,
  danger,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIcon}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.menuChevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 40 },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginBottom: 14,
    position: 'relative',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 36, fontWeight: '700' },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  name: { fontSize: 22, fontWeight: '700', color: '#1A1A2E' },
  location: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  completenessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  completenessLabel: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#1A1A2E' },
  statLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E5E7EB' },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  menuTitleDanger: { color: '#EF4444' },
  menuSubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 1 },
  menuChevron: { fontSize: 22, color: '#C4C9D4', fontWeight: '300' },
});
