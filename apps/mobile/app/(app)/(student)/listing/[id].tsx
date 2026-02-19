import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../../../services/api';
import type { ListingDTO, SwipeResponse } from '@lehrstellen/shared';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<ListingDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [alreadySwiped, setAlreadySwiped] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await api.get<ListingDTO>(`/listings/${id}`);
        setListing(res.data);
      } catch {
        Alert.alert('Fehler', 'Inserat konnte nicht geladen werden.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSwipe = async (direction: 'RIGHT' | 'LEFT') => {
    if (!listing || alreadySwiped) return;
    setIsApplying(true);
    try {
      const res = await api.post<SwipeResponse>('/swipes/', {
        listingId: listing.id,
        direction,
      });
      setAlreadySwiped(true);
      if (direction === 'RIGHT') {
        if (res.data.isMatch) {
          Alert.alert(
            'Es ist ein Match! 🎉',
            `Du hast mit ${listing.companyName} gematcht! Ihr könnt jetzt chatten.`,
            [{ text: 'Super!', onPress: () => router.back() }],
          );
        } else {
          Alert.alert(
            'Bewerbung gesendet',
            `Deine Bewerbung bei ${listing.companyName} wurde gesendet.`,
            [{ text: 'OK', onPress: () => router.back() }],
          );
        }
      } else {
        router.back();
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? '';
      if (msg.includes('Already swiped')) {
        setAlreadySwiped(true);
        Alert.alert('Bereits bewertet', 'Du hast dieses Inserat bereits bewertet.');
      } else {
        Alert.alert('Fehler', 'Aktion konnte nicht durchgeführt werden.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) return null;

  const startDateFormatted = listing.startDate
    ? new Date(listing.startDate).toLocaleDateString('de-CH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Inserat</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Company avatar + name */}
        <View style={styles.companyRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(listing.companyName || '?')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{listing.companyName}</Text>
            <Text style={styles.companyLocation}>
              {listing.companyCity}, {listing.companyCanton}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{listing.title}</Text>

        {/* Tags row */}
        <View style={styles.tagsRow}>
          {listing.field ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{listing.field}</Text>
            </View>
          ) : null}
          <View style={styles.tag}>
            <Text style={styles.tagText}>{listing.canton} – {listing.city}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{listing.durationYears} Jahre</Text>
          </View>
          {listing.spotsAvailable > 0 && (
            <View style={[styles.tag, styles.tagGreen]}>
              <Text style={[styles.tagText, styles.tagTextGreen]}>
                {listing.spotsAvailable} Stelle{listing.spotsAvailable > 1 ? 'n' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beschreibung</Text>
          <Text style={styles.sectionText}>{listing.description}</Text>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            {startDateFormatted && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ausbildungsbeginn</Text>
                <Text style={styles.detailValue}>{startDateFormatted}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dauer</Text>
              <Text style={styles.detailValue}>{listing.durationYears} Jahre</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kanton</Text>
              <Text style={styles.detailValue}>{listing.canton}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ort</Text>
              <Text style={styles.detailValue}>{listing.city}</Text>
            </View>
            {listing.requiredSchoolLevel && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Schulniveau</Text>
                <Text style={styles.detailValue}>{listing.requiredSchoolLevel}</Text>
              </View>
            )}
            {listing.requiredLanguages?.length > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sprachen</Text>
                <Text style={styles.detailValue}>{listing.requiredLanguages.join(', ')}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Freie Stellen</Text>
              <Text style={styles.detailValue}>{listing.spotsAvailable}</Text>
            </View>
          </View>
        </View>

        {/* Spacer for buttons */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action buttons (fixed bottom) */}
      <View style={styles.actions}>
        {alreadySwiped ? (
          <View style={styles.alreadySwipedBanner}>
            <Text style={styles.alreadySwipedText}>Du hast dieses Inserat bereits bewertet.</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleSwipe('LEFT')}
              disabled={isApplying}
            >
              <Text style={styles.rejectBtnText}>Nicht interessiert</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.applyBtn, isApplying && styles.disabledBtn]}
              onPress={() => handleSwipe('RIGHT')}
              disabled={isApplying}
            >
              {isApplying ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.applyBtnText}>Bewerben</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#4A90E2',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  companyLocation: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 14,
    lineHeight: 30,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagGreen: {
    backgroundColor: '#E8F5E9',
  },
  tagText: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '500',
  },
  tagTextGreen: {
    color: '#388E3C',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 23,
  },
  detailsGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A2E',
    fontWeight: '600',
    maxWidth: '55%',
    textAlign: 'right',
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  rejectBtnText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  applyBtn: {
    backgroundColor: '#4A90E2',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  alreadySwipedBanner: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alreadySwipedText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
});
