import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import type { ListingWithScoreDTO } from '@lehrstellen/shared';
import ScoreRing from '../ui/ScoreRing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeCardProps {
  listing: ListingWithScoreDTO;
}

export default function SwipeCard({ listing }: SwipeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>
              {listing.companyName.charAt(0)}
            </Text>
          </View>
          <View style={styles.companyText}>
            <Text style={styles.companyName}>{listing.companyName}</Text>
            <Text style={styles.location}>
              {listing.city}, {listing.canton}
            </Text>
          </View>
        </View>
        <ScoreRing score={listing.compatibilityScore} size={60} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{listing.title}</Text>

        <View style={styles.tags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{listing.field}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{listing.durationYears} Jahre</Text>
          </View>
          {listing.spotsAvailable > 1 && (
            <View style={[styles.tag, styles.tagHighlight]}>
              <Text style={[styles.tagText, styles.tagHighlightText]}>
                {listing.spotsAvailable} Plaetze
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={6}>
          {listing.description}
        </Text>
      </View>

      <View style={styles.footer}>
        {listing.scoreBreakdown.map((item) => (
          <View key={item.label} style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>{item.label}</Text>
            <View style={styles.breakdownBar}>
              <View
                style={[styles.breakdownFill, { width: `${item.score}%` }]}
              />
            </View>
            <Text style={styles.breakdownScore}>{item.score}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  companyText: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  location: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  body: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  tagHighlight: {
    backgroundColor: '#4CAF5020',
  },
  tagHighlightText: {
    color: '#4CAF50',
  },
  description: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 22,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    gap: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#999999',
    width: 90,
  },
  breakdownBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 3,
  },
  breakdownScore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    width: 35,
    textAlign: 'right',
  },
});
