import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../../../../services/api';
import { CANTON_COORDINATES } from '../../../../constants/cantonCoordinates';
import type { ListingDTO } from '@lehrstellen/shared';

let MapView: any = null;
let Marker: any = null;
let Callout: any = null;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Callout = maps.Callout;
} catch {
  // react-native-maps not available (Expo Go)
}

const SWITZERLAND_REGION = {
  latitude: 46.8,
  longitude: 8.2,
  latitudeDelta: 3.5,
  longitudeDelta: 3.5,
};

export default function MapScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/listings');
        const data = (response.data as any).data || response.data;
        setListings(Array.isArray(data) ? data : []);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const getCoords = (listing: ListingDTO) => {
    const canton = listing.canton?.toUpperCase();
    const coords = CANTON_COORDINATES[canton];
    if (!coords) return null;
    const offset = () => (Math.random() - 0.5) * 0.02;
    return {
      latitude: coords.latitude + offset(),
      longitude: coords.longitude + offset(),
    };
  };

  // Group listings by canton for the list fallback
  const groupedByCanton = listings.reduce<Record<string, ListingDTO[]>>((acc, l) => {
    const key = l.canton || 'Andere';
    if (!acc[key]) acc[key] = [];
    acc[key].push(l);
    return acc;
  }, {});

  const cantonSections = Object.entries(groupedByCanton).sort(([a], [b]) => a.localeCompare(b));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Karte</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      </SafeAreaView>
    );
  }

  // If react-native-maps is available, show the map
  if (MapView) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Karte</Text>
          <Text style={styles.count}>{listings.length} Lehrstellen</Text>
        </View>
        <MapView style={styles.map} initialRegion={SWITZERLAND_REGION}>
          {listings.map((listing) => {
            const coords = getCoords(listing);
            if (!coords) return null;
            return (
              <Marker key={listing.id} coordinate={coords} pinColor="#4A90E2">
                <Callout onPress={() => router.push(`/(app)/(student)/listing/${listing.id}` as any)}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle} numberOfLines={1}>
                      {listing.title}
                    </Text>
                    <Text style={styles.calloutCompany} numberOfLines={1}>
                      {listing.companyName}
                    </Text>
                    <Text style={styles.calloutLocation}>
                      {listing.city}, {listing.canton}
                    </Text>
                    <Text style={styles.calloutCta}>Details anzeigen →</Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      </SafeAreaView>
    );
  }

  // Fallback: list grouped by canton
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Karte</Text>
        <Text style={styles.count}>{listings.length} Lehrstellen</Text>
      </View>
      <View style={styles.fallbackBanner}>
        <Text style={styles.fallbackText}>
          Kartenansicht benötigt einen Development Build. Lehrstellen nach Kanton:
        </Text>
      </View>
      <FlatList
        data={cantonSections}
        keyExtractor={([canton]) => canton}
        contentContainerStyle={styles.list}
        renderItem={({ item: [canton, items] }) => (
          <View style={styles.cantonSection}>
            <View style={styles.cantonHeader}>
              <Text style={styles.cantonCode}>{canton}</Text>
              <Text style={styles.cantonCount}>{items.length} Stellen</Text>
            </View>
            {items.map((listing) => (
              <TouchableOpacity
                key={listing.id}
                style={styles.listingRow}
                onPress={() => router.push(`/(app)/(student)/listing/${listing.id}` as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.listingTitle} numberOfLines={1}>{listing.title}</Text>
                <Text style={styles.listingCompany} numberOfLines={1}>
                  {listing.companyName} - {listing.city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  count: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callout: {
    width: 200,
    padding: 4,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  calloutCompany: {
    fontSize: 13,
    color: '#4A90E2',
    marginTop: 2,
  },
  calloutLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  calloutCta: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    marginTop: 6,
  },
  fallbackBanner: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  fallbackText: {
    fontSize: 13,
    color: '#E65100',
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  cantonSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cantonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cantonCode: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4A90E2',
  },
  cantonCount: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  listingRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  listingCompany: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 1,
  },
});
