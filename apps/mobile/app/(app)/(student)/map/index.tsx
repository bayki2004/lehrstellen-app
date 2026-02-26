import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../../../constants/theme';
import {
  getCategoryColor,
  getCategoryIcon,
  MAP_CATEGORIES,
} from '../../../../constants/mapCategories';
import {
  useMapListings,
  useMapSchools,
  getListingCoordinate,
  getSchoolCoordinate,
} from '../../../../hooks/queries/useMap';
import MapFilterScreen from '../../../../components/map/MapFilterScreen';
import type { MapFilters } from '../../../../components/map/MapFilterScreen';
import ListingPreviewSheet from '../../../../components/map/ListingPreviewSheet';
import BerufsschulePreviewSheet from '../../../../components/map/BerufsschulePreviewSheet';
import { CANTON_COORDINATES } from '../../../../constants/cantonCoordinates';
import { useProfileBuilderStore } from '../../../../stores/profileBuilder.store';
import type { ListingDTO } from '@lehrstellen/shared';
import type { Berufsschule } from '../../../../types/beruf.types';

// Haversine distance in km between two lat/lng points
function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Dynamic import for react-native-maps + clustering ──
let ClusteredMapView: any = null;
let MarkerComponent: any = null;
try {
  ClusteredMapView = require('react-native-map-clustering').default;
  MarkerComponent = require('react-native-maps').Marker;
} catch {
  // not available in Expo Go
}

const SWITZERLAND_REGION = {
  latitude: 46.8,
  longitude: 8.2,
  latitudeDelta: 3.5,
  longitudeDelta: 3.5,
};

