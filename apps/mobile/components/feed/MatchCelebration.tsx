import React, { useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  colors,
  fontWeights,
  typography,
  borderRadius,
  shadows,
  spacing,
  animations,
} from '../../constants/theme';

interface MatchCelebrationProps {
  visible: boolean;
  companyName: string;
  listingTitle: string;
  compatibilityScore?: number;
  onDismiss: () => void;
  onPrepareBewerbung?: () => void;
}

export default function MatchCelebration({
  visible,
  companyName,
  listingTitle,
  compatibilityScore,
  onDismiss,
  onPrepareBewerbung,
}: MatchCelebrationProps) {
  const overlayOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(40);
  const buttonsOpacity = useSharedValue(0);

  // Store latest callback in ref so reanimated worklet always calls the current version
  const prepareBewerbungRef = useRef(onPrepareBewerbung);
  prepareBewerbungRef.current = onPrepareBewerbung;

  const callPrepareBewerbung = useCallback(() => {
    prepareBewerbungRef.current?.();
  }, []);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = 0;
      contentScale.value = 0.8;
      contentOpacity.value = 0;
      buttonsTranslateY.value = 40;
      buttonsOpacity.value = 0;

      // Background fade in
      overlayOpacity.value = withTiming(1, { duration: animations.timing.normal });

      // Content: scale + opacity at 100ms (matches SwiftUI matchCelebration delay 0.1)
      contentOpacity.value = withDelay(
        100,
        withSpring(1, animations.spring.celebration)
      );
      contentScale.value = withDelay(
        100,
        withSpring(1, animations.spring.celebration)
      );

      // Buttons: slide up at 600ms (matches SwiftUI standard delay 0.6)
      buttonsOpacity.value = withDelay(600, withTiming(1, { duration: animations.timing.normal }));
      buttonsTranslateY.value = withDelay(
        600,
        withSpring(0, animations.spring.celebration)
      );
    } else {
      overlayOpacity.value = 0;
      contentOpacity.value = 0;
      contentScale.value = 0.8;
      buttonsOpacity.value = 0;
      buttonsTranslateY.value = 40;
    }
  }, [visible]);

  // Fade out overlay, then call onPrepareBewerbung after animation completes
  const handlePreparePress = useCallback(() => {
    if (!onPrepareBewerbung) {
      onDismiss();
      return;
    }
    // Fade out content and overlay on the UI thread
    contentOpacity.value = withTiming(0, { duration: 150 });
    buttonsOpacity.value = withTiming(0, { duration: 150 });
    overlayOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        // Once visually gone, call the parent to dismiss modal + navigate
        runOnJS(callPrepareBewerbung)();
      }
    });
  }, [onPrepareBewerbung, onDismiss, callPrepareBewerbung]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const buttonsAnimStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const companyInitial = (companyName || '?').charAt(0).toUpperCase();

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={styles.dismissArea} onPress={onDismiss} />

        <View style={styles.layout}>
          {/* Content section (matches SwiftUI showContent block) */}
          <Animated.View style={[styles.contentSection, contentAnimStyle]}>
            {/* Heart icon with red gradient (matches SwiftUI heart.fill 80pt) */}
            <View style={styles.heartContainer}>
              <Text style={styles.heartIcon}>♥</Text>
            </View>

            <Text style={styles.title}>Interessiert!</Text>

            <Text style={styles.subtitle}>
              Du hast Interesse an dieser Lehrstelle gezeigt!
            </Text>

            {/* Company info card (matches SwiftUI HStack with avatar) */}
            <View style={styles.companyCard}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{companyInitial}</Text>
              </LinearGradient>

              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{companyName}</Text>
                <Text style={styles.listingTitle}>{listingTitle}</Text>
              </View>

              {compatibilityScore != null && (
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{Math.round(compatibilityScore)}%</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Buttons section (matches SwiftUI showButtons block) */}
          <Animated.View style={[styles.buttonsSection, buttonsAnimStyle]}>
            {/* Primary: Bewerbung vorbereiten (filled) */}
            <Pressable style={styles.primaryButton} onPress={handlePreparePress}>
              <Text style={styles.primaryButtonText}>Bewerbung vorbereiten</Text>
            </Pressable>

            {/* Tertiary: Weiter swipen (text) */}
            <Pressable onPress={onDismiss}>
              <Text style={styles.textButton}>Weiter swipen</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  layout: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  contentSection: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  heartContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 80,
    color: '#FF3B30',
  },
  title: {
    fontSize: 36,
    fontWeight: fontWeights.extraBold,
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    width: '100%',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: typography.h4,
    fontWeight: fontWeights.semiBold,
    color: colors.white,
  },
  listingTitle: {
    fontSize: typography.bodySmall,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  scoreBadge: {
    backgroundColor: colors.compatibilityHigh,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  buttonsSection: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingVertical: 14,
    ...shadows.card,
  },
  primaryButtonText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.white,
  },
  outlinedButton: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  outlinedButtonText: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.white,
  },
  textButton: {
    fontSize: typography.bodySmall,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
