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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../../../../../services/api';
import type { StudentProfileExtendedDTO, StudentSchoolDTO } from '@lehrstellen/shared';

const SCHOOL_LEVELS = ['Sek A', 'Sek B', 'Sek C', 'Gymnasium', 'Berufsmittelschule', 'Andere'];

export default function EducationBuilderScreen() {
  const router = useRouter();
  const [schools, setSchools] = useState<StudentSchoolDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const loadSchools = async () => {
    try {
      const res = await api.get<StudentProfileExtendedDTO>('/students/me/extended');
      setSchools(res.data.schools ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadSchools(); }, []);

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Fehler', 'Bitte gib den Schulnamen ein.');
      return;
    }
    setIsAdding(true);
    try {
      await api.post('/students/me/schools', {
        name: name.trim(),
        level: level || undefined,
        startYear: startYear ? parseInt(startYear) : undefined,
        endYear: endYear ? parseInt(endYear) : undefined,
        isCurrent,
      });
      setName(''); setLevel(''); setStartYear(''); setEndYear(''); setIsCurrent(false);
      setShowForm(false);
      await loadSchools();
    } catch {
      Alert.alert('Fehler', 'Schule konnte nicht hinzugefügt werden.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = (schoolId: string) => {
    Alert.alert('Schule entfernen', 'Diese Schule wirklich entfernen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Entfernen',
        style: 'destructive',
        onPress: async () => {
          await api.delete(`/students/me/schools/${schoolId}`);
          await loadSchools();
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
        <Text style={styles.title}>Schulbildung</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {schools.map((school) => (
          <View key={school.id} style={styles.schoolCard}>
            <View style={styles.schoolInfo}>
              <Text style={styles.schoolName}>{school.name}</Text>
              {school.level && <Text style={styles.schoolMeta}>{school.level}</Text>}
              <Text style={styles.schoolMeta}>
                {school.startYear ? `${school.startYear}` : '?'} –{' '}
                {school.isCurrent ? 'Heute' : school.endYear ? `${school.endYear}` : '?'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(school.id)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {!showForm ? (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)} activeOpacity={0.7}>
            <Text style={styles.addButtonText}>+ Schule hinzufügen</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Neue Schule</Text>
            <TextInput
              style={styles.input}
              placeholder="Schulname"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.fieldLabel}>Stufe (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelRow}>
              {SCHOOL_LEVELS.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.levelChip, level === l && styles.levelChipActive]}
                  onPress={() => setLevel(level === l ? '' : l)}
                >
                  <Text style={[styles.levelChipText, level === l && styles.levelChipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.yearRow}>
              <TextInput
                style={[styles.input, styles.yearInput]}
                placeholder="Von (Jahr)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={startYear}
                onChangeText={setStartYear}
              />
              <TextInput
                style={[styles.input, styles.yearInput]}
                placeholder="Bis (Jahr)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={endYear}
                onChangeText={setEndYear}
                editable={!isCurrent}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Aktuelle Schule</Text>
              <Switch value={isCurrent} onValueChange={setIsCurrent} trackColor={{ true: '#4A90E2' }} />
            </View>
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
  schoolCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  schoolInfo: { flex: 1 },
  schoolName: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  schoolMeta: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  removeBtn: { padding: 8 },
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
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A2E',
    marginBottom: 10,
  },
  levelRow: { marginBottom: 10 },
  levelChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  levelChipActive: { backgroundColor: '#4A90E2' },
  levelChipText: { fontSize: 13, color: '#6B7280' },
  levelChipTextActive: { color: '#FFFFFF' },
  yearRow: { flexDirection: 'row', gap: 10 },
  yearInput: { flex: 1 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: { fontSize: 14, color: '#4B5563' },
  formButtons: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
});
