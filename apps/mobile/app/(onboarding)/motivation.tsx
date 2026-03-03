import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { uploadMotivationLetter } from '../../services/uploadApi';
import { colors, typography, fontWeights, spacing, borderRadius, shadows } from '../../constants/theme';

type Tab = 'schriibe' | 'ufelade';

export default function MotivationScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('schriibe');
  const [motivationText, setMotivationText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; uri: string; mimeType: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const MAX_CHARS = 1000;

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        if (asset.size && asset.size > 5 * 1024 * 1024) {
          Alert.alert('Datei z\'gross', 'Maximal 5 MB erlaubt.');
          return;
        }
        setUploadedFile({
          name: asset.name,
          uri: asset.uri,
          mimeType: asset.mimeType || 'application/pdf',
        });
      }
    } catch {
      Alert.alert('Fehler', 'Datei chönnt nöd glade werde.');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Save text motivation letter if written
      if (activeTab === 'schriibe' && motivationText.trim()) {
        await api.put('/students/me', {
          motivationLetter: motivationText.trim(),
        });
      }

      // Upload file if selected
      if (activeTab === 'ufelade' && uploadedFile) {
        setIsUploading(true);
        await uploadMotivationLetter(uploadedFile.uri, uploadedFile.name, uploadedFile.mimeType);
        setIsUploading(false);
      }

      router.replace('/');
    } catch (error: any) {
      Alert.alert(
        'Fehler',
        error.response?.data?.message || 'Motivationsschriibe chönnt nöd gspeichert werde.',
      );
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/');
  };

  const hasContent = activeTab === 'schriibe'
    ? motivationText.trim().length > 0
    : uploadedFile !== null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Zrugg</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.stepLabel}>Schritt 4 vo 4</Text>
          <Text style={styles.title}>Dini Motivation</Text>
          <Text style={styles.subtitle}>
            Schriib es churzes Motivationsschriibe oder lad dis Motivationsschriibe ufe.
          </Text>
        </View>

        {/* Tab Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'schriibe' && styles.tabActive]}
            onPress={() => setActiveTab('schriibe')}
          >
            <Text style={[styles.tabText, activeTab === 'schriibe' && styles.tabTextActive]}>
              Schriibe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ufelade' && styles.tabActive]}
            onPress={() => setActiveTab('ufelade')}
          >
            <Text style={[styles.tabText, activeTab === 'ufelade' && styles.tabTextActive]}>
              Ufelade
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'schriibe' ? (
            <>
              <TextInput
                style={styles.textArea}
                value={motivationText}
                onChangeText={(text) => {
                  if (text.length <= MAX_CHARS) setMotivationText(text);
                }}
                placeholder="Schriib do din Motivationstext..."
                placeholderTextColor={colors.textTertiary}
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {motivationText.length} / {MAX_CHARS} Zeiche
              </Text>

              {/* Hints */}
              <View style={styles.hintsCard}>
                <Text style={styles.hintsTitle}>Was chan ich schriibe?</Text>
                <Text style={styles.hintItem}>- Warum suechi ich e Lehrstell?</Text>
                <Text style={styles.hintItem}>- Was sind mini Stärke?</Text>
                <Text style={styles.hintItem}>- Was motiviert mich?</Text>
                <Text style={styles.hintItem}>- Was sind mini Ziil?</Text>
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={handlePickDocument}
                activeOpacity={0.7}
              >
                {uploadedFile ? (
                  <View style={styles.uploadedFileInfo}>
                    <Text style={styles.uploadIcon}>
                      {uploadedFile.mimeType === 'application/pdf' ? '📄' : '🖼️'}
                    </Text>
                    <Text style={styles.uploadedFileName} numberOfLines={2}>
                      {uploadedFile.name}
                    </Text>
                    <Text style={styles.uploadChangeText}>Anderi Datei wähle</Text>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Text style={styles.uploadIcon}>📎</Text>
                    <Text style={styles.uploadText}>Datei uswähle</Text>
                    <Text style={styles.uploadHint}>PDF, JPG oder PNG (max. 5 MB)</Text>
                  </View>
                )}
              </TouchableOpacity>

              {isUploading && (
                <View style={styles.uploadingIndicator}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.uploadingText}>Wird ufeglade...</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Spoeter usfuelle</Text>
          </TouchableOpacity>
          <Button
            title="Fertig"
            onPress={handleSubmit}
            loading={isSubmitting}
            variant="primary"
            disabled={!hasContent}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
  },
  backText: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  header: {
    paddingTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  stepLabel: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.secondaryBackground,
    borderRadius: borderRadius.sm,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: borderRadius.sm - 4,
  },
  tabActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  tabText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: fontWeights.semiBold,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingBottom: spacing.lg,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: typography.body,
    color: colors.text,
    minHeight: 180,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  hintsCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  hintsTitle: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  hintItem: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  uploadArea: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  uploadText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  uploadHint: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  uploadedFileInfo: {
    alignItems: 'center',
  },
  uploadedFileName: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  uploadChangeText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  uploadingText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  footer: {
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
});
