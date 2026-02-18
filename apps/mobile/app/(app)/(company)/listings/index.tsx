import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../../../../components/ui/Button';
import api from '../../../../services/api';
import { APPRENTICESHIP_FIELDS, SWISS_CANTONS } from '@lehrstellen/shared';

export default function CreateListingTab() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    field: '',
    canton: '',
    city: '',
    requirements: '',
    spotsAvailable: '1',
    durationYears: '3',
  });

  const handleCreate = async () => {
    if (!form.title || !form.field || !form.canton || !form.city) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/listings', {
        ...form,
        spotsAvailable: parseInt(form.spotsAvailable, 10) || 1,
        durationYears: parseInt(form.durationYears, 10) || 3,
        requirements: form.requirements ? form.requirements.split('\n').filter(Boolean) : [],
      });
      Alert.alert('Erfolg', 'Lehrstelle wurde erstellt!');
      setForm({
        title: '',
        description: '',
        field: '',
        canton: '',
        city: '',
        requirements: '',
        spotsAvailable: '1',
        durationYears: '3',
      });
    } catch (error: any) {
      Alert.alert('Fehler', error.response?.data?.message || 'Erstellung fehlgeschlagen.');
    } finally {
      setIsLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Inserieren</Text>
        <TouchableOpacity
          style={styles.myListingsButton}
          onPress={() => router.push('/(app)/(company)/listings/my')}
        >
          <Text style={styles.myListingsText}>Meine Stellen</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Titel *</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={(v) => update('title', v)}
          placeholder="z.B. Informatiker/in EFZ"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Berufsfeld *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {APPRENTICESHIP_FIELDS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, form.field === f && styles.chipSelected]}
              onPress={() => update('field', f)}
            >
              <Text style={[styles.chipText, form.field === f && styles.chipTextSelected]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Kanton *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {SWISS_CANTONS.map((c) => (
            <TouchableOpacity
              key={c.code}
              style={[styles.chip, form.canton === c.code && styles.chipSelected]}
              onPress={() => update('canton', c.code)}
            >
              <Text style={[styles.chipText, form.canton === c.code && styles.chipTextSelected]}>
                {c.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Stadt *</Text>
        <TextInput
          style={styles.input}
          value={form.city}
          onChangeText={(v) => update('city', v)}
          placeholder="z.B. Zürich"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Beschreibung</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={(v) => update('description', v)}
          placeholder="Was erwartet die Lernenden?"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Anforderungen (eine pro Zeile)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.requirements}
          onChangeText={(v) => update('requirements', v)}
          placeholder={'Sekundarschule A\nGute Noten in Mathe'}
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Plätze</Text>
            <TextInput
              style={styles.input}
              value={form.spotsAvailable}
              onChangeText={(v) => update('spotsAvailable', v)}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Dauer (Jahre)</Text>
            <TextInput
              style={styles.input}
              value={form.durationYears}
              onChangeText={(v) => update('durationYears', v)}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Button
          title="Lehrstelle erstellen"
          onPress={handleCreate}
          loading={isLoading}
          style={styles.submitButton}
        />
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  myListingsButton: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  myListingsText: {
    color: '#4A90E2',
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A2E',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipScroll: {
    flexGrow: 0,
    marginBottom: 4,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  submitButton: {
    marginTop: 24,
  },
});
