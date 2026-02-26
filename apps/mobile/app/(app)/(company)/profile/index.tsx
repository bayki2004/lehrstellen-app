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
  FlatList,
  TextInput,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../../../../components/ui/Button';
import { useAuthStore } from '../../../../stores/auth.store';
import api from '../../../../services/api';
import { uploadCompanyPhotos, uploadCompanyVideo, deleteCompanyPhoto, deleteCompanyVideo } from '../../../../services/uploadApi';
import { pickImages, pickVideo } from '../../../../utils/mediaPicker';
import { colors, typography, fontWeights, spacing, borderRadius, shadows } from '../../../../constants/theme';
import type { CompanyProfileDTO, CompanyPhotoDTO, CompanyLinkDTO, ListingDTO } from '@lehrstellen/shared';

const SERVER_BASE = 'http://192.168.0.15:3002';

function getFullUrl(path: string | undefined) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${SERVER_BASE}${path}`;
}

function isYouTubeUrl(url: string) {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

export default function CompanyProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<CompanyProfileDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit state
  const [editDescription, setEditDescription] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editLinks, setEditLinks] = useState<{ label: string; url: string }[]>([]);

  const loadProfile = useCallback(async () => {
    try {
      const res = await api.get<CompanyProfileDTO>('/companies/me');
      setProfile(res.data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const startEditing = () => {
    if (!profile) return;
    setEditDescription(profile.description);
    setEditWebsite(profile.website || '');
    setEditVideoUrl(profile.videoUrl || '');
    setEditLinks(profile.links.map((l) => ({ label: l.label, url: l.url })));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      await api.put('/companies/me', {
        description: editDescription,
        website: editWebsite || undefined,
        videoUrl: editVideoUrl || null,
        links: editLinks.filter((l) => l.label && l.url),
      });
      await loadProfile();
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert('Fehler', error.response?.data?.message || 'Speichern fehlgeschlagen.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPhotos = async () => {
    const assets = await pickImages(5);
    if (assets.length === 0) return;
    try {
      await uploadCompanyPhotos(assets.map((a) => a.uri));
      await loadProfile();
    } catch {
      Alert.alert('Fehler', 'Fotos konnten nicht hochgeladen werden.');
    }
  };

  const handleDeletePhoto = (photo: CompanyPhotoDTO) => {
    Alert.alert('Foto löschen', 'Möchten Sie dieses Foto wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCompanyPhoto(photo.id);
            await loadProfile();
          } catch {
            Alert.alert('Fehler', 'Foto konnte nicht gelöscht werden.');
          }
        },
      },
    ]);
  };

  const handleUploadVideo = async () => {
    const asset = await pickVideo();
    if (!asset) return;
    try {
      await uploadCompanyVideo(asset.uri);
      await loadProfile();
    } catch {
      Alert.alert('Fehler', 'Video konnte nicht hochgeladen werden.');
    }
  };

  const handleDeleteVideo = () => {
    Alert.alert('Video löschen', 'Möchten Sie das Video wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCompanyVideo();
            await loadProfile();
          } catch {
            Alert.alert('Fehler', 'Video konnte nicht gelöscht werden.');
          }
        },
      },
    ]);
  };

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

  const addLink = () => {
    setEditLinks([...editLinks, { label: '', url: '' }]);
  };

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...editLinks];
    updated[index] = { ...updated[index], [field]: value };
    setEditLinks(updated);
  };

  const removeLink = (index: number) => {
    setEditLinks(editLinks.filter((_, i) => i !== index));
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
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProfile(); }} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Profil</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={startEditing}>
              <Text style={styles.editButton}>Bearbeiten</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity onPress={cancelEditing}>
                <Text style={styles.cancelButton}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveProfile} disabled={isSaving}>
                <Text style={styles.saveButton}>{isSaving ? '...' : 'Speichern'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Avatar & Company Info */}
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
          {profile?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verifiziert</Text>
            </View>
          )}
        </View>

        {/* Video Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Video</Text>
          {isEditing ? (
            <View>
              <TextInput
                style={styles.input}
                value={editVideoUrl}
                onChangeText={setEditVideoUrl}
                placeholder="YouTube-Link eingeben"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.mediaButton} onPress={handleUploadVideo}>
                <Text style={styles.mediaButtonText}>Video hochladen</Text>
              </TouchableOpacity>
            </View>
          ) : profile?.videoUrl ? (
            <View>
              {isYouTubeUrl(profile.videoUrl) ? (
                <TouchableOpacity
                  style={styles.videoPreview}
                  onPress={() => Linking.openURL(profile.videoUrl!)}
                >
                  <Text style={styles.videoPlayIcon}>YouTube</Text>
                  <Text style={styles.videoLink} numberOfLines={1}>{profile.videoUrl}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.videoPreview}>
                  <Text style={styles.videoPlayIcon}>Video</Text>
                  <Text style={styles.videoLink}>Hochgeladenes Video</Text>
                </View>
              )}
              {isEditing && (
                <TouchableOpacity onPress={handleDeleteVideo}>
                  <Text style={styles.deleteText}>Video entfernen</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>Kein Video vorhanden</Text>
          )}
        </View>

        {/* Photo Gallery */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fotos</Text>
            {isEditing && (
              <TouchableOpacity onPress={handleAddPhotos}>
                <Text style={styles.addButtonText}>+ Hinzufügen</Text>
              </TouchableOpacity>
            )}
          </View>
          {profile?.photos && profile.photos.length > 0 ? (
            <FlatList
              horizontal
              data={profile.photos}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.photoContainer}>
                  <Image
                    source={{ uri: getFullUrl(item.url) }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                  {isEditing && (
                    <TouchableOpacity
                      style={styles.photoDeleteButton}
                      onPress={() => handleDeletePhoto(item)}
                    >
                      <Text style={styles.photoDeleteText}>X</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>Keine Fotos vorhanden</Text>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Über uns</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textTertiary}
            />
          ) : (
            <Text style={styles.description}>{profile?.description || 'Keine Beschreibung'}</Text>
          )}
        </View>

        {/* Links */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Links</Text>
            {isEditing && (
              <TouchableOpacity onPress={addLink}>
                <Text style={styles.addButtonText}>+ Hinzufügen</Text>
              </TouchableOpacity>
            )}
          </View>
          {isEditing ? (
            editLinks.map((link, i) => (
              <View key={i} style={styles.linkEditRow}>
                <TextInput
                  style={[styles.input, styles.linkInput]}
                  value={link.label}
                  onChangeText={(v) => updateLink(i, 'label', v)}
                  placeholder="Label (z.B. LinkedIn)"
                  placeholderTextColor={colors.textTertiary}
                />
                <TextInput
                  style={[styles.input, styles.linkInput]}
                  value={link.url}
                  onChangeText={(v) => updateLink(i, 'url', v)}
                  placeholder="URL"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <TouchableOpacity onPress={() => removeLink(i)}>
                  <Text style={styles.deleteText}>X</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : profile?.links && profile.links.length > 0 ? (
            profile.links.map((link) => (
              <TouchableOpacity
                key={link.id}
                style={styles.linkRow}
                onPress={() => Linking.openURL(link.url)}
              >
                <Text style={styles.linkLabel}>{link.label}</Text>
                <Text style={styles.linkUrl} numberOfLines={1}>{link.url}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Keine Links vorhanden</Text>
          )}
          {isEditing && profile?.website && (
            <View style={styles.websiteEdit}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                style={styles.input}
                value={editWebsite}
                onChangeText={setEditWebsite}
                placeholder="https://www.example.ch"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          )}
        </View>

        {/* Lehrstellen */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lehrstellen</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(company)/listings/create')}>
              <Text style={styles.addButtonText}>+ Neue Stelle</Text>
            </TouchableOpacity>
          </View>
          {profile?.listings && profile.listings.length > 0 ? (
            profile.listings.map((listing) => (
              <View key={listing.id} style={styles.listingCard}>
                <Text style={styles.listingTitle}>{listing.title}</Text>
                <Text style={styles.listingField}>{listing.field}</Text>
                <View style={styles.listingMeta}>
                  <Text style={styles.listingMetaText}>{listing.canton}, {listing.city}</Text>
                  <Text style={styles.listingMetaText}>
                    {listing.spotsAvailable} {listing.spotsAvailable === 1 ? 'Platz' : 'Plätze'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Keine aktiven Lehrstellen</Text>
          )}
        </View>

        {/* Contact & Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kontaktperson</Text>
            <Text style={styles.infoValue}>{profile?.contactPersonName || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Größe</Text>
            <Text style={styles.infoValue}>{profile?.companySize || '-'}</Text>
          </View>
          {profile?.website && !isEditing && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Website</Text>
              <TouchableOpacity onPress={() => Linking.openURL(profile.website!)}>
                <Text style={[styles.infoValue, styles.linkUrl]}>{profile.website}</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>E-Mail</Text>
            <Text style={styles.infoValue}>{user?.email || '-'}</Text>
          </View>
        </View>

        {/* Logout */}
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
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  pageTitle: {
    fontSize: typography.h1,
    fontWeight: fontWeights.extraBold,
    color: colors.text,
  },
  editButton: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    fontSize: typography.body,
    color: colors.textSecondary,
    fontWeight: fontWeights.semiBold,
  },
  saveButton: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: fontWeights.bold,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: typography.hero,
    fontWeight: fontWeights.bold,
  },
  companyName: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  industry: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: fontWeights.medium,
    marginTop: 2,
  },
  location: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  verifiedBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  verifiedText: {
    color: colors.success,
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
  },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  // Photos
  photoContainer: {
    marginRight: spacing.sm,
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 90,
    borderRadius: borderRadius.sm,
  },
  photoDeleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.overlay,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoDeleteText: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
  },
  // Video
  videoPreview: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  videoPlayIcon: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.bold,
    color: colors.primary,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  videoLink: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  // Links
  linkRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  linkLabel: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: 2,
  },
  linkUrl: {
    fontSize: typography.bodySmall,
    color: colors.primary,
  },
  linkEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  linkInput: {
    flex: 1,
  },
  websiteEdit: {
    marginTop: spacing.md,
  },
  inputLabel: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  // Listings
  listingCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  listingTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  listingField: {
    fontSize: typography.bodySmall,
    color: colors.primary,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.xs,
  },
  listingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listingMetaText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  // Details
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.bodySmall,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  // Edit inputs
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: typography.bodySmall,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  mediaButton: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  mediaButtonText: {
    fontSize: typography.bodySmall,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  addButtonText: {
    fontSize: typography.bodySmall,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  deleteText: {
    fontSize: typography.bodySmall,
    color: colors.error,
    fontWeight: fontWeights.semiBold,
    paddingHorizontal: spacing.sm,
  },
  logoutSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});
