import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeDeck from '../../../../components/swipe/SwipeDeck';
import { useFeedStore } from '../../../../stores/feed.store';

export default function FeedScreen() {
  const { cards, currentIndex, isLoading, error, fetchFeed } = useFeedStore();
  const visibleCards = cards.slice(currentIndex);

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>Lehrstellen</Text>
        <Text style={styles.subtitle}>Entdecke deine Zukunft</Text>
      </View>

      <View style={styles.deckContainer}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Lehrstellen werden geladen...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorEmoji}>😕</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText} onPress={fetchFeed}>
              Erneut versuchen
            </Text>
          </View>
        ) : (
          <SwipeDeck cards={visibleCards} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4A90E2',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  deckContainer: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
});
