import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  FlatList,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { SWISS_CANTONS } from '@lehrstellen/shared';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../services/api';
import { uploadCompanyPhotos, uploadCompanyVideo } from '../../services/uploadApi';
import { pickImages, pickVideo } from '../../utils/mediaPicker';
import { colors, typography, fontWeights, spacing } from '../../constants/theme';
import type { ImagePickerAsset } from 'expo-image-picker';

const COMPANY_SIZES = [
  { label: '1-10 Mitarbeiter', value: 'MICRO' },
  { label: '11-50 Mitarbeiter', value: 'SMALL' },
  { label: '51-250 Mitarbeiter', value: 'MEDIUM' },
  { label: '250+ Mitarbeiter', value: 'LARGE' },
];

const INDUSTRIES = [
  'Technologie',
  'Gesundheit',
  'Finanzen',
  'Bildung',
  'Handel',
  'Handwerk',
  'Industrie',
  'Gastronomie',
  'Bau',
  'Andere',
];

export default function CompanyProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('Technologie');
  const [companySize, setCompanySize] = useState('SMALL');
  const [canton, setCanton] = useState('ZH');
  const [city, setCity] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Media state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<ImagePickerAsset | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<ImagePickerAsset[]>([]);
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);

  const handlePickPhotos = async () => {
    const assets = await pickImages(10 - selectedPhotos.length);
    if (assets.length > 0) {
      setSelectedPhotos([...selectedPhotos, ...assets]);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index));
  };

  const handlePickVideo = async () => {
    const asset = await pickVideo();
    if (asset) {
      setVideoFile(asset);
      setVideoUrl('');
    }
  };

  const addLink = () => {
    setLinks([...links, { label: '', url: '' }]);
  };

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !companyName.trim() ||
      !description.trim() ||
      !city.trim() ||
      !contactPersonName.trim()
    ) {
      Alert.alert('Fehler', 'Bitte fuellen Sie alle Pflichtfelder aus.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create profile
      const validLinks = links.filter((l) => l.label.trim() && l.url.trim());
      await api.post('/companies/me', {
        companyName: companyName.trim(),
        description: description.trim(),
        industry,
        companySize,
        canton,
        city: city.trim(),
        contactPersonName: contactPersonName.trim(),
        videoUrl: videoUrl.trim() || undefined,
        links: validLinks.length > 0 ? validLinks : undefined,
      });

      // 2. Upload photos
      if (selectedPhotos.length > 0) {
        await uploadCompanyPhotos(selectedPhotos.map((p) => p.uri));
      }

      // 3. Upload video file
      if (videoFile) {
        await uploadCompanyVideo(videoFile.uri);
      }

      if (user) {
        setUser({ ...user, hasProfile: true });
      }

      router.replace('/');
    } catch (error: any) {
      Alert.alert(
        'Fehler',
        error.response?.data?.message || 'Profil konnte nicht erstellt werden.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>Zurueck</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Unternehmensprofil</Text>
            <Text style={styles.subtitle}>
              Erstellen Sie Ihr Unternehmensprofil, um Lehrstellen zu publizieren.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Firmenname *"
              placeholder="Muster AG"
              value={companyName}
              onChangeText={(text: string) => setCompanyName(text)}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Input
              label="Beschreibung *"
              placeholder="Beschreiben Sie Ihr Unternehmen..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Branche</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled
              >
                {INDUSTRIES.map((ind) => (
                  <TouchableOpacity
                    key={ind}
                    style={[styles.chip, industry === ind && styles.chipSelected]}
                    onPress={() => setIndustry(ind)}
                  >
                    <Text style={[styles.chipText, industry === ind && styles.chipTextSelected]}>
                      {ind}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Unternehmensgroesse</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled
              >
                {COMPANY_SIZES.map((size) => (
                  <TouchableOpacity
                    key={size.value}
                    style={[styles.chip, companySize === size.value && styles.chipSelected]}
                    onPress={() => setCompanySize(size.value)}
                  >
                    <Text style={[styles.chipText, companySize === size.value && styles.chipTextSelected]}>
                      {size.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Kanton</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled
              >
                {SWISS_CANTONS.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.chip, canton === c.code && styles.chipSelected]}
                    onPress={() => setCanton(c.code)}
                  >
                    <Text style={[styles.chipText, canton === c.code && styles.chipTextSelected]}>
                      {c.code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Input
              label="Stadt / Ort *"
              placeholder="Zuerich"
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Input
              label="Kontaktperson *"
              placeholder="Hans Muster"
              value={contactPersonName}
              onChangeText={setContactPersonName}
              autoCapitalize="words"
              autoCorrect={false}
            />

            {/* Video Section */}
            <View style={styles.mediaSection}>
              <Text style={styles.mediaSectionTitle}>Video (optional)</Text>
              <Text style={styles.mediaSectionSubtitle}>
                YouTube-Link eingeben oder Video hochladen
              </Text>
              <Input
                label="YouTube-Link"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChangeText={(v: string) => { setVideoUrl(v); setVideoFile(null); }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.orText}>oder</Text>
              <TouchableOpacity style={styles.mediaPickerButton} onPress={handlePickVideo}>
                <Text style={styles.mediaPickerText}>
                  {videoFile ? 'Video ausgewaehlt' : 'Video aus Galerie waehlen'}
                </Text>
              </TouchableOpacity>
              {videoFile && (
                <TouchableOpacity onPress={() => setVideoFile(null)}>
                  <Text style={styles.removeText}>Video entfernen</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Photos Section */}
            <View style={styles.mediaSection}>
              <Text style={styles.mediaSectionTitle}>Fotos (optional)</Text>
              <Text style={styles.mediaSectionSubtitle}>
                Zeigen Sie Ihren Arbeitsplatz, Ihr Team, etc.
              </Text>
              {selectedPhotos.length > 0 && (
                <FlatList
                  horizontal
                  data={selectedPhotos}
                  keyExtractor={(_, i) => i.toString()}
                  showsHorizontalScrollIndicator={false}
                  style={styles.photoList}
                  renderItem={({ item, index }) => (
                    <View style={styles.photoThumb}>
                      <Image source={{ uri: item.uri }} style={styles.photoImage} />
                      <TouchableOpacity
                        style={styles.photoRemoveButton}
                        onPress={() => removePhoto(index)}
                      >
                        <Text style={styles.photoRemoveText}>X</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              )}
              <TouchableOpacity style={styles.mediaPickerButton} onPress={handlePickPhotos}>
                <Text style={styles.mediaPickerText}>
                  Fotos hinzufuegen ({selectedPhotos.length}/10)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Links Section */}
            <View style={styles.mediaSection}>
              <Text style={styles.mediaSectionTitle}>Links (optional)</Text>
              <Text style={styles.mediaSectionSubtitle}>
                Website, Social Media, etc.
              </Text>
              {links.map((link, i) => (
                <View key={i} style={styles.linkRow}>
                  <TextInput
                    style={[styles.linkInput]}
                    value={link.label}
                    onChangeText={(v) => updateLink(i, 'label', v)}
                    placeholder="Label (z.B. LinkedIn)"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TextInput
                    style={[styles.linkInput]}
                    value={link.url}
                    onChangeText={(v) => updateLink(i, 'url', v)}
                    placeholder="URL"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                  <TouchableOpacity onPress={() => removeLink(i)}>
                    <Text style={styles.removeText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.mediaPickerButton} onPress={addLink}>
                <Text style={styles.mediaPickerText}>+ Link hinzufuegen</Text>
              </TouchableOpacity>
            </View>

            <Button
              title={isSubmitting ? 'Wird erstellt...' : 'Profil erstellen'}
              onPress={handleSubmit}
              loading={isSubmitting}
              variant="primary"
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backText: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  form: {
    gap: spacing.md,
  },
  pickerContainer: {
    gap: spacing.xs,
  },
  pickerLabel: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  chipScroll: {
    flexGrow: 0,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  // Media sections
  mediaSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  mediaSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  mediaSectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  orText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textSecondary,
  },
  mediaPickerButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  mediaPickerText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  removeText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600' as const,
    textAlign: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  // Photos
  photoList: {
    marginVertical: 4,
  },
  photoThumb: {
    marginRight: 8,
    position: 'relative',
  },
  photoImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  photoRemoveButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700' as const,
  },
  // Links
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
});
