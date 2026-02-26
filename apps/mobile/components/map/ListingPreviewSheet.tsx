import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { ListingDTO } from '@lehrstellen/shared';
import { getCategoryColor, getCategoryIcon } from '../../constants/mapCategories';
import CompatibilityBadge from '../ui/CompatibilityBadge';
import { useCommuteCalculation } from '../../hooks/queries/useCommute';
import { useProfileBuilderStore } from '../../stores/profileBuilder.store';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../constants/theme';

interface Props {
  listing: ListingDTO;
  onClose: () => void;
  onViewDetail: () => void;
}

const SHEET_HEIGHT = 390;
const TAB_BAR_HEIGHT = 72;

export default function ListingPreviewSheet({ listing, onClose, onViewDetail }: Props) {
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

  const categoryColor = getCategoryColor(listing.field);
  const score = (listing as any).compatibilityScore;
  const initial = (listing.companyName || '?')[0].toUpperCase();
  const educationType = (listing as any).educationType;

  const studentCity = useProfileBuilderStore((s) => s.city);
  const studentCanton = useProfileBuilderStore((s) => s.canton);
  const studentOrigin = (studentCity || studentCanton)
    ? { city: studentCity, canton: studentCanton }
    : null;
  const { data: commute } = useCommuteCalculation(
    studentOrigin,
    { city: listing.city, canton: listing.canton },
  );

  return (
    <Animated.View
      style={[styles.container, { paddingBottom: insets.bottom + TAB_BAR_HEIGHT, transform: [{ translateY }] }]}
    >
      {/* Drag handle */}
      <Pressable onPress={handleClose} style={styles.handleArea}>
        <View style={styles.handle} />
      </Pressable>

      {/* Header row: avatar + text + badge */}
      <View style={styles.headerRow}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </LinearGradient>

        <View style={styles.headerText}>
          <Text style={styles.companyName} numberOfLines={1}>
            {listing.companyName}
          </Text>
          <Text style={styles.berufTitle} numberOfLines={1}>
            {listing.title}
          </Text>
        </View>

        {score != null && score > 0 && (
          <CompatibilityBadge score={Math.round(score)} size="sm" />
        )}
      </View>

      {/* Info row: location + education type */}
      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>📍</Text>
        <Text style={styles.infoText}>
          {listing.city}{listing.canton ? `, ${listing.canton}` : ''}
        </Text>
        {educationType ? (
          <>
            <Text style={styles.infoIcon}>🎓</Text>
            <Text style={styles.infoText}>{educationType}</Text>
          </>
        ) : null}
      </View>

      {/* Commute indicator */}
      {commute && (
        <View style={styles.commuteRow}>
          <Text style={styles.commuteText}>
            🚆 {commute.transitMinutes} min · 🚲 {commute.bikeMinutes} min
          </Text>
        </View>
      )}

      {/* Action button */}
      <View style={styles.buttonsRow}>
        <Pressable style={styles.primaryButton} onPress={handleViewDetail}>
          <Text style={styles.primaryButtonText}>Mehr anzeigen</Text>
        </Pressable>
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
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.textTertiary,
  },

  // Header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  headerText: {
    flex: 1,
  },
  companyName: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  berufTitle: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: fontWeights.medium,
    marginTop: 2,
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  infoIcon: {
    fontSize: typography.caption,
  },
  infoText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },

  // Commute
  commuteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  commuteText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },

  // Buttons
  buttonsRow: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
});
