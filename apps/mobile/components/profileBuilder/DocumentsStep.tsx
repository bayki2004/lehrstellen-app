import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useProfileBuilderStore } from '../../stores/profileBuilder.store';
import type { Zeugnis } from '../../types/profile.types';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../constants/theme';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeBadge(type: string): { label: string; color: string } {
  if (type === 'application/pdf') return { label: 'PDF', color: colors.error };
  if (type === 'image/jpeg') return { label: 'JPG', color: colors.primary };
  if (type === 'image/png') return { label: 'PNG', color: colors.success };
  return { label: 'FILE', color: colors.textSecondary };
}

export default function DocumentsStep() {
  const { documents, addDocument, removeDocument } = useProfileBuilderStore();

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      if (file.size && file.size > MAX_FILE_SIZE) {
        Alert.alert(
          'Datei zu gross',
          `Die maximale Dateigrösse beträgt 10 MB. Deine Datei ist ${formatFileSize(file.size)}.`
        );
        return;
      }

      const doc: Zeugnis = {
        id: Math.random().toString(36).substring(2, 11),
        fileName: file.name,
        fileType: file.mimeType || 'application/octet-stream',
        fileSize: file.size || 0,
        url: file.uri,
        uploadedAt: new Date().toISOString(),
      };

      addDocument(doc);
    } catch (error) {
      Alert.alert('Fehler', 'Das Dokument konnte nicht ausgewählt werden.');
    }
  };

  const handleRemove = (index: number) => {
    Alert.alert(
      'Dokument entfernen',
      `"${documents[index].fileName}" wirklich entfernen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Entfernen',
          style: 'destructive',
          onPress: () => removeDocument(index),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {documents.length === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.docIconContainer}>
            <Text style={styles.docIcon}>{'[doc]'}</Text>
          </View>
          <Text style={styles.emptyTitle}>Noch keine Dokumente</Text>
          <Text style={styles.emptySubtitle}>
            Lade deine Zeugnisse, Lebenslauf oder andere relevante Dokumente
            hoch.
          </Text>
        </View>
      )}

      {documents.map((doc, index) => {
        const badge = getFileTypeBadge(doc.fileType);
        return (
          <View key={doc.id} style={styles.docCard}>
            <View style={[styles.typeBadge, { backgroundColor: badge.color + '20' }]}>
              <Text style={[styles.typeBadgeText, { color: badge.color }]}>
                {badge.label}
              </Text>
            </View>

            <View style={styles.docInfo}>
              <Text style={styles.docName} numberOfLines={1}>
                {doc.fileName}
              </Text>
              <Text style={styles.docSize}>{formatFileSize(doc.fileSize)}</Text>
            </View>

            <Pressable
              style={styles.removeButton}
              onPress={() => handleRemove(index)}
              hitSlop={8}
            >
              <Text style={styles.removeButtonText}>X</Text>
            </Pressable>
          </View>
        );
      })}

      <Pressable style={styles.uploadButton} onPress={handlePickDocument}>
        <Text style={styles.uploadIcon}>+</Text>
        <Text style={styles.uploadButtonText}>Dokument hochladen</Text>
      </Pressable>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Akzeptierte Formate</Text>
        <View style={styles.formatRow}>
          <View style={[styles.formatBadge, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.formatBadgeText, { color: colors.error }]}>PDF</Text>
          </View>
          <View style={[styles.formatBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.formatBadgeText, { color: colors.primary }]}>JPEG</Text>
          </View>
          <View style={[styles.formatBadge, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.formatBadgeText, { color: colors.success }]}>PNG</Text>
          </View>
        </View>
        <Text style={styles.infoText}>Maximale Dateigrösse: 10 MB</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  docIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  docIcon: {
    fontSize: typography.h2,
    color: colors.primary,
  },
  emptyTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },

  // Document card
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 4,
    ...shadows.sm,
    gap: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    minWidth: 44,
    alignItems: 'center',
  },
  typeBadgeText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  docSize: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.errorLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.bold,
    color: colors.error,
  },

  // Upload button
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  uploadIcon: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  uploadButtonText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
  },

  // Info card
  infoCard: {
    backgroundColor: colors.primaryLight + '10',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  formatRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  formatBadge: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  formatBadgeText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
  },
  infoText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
});
