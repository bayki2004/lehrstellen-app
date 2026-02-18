import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../../services/api';
import { APPRENTICESHIP_FIELDS, SWISS_CANTONS } from '@lehrstellen/shared';
import type { ListingDTO } from '@lehrstellen/shared';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [selectedCanton, setSelectedCanton] = useState('');
  const [results, setResults] = useState<ListingDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (field?: string, canton?: string) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (field) params.append('field', field);
      if (canton) params.append('canton', canton);
      const url = `/listings${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<{ data: ListingDTO[] }>(url);
      let listings = response.data.data || response.data as any;
      if (!Array.isArray(listings)) listings = [];

      // Client-side text filter
      if (query.trim()) {
        const q = query.toLowerCase();
        listings = listings.filter(
          (l: ListingDTO) =>
            l.title.toLowerCase().includes(q) ||
            l.description?.toLowerCase().includes(q) ||
            l.companyName?.toLowerCase().includes(q) ||
            l.field?.toLowerCase().includes(q)
        );
      }
      setResults(listings);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleSearch = () => {
    search(selectedField, selectedCanton);
  };

  const toggleField = (field: string) => {
    const newField = selectedField === field ? '' : field;
    setSelectedField(newField);
    search(newField, selectedCanton);
  };

  const toggleCanton = (canton: string) => {
    const newCanton = selectedCanton === canton ? '' : canton;
    setSelectedCanton(newCanton);
    search(selectedField, newCanton);
  };

  const renderListing = ({ item }: { item: ListingDTO }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardAvatar}>
          <Text style={styles.cardAvatarText}>
            {(item.companyName || '?')[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardCompany} numberOfLines={1}>{item.companyName}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardTags}>
        {item.field && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.field}</Text>
          </View>
        )}
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.canton} - {item.city}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.durationYears} Jahre</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Suche</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Lehrstelle suchen..."
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Suchen</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersSection}>
        <Text style={styles.filterLabel}>Berufsfeld</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {APPRENTICESHIP_FIELDS.map((field) => (
            <TouchableOpacity
              key={field}
              style={[styles.chip, selectedField === field && styles.chipSelected]}
              onPress={() => toggleField(field)}
            >
              <Text style={[styles.chipText, selectedField === field && styles.chipTextSelected]}>
                {field}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>Kanton</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {SWISS_CANTONS.map((c) => (
            <TouchableOpacity
              key={c.code}
              style={[styles.chip, selectedCanton === c.code && styles.chipSelected]}
              onPress={() => toggleCanton(c.code)}
            >
              <Text style={[styles.chipText, selectedCanton === c.code && styles.chipTextSelected]}>
                {c.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : !hasSearched ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Lehrstellen finden</Text>
          <Text style={styles.emptyText}>
            Wähle ein Berufsfeld oder einen Kanton, um Lehrstellen zu finden.
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>Keine Ergebnisse</Text>
          <Text style={styles.emptyText}>
            Versuche andere Filter oder Suchbegriffe.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderListing}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A2E',
  },
  searchButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  filtersSection: {
    paddingLeft: 16,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
    marginTop: 4,
  },
  chipScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  chipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  cardCompany: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 10,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
