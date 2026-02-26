import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ListingWithScoreDTO } from '@lehrstellen/shared';
import { useRouter } from 'expo-router';
import SwipeCard from './SwipeCard';
import ActionButtons from '../feed/ActionButtons';
import MatchCelebration from '../feed/MatchCelebration';
import { useSwipe } from '../../hooks/queries/useFeed';
import { colors, fontWeights, typography, spacing } from '../../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

interface SwipeDeckProps {
  cards: ListingWithScoreDTO[];
  onCardSwiped?: () => void;
  onEmpty?: () => void;
  favoriteBerufe?: string[];
}

export default function SwipeDeck({ cards, onCardSwiped, onEmpty, favoriteBerufe }: SwipeDeckProps) {
  const swipeMutation = useSwipe();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [matchInfo, setMatchInfo] = useState<{
    companyName: string;
    title: string;
    compatibilityScore?: number;
    matchId?: string;
  } | null>(null);

  const handleSwipeComplete = async (direction: 'LEFT' | 'RIGHT' | 'SUPER') => {
    try {
      const card = cards[0];
      if (!card) return;
      const apiDirection = direction === 'SUPER' ? 'RIGHT' : direction;
      const result = await swipeMutation.mutateAsync({ listingId: card.id, direction: apiDirection });
      onCardSwiped?.();
      translateX.value = 0;
      translateY.value = 0;
      if (result?.isMatch) {
        setMatchInfo({
          companyName: card.companyName,
          title: card.title,
          compatibilityScore: card.compatibilityScore,
          matchId: result.matchId,
        });
      }
    } catch {
      onCardSwiped?.();
      translateX.value = 0;
      translateY.value = 0;
    }
  };

  const handleCardPress = () => {
    const card = cards[0];
    if (card) {
      router.push(`/feed/${card.id}`);
    }
  };

  const programmaticSwipe = (direction: 'LEFT' | 'RIGHT' | 'SUPER') => {
    if (direction === 'SUPER') {
      translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 300 });
    } else if (direction === 'RIGHT') {
      translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
    } else {
      translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
    }
    runOnJS(handleSwipeComplete)(direction);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationY < -SWIPE_THRESHOLD) {
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 300 });
        runOnJS(handleSwipeComplete)('SUPER');
      } else if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(handleSwipeComplete)('RIGHT');
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(handleSwipeComplete)('LEFT');
      } else {
        translateX.value = withSpring(0, { damping: 14, stiffness: 200, mass: 0.8 });
        translateY.value = withSpring(0, { damping: 14, stiffness: 200, mass: 0.8 });
      }
    });

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      runOnJS(handleCardPress)();
    });

  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  const topCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          [-15, 0, 15],
        )}deg`,
      },
    ],
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          Math.max(Math.abs(translateX.value), Math.abs(translateY.value)),
          [0, SWIPE_THRESHOLD],
          [0.92, 1],
          'clamp',
        ),
      },
    ],
    opacity: interpolate(
      Math.max(Math.abs(translateX.value), Math.abs(translateY.value)),
      [0, SWIPE_THRESHOLD],
      [0.6, 1],
      'clamp',
    ),
  }));

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], 'clamp'),
  }));

  const nopeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], 'clamp'),
  }));

  const superOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [-SWIPE_THRESHOLD, 0], [1, 0], 'clamp'),
  }));

  if (cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎓</Text>
        <Text style={styles.emptyTitle}>Keine neuen Lehrstellen</Text>
        <Text style={styles.emptyText}>
          Schau morgen wieder vorbei oder passe deine Filter an.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Card area */}
      <View style={styles.cardArea}>
        {/* Next card (behind) */}
        {cards.length > 1 && (
          <Animated.View style={[styles.cardWrapper, styles.nextCard, nextCardStyle]}>
            <SwipeCard listing={cards[1]} favoriteBerufe={favoriteBerufe} />
          </Animated.View>
        )}

        {/* Top card (swipeable) */}
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.cardWrapper, topCardStyle]}>
            <SwipeCard listing={cards[0]} favoriteBerufe={favoriteBerufe} />

            {/* LIKE overlay */}
            <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
              <Text style={[styles.overlayText, styles.likeText]}>LIKE</Text>
            </Animated.View>

            {/* NOPE overlay */}
            <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeOverlayStyle]}>
              <Text style={[styles.overlayText, styles.nopeText]}>NOPE</Text>
            </Animated.View>

            {/* SUPER overlay */}
            <Animated.View style={[styles.overlay, styles.superOverlay, superOverlayStyle]}>
              <Text style={[styles.overlayText, styles.superText]}>SUPER</Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Action buttons — below card, not overlapping */}
      {cards.length > 0 && (
        <View style={[styles.actionRow, { paddingBottom: insets.bottom + 70 }]}>
          <ActionButtons
            onReject={() => programmaticSwipe('LEFT')}
            onLike={() => programmaticSwipe('RIGHT')}
          />
          <Text style={styles.swipeCounter}>
            {cards.length} Swipes übrig heute
          </Text>
        </View>
      )}

      {/* Match celebration modal */}
      <MatchCelebration
        visible={!!matchInfo}
        companyName={matchInfo?.companyName ?? ''}
        listingTitle={matchInfo?.title ?? ''}
        compatibilityScore={matchInfo?.compatibilityScore}
        onDismiss={() => setMatchInfo(null)}
        onPrepareBewerbung={() => {
          if (matchInfo?.matchId) {
            const id = matchInfo.matchId;
            setMatchInfo(null);
            router.push(`/(app)/(student)/bewerbungen/prepare/${id}` as any);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'absolute',
  },
  nextCard: {
    zIndex: -1,
  },
  overlay: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 4,
  },
  likeOverlay: {
    top: 32,
    left: 32,
    borderColor: colors.swipeRight,
    transform: [{ rotate: '-15deg' }],
  },
  nopeOverlay: {
    top: 32,
    right: 32,
    borderColor: colors.swipeLeft,
    transform: [{ rotate: '15deg' }],
  },
  superOverlay: {
    top: 48,
    alignSelf: 'center',
    left: 0,
    right: 0,
    borderColor: colors.superLike,
    alignItems: 'center',
    borderWidth: 0,
  },
  overlayText: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
  },
  likeText: {
    color: colors.swipeRight,
  },
  nopeText: {
    color: colors.swipeLeft,
  },
  superText: {
    color: colors.superLike,
  },
  actionRow: {
    alignItems: 'center',
    zIndex: 10,
  },
  swipeCounter: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
