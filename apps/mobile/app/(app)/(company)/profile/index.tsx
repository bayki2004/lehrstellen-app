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
import type { CompanyProfileDTO } from '@lehrstellen/shared';

export default function CompanyProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<CompanyProfileDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<CompanyProfileDTO>('/companies/me');
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
    Alert.alert('Abmelden', 'Möchten Sie sich wirklich abmelden?', [
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
              {(profile?.companyName || user?.email || '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.companyName}>{profile?.companyName || 'Unternehmen'}</Text>
          {profile?.industry && <Text style={styles.industry}>{profile.industry}</Text>}
          {profile?.canton && (
            <Text style={styles.location}>{profile.canton}, {profile.city}</Text>
          )}
        </View>

        {profile?.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Über uns</Text>
            <Text style={styles.description}>{profile.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontakt</Text>
          {profile?.contactEmail && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>E-Mail</Text>
              <Text style={styles.infoValue}>{profile.contactEmail}</Text>
            </View>
          )}
          {profile?.contactPhone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telefon</Text>
              <Text style={styles.infoValue}>{profile.contactPhone}</Text>
            </View>
          )}
          {profile?.website && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Website</Text>
              <Text style={styles.infoValue}>{profile.website}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Grösse</Text>
            <Text style={styles.infoValue}>{profile?.size || 'Nicht angegeben'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Verifiziert</Text>
            <Text style={styles.infoValue}>{profile?.isVerified ? 'Ja' : 'Nein'}</Text>
          </View>
        </View>

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
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  companyName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  industry: {
    fontSize: 15,
    color: '#4A90E2',
    fontWeight: '500',
    marginTop: 2,
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
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  logoutSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