// ── Main screen ──────────────────────────────────────────────────────

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingDTO | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<Berufsschule | null>(null);

  // All filter state
  const defaultFilters: MapFilters = {
    selectedCategories: MAP_CATEGORIES.map((c) => c.key),
    showSchools: false,
    radiusKm: 50,
    selectedCantons: [],
    selectedDurations: [],
    selectedSchoolLevels: [],
  };
  const [filters, setFilters] = useState<MapFilters>(defaultFilters);

  const studentCanton = useProfileBuilderStore((s) => s.canton);
  const studentCoord = studentCanton ? CANTON_COORDINATES[studentCanton] : null;

  const { data: listings = [], isLoading: listingsLoading } = useMapListings();
  const { data: schools = [], isLoading: schoolsLoading } = useMapSchools();
  const isLoading = listingsLoading || schoolsLoading;

  const handleUpdateFilters = useCallback((partial: Partial<MapFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const selectListing = useCallback((listing: ListingDTO | null) => {
    setSelectedListing(listing);
    setSelectedSchool(null);
  }, []);

  const selectSchool = useCallback((school: Berufsschule | null) => {
    setSelectedSchool(school);
    setSelectedListing(null);
  }, []);

  // Count active filters (deviations from default)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.selectedCategories.length < MAP_CATEGORIES.length) count++;
    if (filters.showSchools) count++;
    if (filters.radiusKm !== defaultFilters.radiusKm) count++;
    if (filters.selectedCantons.length > 0) count++;
    if (filters.selectedDurations.length > 0) count++;
    if (filters.selectedSchoolLevels.length > 0) count++;
    return count;
  }, [filters]);

  const listingsWithCoords = useMemo(() => {
    return listings
      .map((listing) => {
        const coords = getListingCoordinate(listing);
        if (!coords) return null;
        return { ...listing, _lat: coords.latitude, _lng: coords.longitude };
      })
      .filter(Boolean)
      .filter((listing) => {
        const l = listing as ListingDTO & { _lat: number; _lng: number };

        // Category filter
        if (
          filters.selectedCategories.length > 0 &&
          filters.selectedCategories.length < MAP_CATEGORIES.length &&
          !filters.selectedCategories.includes(l.field)
        ) return false;

        // Canton filter
        if (
          filters.selectedCantons.length > 0 &&
          !filters.selectedCantons.includes(l.canton)
        ) return false;

        // Duration filter
        if (
          filters.selectedDurations.length > 0 &&
          !filters.selectedDurations.includes(l.durationYears)
        ) return false;

        // School level filter
        if (
          filters.selectedSchoolLevels.length > 0 &&
          l.requiredSchoolLevel &&
          !filters.selectedSchoolLevels.includes(l.requiredSchoolLevel)
        ) return false;

        // Distance filter (only if student has a location)
        if (studentCoord) {
          const dist = haversineKm(
            studentCoord.latitude, studentCoord.longitude,
            l._lat, l._lng,
          );
          if (dist > filters.radiusKm) return false;
        }

        return true;
      }) as (ListingDTO & { _lat: number; _lng: number })[];
  }, [listings, filters, studentCoord]);

  const schoolsWithCoords = useMemo(() => {
    if (!filters.showSchools) return [];
    return schools
      .map((school) => {
        const coords = getSchoolCoordinate(school);
        if (!coords) return null;
        return { ...school, _lat: coords.latitude, _lng: coords.longitude };
      })
      .filter(Boolean) as (Berufsschule & { _lat: number; _lng: number })[];
  }, [schools, filters.showSchools]);

  const handleListingPress = useCallback(
    (listing: ListingDTO) => {
      selectListing(listing);
    },
    [selectListing],
  );

  const handleSchoolPress = useCallback(
    (school: Berufsschule) => {
      selectSchool(school);
    },
    [selectSchool],
  );

  const handleDismiss = useCallback(() => {
    selectListing(null);
    selectSchool(null);
  }, [selectListing, selectSchool]);

  const handleViewListingDetail = useCallback(() => {
    if (selectedListing) {
      const id = selectedListing.id;
      selectListing(null);
      router.push(`/(app)/(student)/map/${id}`);
    }
  }, [selectedListing, selectListing, router]);

  const handleViewSchoolDetail = useCallback(() => {
    if (selectedSchool) {
      const id = selectedSchool.id;
      selectSchool(null);
      router.push(`/(app)/(student)/map/school/${id}`);
    }
  }, [selectedSchool, selectSchool, router]);

  // Group listings by canton for fallback list
  const cantonSections = useMemo(() => {
    const grouped = listingsWithCoords.reduce<
      Record<string, (ListingDTO & { _lat: number; _lng: number })[]>
    >((acc, l) => {
      const key = l.canton || 'Andere';
      if (!acc[key]) acc[key] = [];
      acc[key].push(l);
      return acc;
    }, {});
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [listingsWithCoords]);

  // ── Loading state ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.fullScreen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Lade Lehrstellen...</Text>
        </View>
      </View>
    );
  }

  // ── Map view (react-native-maps available) ─────────────────────────
  if (ClusteredMapView) {
    return (
      <View style={styles.fullScreen}>
        {/* Full-screen clustered map */}
        <ClusteredMapView
          style={StyleSheet.absoluteFill}
          initialRegion={SWITZERLAND_REGION}
          onPress={(e: any) => {
            if (e.nativeEvent.action !== 'marker-press') {
              handleDismiss();
            }
          }}
          clusterColor={colors.primary}
          clusterTextColor={colors.white}
          radius={60}
          minZoomLevel={6}
          animationEnabled
        >
          {/* Lehrstelle markers */}
          {listingsWithCoords.map((listing, index) => {
            const catColor = getCategoryColor(listing.field);
            const catIcon = getCategoryIcon(listing.field);
            return (
              <MarkerComponent
                key={`${listing.id}-${index}`}
                coordinate={{
                  latitude: listing._lat,
                  longitude: listing._lng,
                }}
                onPress={(e: any) => {
                  e.stopPropagation();
                  handleListingPress(listing);
                }}
                tracksViewChanges={false}
              >
                <View
                  pointerEvents="none"
                  style={[
                    styles.markerCircle,
                    { backgroundColor: catColor },
                  ]}
                >
                  <Text style={styles.markerIcon}>{catIcon}</Text>
                </View>
              </MarkerComponent>
            );
          })}

          {/* Berufsschule markers */}
          {schoolsWithCoords.map((school) => (
            <MarkerComponent
              key={school.id}
              coordinate={{
                latitude: school._lat,
                longitude: school._lng,
              }}
              onPress={(e: any) => {
                e.stopPropagation();
                handleSchoolPress(school);
              }}
              tracksViewChanges={false}
            >
              <View pointerEvents="none" style={styles.schoolMarkerCircle}>
                <Text style={styles.schoolMarkerEmoji}>🎓</Text>
              </View>
            </MarkerComponent>
          ))}
        </ClusteredMapView>

        {/* Floating filter button (top-right) */}
        <View
          style={[styles.filterButtonContainer, { top: insets.top + 8 }]}
          pointerEvents="box-none"
        >
          <View style={styles.filterButtonRow} pointerEvents="box-none">
            {/* Count pill */}
            <View style={styles.countPillInline} pointerEvents="none">
              <Text style={styles.countPillText}>
                {listingsWithCoords.length} Lehrstellen
              </Text>
            </View>

            {/* Filter button */}
            <Pressable
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Text style={styles.filterButtonIcon}>☰</Text>
              <Text style={styles.filterButtonLabel}>Filter</Text>
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Full-screen filter modal */}
        <Modal
          visible={showFilters}
          animationType="slide"
          onRequestClose={() => setShowFilters(false)}
        >
          <MapFilterScreen
            filters={filters}
            onUpdateFilters={handleUpdateFilters}
            onReset={handleResetFilters}
            onClose={() => setShowFilters(false)}
            activeFilterCount={activeFilterCount}
          />
        </Modal>

        {/* Preview sheets */}
        {selectedListing && (
          <ListingPreviewSheet
            listing={selectedListing}
            onClose={() => selectListing(null)}

            onViewDetail={handleViewListingDetail}
          />
        )}
        {selectedSchool && (
          <BerufsschulePreviewSheet
            school={selectedSchool}
            onClose={() => selectSchool(null)}
            onViewDetail={handleViewSchoolDetail}
          />
        )}
      </View>
    );
  }

  // ── Fallback list view (Expo Go) ──────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Karte</Text>
        <Text style={styles.count}>
          {listingsWithCoords.length} Lehrstellen
        </Text>
      </View>

      {/* Filter button for fallback view */}
      <View style={styles.fallbackFilterRow}>
        <Pressable
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonIcon}>☰</Text>
          <Text style={styles.filterButtonLabel}>Filter</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Full-screen filter modal for fallback view */}
      <Modal
        visible={showFilters}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <MapFilterScreen
          filters={filters}
          onUpdateFilters={handleUpdateFilters}
          onReset={handleResetFilters}
          onClose={() => setShowFilters(false)}
          activeFilterCount={activeFilterCount}
        />
      </Modal>

      <View style={styles.fallbackBanner}>
        <Text style={styles.fallbackText}>
          Kartenansicht benötigt einen Development Build. Lehrstellen nach
          Kanton:
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
              <Text style={styles.cantonCount}>
                {items.length} {items.length === 1 ? 'Stelle' : 'Stellen'}
              </Text>
            </View>

            {items.map((listing, index) => {
              const catColor = getCategoryColor(listing.field);
              const catIcon = getCategoryIcon(listing.field);
              return (
                <Pressable
                  key={`${listing.id}-${index}`}
                  style={styles.listingRow}
                  onPress={() => handleListingPress(listing)}
                >
                  <View
                    style={[
                      styles.listDot,
                      { backgroundColor: catColor },
                    ]}
                  />
                  <View style={styles.listingInfo}>
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      {catIcon} {listing.title}
                    </Text>
                    <Text style={styles.listingCompany} numberOfLines={1}>
                      {listing.companyName} - {listing.city}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.listBadge,
                      {
                        backgroundColor: catColor + '18',
                        borderColor: catColor + '40',
                      },
                    ]}
                  >
                    <Text
                      style={[styles.listBadgeText, { color: catColor }]}
                    >
                      {listing.field}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      />

      {filters.showSchools && schoolsWithCoords.length > 0 && (
        <View style={styles.schoolsFallback}>
          <Text style={styles.schoolsFallbackTitle}>Berufsschulen</Text>
          {schoolsWithCoords.map((school) => (
            <Pressable
              key={school.id}
              style={styles.schoolRow}
              onPress={() => handleSchoolPress(school)}
            >
              <Text style={styles.schoolRowEmoji}>🎓</Text>
              <View style={styles.schoolRowInfo}>
                <Text style={styles.schoolRowName} numberOfLines={1}>
                  {school.name}
                </Text>
                <Text style={styles.schoolRowCity}>
                  {school.city}, {school.canton}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {selectedListing && (
        <ListingPreviewSheet
          listing={selectedListing}
          onClose={() => selectListing(null)}
          onViewDetail={handleViewListingDetail}
        />
      )}
      {selectedSchool && (
        <BerufsschulePreviewSheet
          school={selectedSchool}
          onClose={() => selectSchool(null)}
          onViewDetail={handleViewSchoolDetail}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Floating overlays
  filterButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  filterButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  countPillInline: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  countPillText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    color: colors.textSecondary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  filterButtonIcon: {
    fontSize: typography.bodySmall,
    color: colors.text,
  },
  filterButtonLabel: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  filterBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 2,
  },
  filterBadgeText: {
    fontSize: typography.tiny,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },

  // Fallback filter row
  fallbackFilterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },

  // Header (fallback only)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: spacing.lg - 4,
    paddingVertical: spacing.sm + 4,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: fontWeights.extraBold,
    color: colors.text,
  },
  count: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    fontWeight: fontWeights.medium,
  },

  // Loading
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },

  // Custom markers
  markerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  markerIcon: {
    fontSize: 14,
    color: colors.white,
  },
  schoolMarkerCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF9800',
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  schoolMarkerEmoji: {
    fontSize: 12,
  },

  // Fallback
  fallbackBanner: {
    backgroundColor: colors.accent + '15',
    marginHorizontal: spacing.md,
    padding: spacing.sm + 4,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
  },
  fallbackText: {
    fontSize: typography.caption,
    color: colors.accent,
    textAlign: 'center',
    fontWeight: fontWeights.medium,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  cantonSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.sm + 6,
    marginBottom: spacing.sm + 2,
    ...shadows.card,
  },
  cantonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cantonCode: {
    fontSize: typography.h4,
    fontWeight: fontWeights.extraBold,
    color: colors.primary,
  },
  cantonCount: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    fontWeight: fontWeights.medium,
  },
  listingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm - 2,
    gap: spacing.sm,
  },
  listDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: typography.body - 1,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  listingCompany: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  listBadge: {
    paddingHorizontal: spacing.sm - 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  listBadgeText: {
    fontSize: typography.tiny,
    fontWeight: fontWeights.semiBold,
  },
  schoolsFallback: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  schoolsFallbackTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  schoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.sm + 4,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    ...shadows.card,
  },
  schoolRowEmoji: {
    fontSize: 20,
  },
  schoolRowInfo: {
    flex: 1,
  },
  schoolRowName: {
    fontSize: typography.body - 1,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  schoolRowCity: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
