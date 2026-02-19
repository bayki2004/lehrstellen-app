import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../../../../../services/api';
import type { StudentProfileExtendedDTO, SchnupperlehreEntryDTO } from '@lehrstellen/shared';

const SWISS_CANTONS = ['AG','AI','AR','BE','BL','BS','FR','GE','GL','GR','JU','LU','NE','NW','OW','SG','SH','SO','SZ','TG','TI','UR','VD','VS','ZG','ZH'];

export default function ExperienceBuilderScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<SchnupperlehreEntryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [beruf, setBeruf] = useState('');
  const [canton, setCanton] = useState('');
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const loadEntries = async () => {
    try {
      const res = await api.get<StudentProfileExtendedDTO>('/students/me/extended');
      setEntries(res.data.schnupperlehren ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadEntries(); }, []);

  const handleAdd = async () => {
    if (!companyName.trim()) {
      Alert.alert('Fehler', 'Bitte gib den Firmennamen ein.');
      return;
    }
    setIsAdding(true);
    try {
      await api.post('/students/me/schnupperlehren', {
        companyName: companyName.trim(),
        beruf: beruf.trim() || undefined,
        canton: canton || undefined,
        notes: notes.trim() || undefined,
      });
      setCompanyName(''); setBeruf(''); setCanton(''); setNotes('');
      setShowForm(false);
      await loadEntries();
    } catch {
      Alert.alert('Fehler', 'Eintrag konnte nicht gespeichert werden.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = (entryId: string) => {
    Alert.alert('Eintrag entfernen', 'Diesen Eintrag wirklich entfernen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Entfernen',
        style: 'destructive',
        onPress: async () => {
          await api.delete(`/students/me/schnupperlehren/${entryId}`);
          await loadEntries();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><ActivityIndicator size="large" color="#4A90E2" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.back} onPress={() => router.back()}>‹ Zurück</Text>
        <Text style={styles.title}>Schnupperlehren</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {entries.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardCompany}>{entry.companyName}</Text>
              {entry.beruf && <Text style={styles.cardMeta}>{entry.beruf}</Text>}
              {entry.canton && <Text style={styles.cardMeta}>{entry.canton}</Text>}
              {entry.notes && <Text style={styles.cardNotes} numberOfLines={2}>{entry.notes}</Text>}
            </View>
            <TouchableOpacity onPress={() => handleRemove(entry.id)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {!showForm ? (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)} activeOpacity={0.7}>
            <Text style={styles.addButtonText}>+ Schnupperlehre hinzufügen</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Neue Schnupperlehre</Text>
            <TextInput
              style={styles.input}
              placeholder="Firmenname *"
              placeholderTextColor="#9CA3AF"
              value={companyName}
              onChangeText={setCompanyName}
            />
            <TextInput
              style={styles.input}
              placeholder="Beruf / Lehre (optional)"
              placeholderTextColor="#9CA3AF"
              value={beruf}
              onChangeText={setBeruf}
            />
            <Text style={styles.fieldLabel}>Kanton (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cantonRow}>
              {SWISS_CANTONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.cantonChip, canton === c && styles.cantonChipActive]}
                  onPress={() => setCanton(canton === c ? '' : c)}
                >
                  <Text style={[styles.cantonChipText, canton === c && styles.cantonChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Notizen (optional)"
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <View style={styles.formButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelBtnText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={isAdding}>
                <Text style={styles.saveBtnText}>{isAdding ? '...' : 'Hinzufügen'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  back: { fontSize: 16, color: '#4A90E2', fontWeight: '500', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1A2E' },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInfo: { flex: 1 },
  cardCompany: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  cardMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  cardNotes: { fontSize: 12, color: '#9CA3AF', marginTop: 4, fontStyle: 'italic' },
  removeBtn: { padding: 4 },
  removeBtnText: { fontSize: 16, color: '#EF4444' },
  addButton: {
    borderWidth: 1.5,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: { fontSize: 15, color: '#4A90E2', fontWeight: '600' },
  form: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12 },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A2E',
    marginBottom: 10,
  },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  cantonRow: { marginBottom: 12 },
  cantonChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
  },
  cantonChipActive: { backgroundColor: '#4A90E2' },
  cantonChipText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  cantonChipTextActive: { color: '#FFFFFF' },
  formButtons: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelBtnText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#4A90E2', alignItems: 'center' },
  saveBtnText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
});
