import React from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import type { ListingWithScoreDTO } from '@lehrstellen/shared';
import SwipeCard from './SwipeCard';
import { useFeedStore } from '../../stores/feed.store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

interface SwipeDeckProps {
  cards: ListingWithScoreDTO[];
  onEmpty?: () => void;
}

export default function SwipeDeck({ cards, onEmpty }: SwipeDeckProps) {
  const { swipe } = useFeedStore();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleSwipeComplete = async (direction: 'LEFT' | 'RIGHT') => {
    try {
      const card = cards[0];
      if (!card) return;
      const result = await swipe(direction, card.id);
      if (result?.isMatch) {
        Alert.alert(
          'Es ist ein Match! 🎉',
          `Du hast mit ${card.companyName} gematcht!`,
          [{ text: 'Super!' }],
        );
      }
    } catch {
      // swipe failed silently
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.5;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(handleSwipeComplete)('RIGHT');
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(handleSwipeComplete)('LEFT');
      } else {
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

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
          Math.abs(translateX.value),
          [0, SWIPE_THRESHOLD],
          [0.95, 1],
          'clamp',
        ),
      },
    ],
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.7, 1],
      'clamp',
    ),
  }));

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], 'clamp'),
  }));

  const nopeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], 'clamp'),
  }));

  if (cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎓</Text>
        <Text style={styles.emptyTitle}>Alles gesehen!</Text>
        <Text style={styles.emptyText}>
          Du hast alle verfuegbaren Lehrstellen angesehen. Schau spaeter wieder vorbei!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Next card (behind) */}
      {cards.length > 1 && (
        <Animated.View style={[styles.cardWrapper, styles.nextCard, nextCardStyle]}>
          <SwipeCard listing={cards[1]} />
        </Animated.View>
      )}

      {/* Top card (swipeable) */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.cardWrapper, topCardStyle]}>
          <SwipeCard listing={cards[0]} />

          {/* Like overlay */}
          <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
            <Text style={styles.overlayText}>LIKE</Text>
          </Animated.View>

          {/* Nope overlay */}
          <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeOverlayStyle]}>
            <Text style={[styles.overlayText, styles.nopeText]}>NOPE</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    top: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
  },
  likeOverlay: {
    right: 20,
    borderColor: '#4CAF50',
    transform: [{ rotate: '-15deg' }],
  },
  nopeOverlay: {
    left: 20,
    borderColor: '#E53935',
    transform: [{ rotate: '15deg' }],
  },
  overlayText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4CAF50',
  },
  nopeText: {
    color: '#E53935',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
