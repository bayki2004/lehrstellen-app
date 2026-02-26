import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Berufsschule } from '../../types/beruf.types';
import { MAP_SCHOOL_COLOR } from '../../constants/mapCategories';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../constants/theme';

interface Props {
  school: Berufsschule;
  onClose: () => void;
  onViewDetail: () => void;
}

const SHEET_HEIGHT = 300;
const TAB_BAR_HEIGHT = 72;

export default function BerufsschulePreviewSheet({ school, onClose, onViewDetail }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleViewDetail = () => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onViewDetail());
  };

  const handleWebsite = () => {
    if (school.website) {
      Linking.openURL(school.website).catch(() => {});
    }
  };

  return (
    <Animated.View
      style={[styles.container, { paddingBottom: insets.bottom + TAB_BAR_HEIGHT, transform: [{ translateY }] }]}
    >
      {/* Drag handle */}
      <Pressable onPress={handleClose} style={styles.handleArea}>
        <View style={styles.handle} />
      </Pressable>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🎓</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.schoolName} numberOfLines={2}>
              {school.name}
            </Text>
            <Text style={styles.location}>
              {school.address || school.city}, {school.canton}
            </Text>
          </View>
        </View>

        {/* Specializations / Programs */}
        {school.specializations && school.specializations.length > 0 && (
          <View style={styles.programsSection}>
            <Text style={styles.sectionLabel}>Programme</Text>
            <View style={styles.programsRow}>
              {school.specializations.map((spec) => (
                <View key={spec} style={styles.programChip}>
                  <Text style={styles.programChipText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.buttonsRow}>
          <Pressable style={styles.detailButton} onPress={handleViewDetail}>
            <Text style={styles.detailButtonText}>Mehr anzeigen</Text>
          </Pressable>
          {school.website && (
            <Pressable style={styles.websiteButton} onPress={handleWebsite}>
              <Text style={styles.websiteText}>Website</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.elevated,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  content: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MAP_SCHOOL_COLOR + '20',
    borderWidth: 2,
    borderColor: MAP_SCHOOL_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  schoolName: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  location: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  programsSection: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  programsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  programChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: MAP_SCHOOL_COLOR + '15',
    borderWidth: 1,
    borderColor: MAP_SCHOOL_COLOR + '40',
  },
  programChipText: {
    fontSize: typography.caption,
    color: MAP_SCHOOL_COLOR,
    fontWeight: fontWeights.medium,
  },
  buttonsRow: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  detailButton: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  websiteButton: {
    backgroundColor: MAP_SCHOOL_COLOR,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  websiteText: {
    color: colors.white,
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.bold,
  },
});
