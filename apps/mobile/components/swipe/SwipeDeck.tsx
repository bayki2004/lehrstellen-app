import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Alert,
} from 'react-native';
import type { ListingWithScoreDTO } from '@lehrstellen/shared';
import SwipeCard from './SwipeCard';
import { useFeedStore } from '../../stores/feed.store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;

interface SwipeDeckProps {
  cards: ListingWithScoreDTO[];
  onEmpty?: () => void;
}

export default function SwipeDeck({ cards, onEmpty }: SwipeDeckProps) {
  const { swipe, nextCard } = useFeedStore();
  const position = useRef(new Animated.ValueXY()).current;
  const cardKey = useRef(cards[0]?.id ?? '');

  // Reset position when top card changes
  useEffect(() => {
    const newKey = cards[0]?.id ?? '';
    if (newKey !== cardKey.current) {
      cardKey.current = newKey;
      position.setValue({ x: 0, y: 0 });
    }
  }, [cards[0]?.id]);

  const handleSwipeComplete = async (direction: 'LEFT' | 'RIGHT') => {
    const card = cards[0];
    if (!card) return;
    // Optimistically advance
    nextCard();
    position.setValue({ x: 0, y: 0 });
    try {
      const result = await swipe(direction, card.id);
      if (result?.isMatch) {
        Alert.alert(
          'Es ist ein Match! 🎉',
          `Du hast mit ${card.companyName} gematcht!`,
          [{ text: 'Super!' }],
        );
      }
    } catch {
      // failed silently
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.4 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH * 1.5, y: gesture.dy },
            duration: 250,
            useNativeDriver: true,
          }).start(() => handleSwipeComplete('RIGHT'));
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH * 1.5, y: gesture.dy },
            duration: 250,
            useNativeDriver: true,
          }).start(() => handleSwipeComplete('LEFT'));
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [1, 0.95, 1],
    extrapolate: 'clamp',
  });

  if (cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎓</Text>
        <Text style={styles.emptyTitle}>Alles gesehen!</Text>
        <Text style={styles.emptyText}>
          Du hast alle verfügbaren Lehrstellen angesehen. Schau später wieder vorbei!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Next card (behind) */}
      {cards.length > 1 && (
        <Animated.View
          style={[styles.cardWrapper, styles.nextCard, { transform: [{ scale: nextCardScale }] }]}
        >
          <SwipeCard listing={cards[1]} />
        </Animated.View>
      )}

      {/* Top card (swipeable) */}
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <SwipeCard listing={cards[0]} />

        {/* Like overlay */}
        <Animated.View style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>

        {/* Nope overlay */}
        <Animated.View style={[styles.overlay, styles.nopeOverlay, { opacity: nopeOpacity }]}>
          <Text style={styles.nopeText}>NOPE</Text>
        </Animated.View>
      </Animated.View>
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
  likeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4CAF50',
  },
  nopeText: {
    fontSize: 28,
    fontWeight: '800',
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
