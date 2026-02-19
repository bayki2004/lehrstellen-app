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
import type { StudentProfileExtendedDTO, StudentSkillDTO, StudentLanguageDTO } from '@lehrstellen/shared';

const PROFICIENCY_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Muttersprache'];

export default function SkillsBuilderScreen() {
  const router = useRouter();
  const [skills, setSkills] = useState<StudentSkillDTO[]>([]);
  const [languages, setLanguages] = useState<StudentLanguageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newProficiency, setNewProficiency] = useState('B1');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isAddingLang, setIsAddingLang] = useState(false);

  const loadData = async () => {
    try {
      const res = await api.get<StudentProfileExtendedDTO>('/students/me/extended');
      setSkills(res.data.skills ?? []);
      setLanguages(res.data.languages ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    setIsAddingSkill(true);
    try {
      await api.post('/students/me/skills', { name: newSkill.trim() });
      setNewSkill('');
      await loadData();
    } catch {
      Alert.alert('Fehler', 'Fähigkeit konnte nicht hinzugefügt werden.');
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    await api.delete(`/students/me/skills/${skillId}`);
    await loadData();
  };

  const handleAddLanguage = async () => {
    if (!newLanguage.trim()) return;
    setIsAddingLang(true);
    try {
      await api.post('/students/me/languages', { language: newLanguage.trim(), proficiency: newProficiency });
      setNewLanguage('');
      await loadData();
    } catch {
      Alert.alert('Fehler', 'Sprache konnte nicht hinzugefügt werden.');
    } finally {
      setIsAddingLang(false);
    }
  };

  const handleRemoveLanguage = async (langId: string) => {
    await api.delete(`/students/me/languages/${langId}`);
    await loadData();
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
        <Text style={styles.title}>Fähigkeiten & Sprachen</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Skills section */}
        <Text style={styles.sectionTitle}>Fähigkeiten</Text>
        <View style={styles.chipsContainer}>
          {skills.map((skill) => (
            <TouchableOpacity
              key={skill.id}
              style={styles.skillChip}
              onPress={() => handleRemoveSkill(skill.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.skillChipText}>{skill.name}</Text>
              <Text style={styles.skillChipRemove}>✕</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="Neue Fähigkeit..."
            placeholderTextColor="#9CA3AF"
            value={newSkill}
            onChangeText={setNewSkill}
            onSubmitEditing={handleAddSkill}
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddSkill}
            disabled={isAddingSkill || !newSkill.trim()}
          >
            <Text style={styles.addBtnText}>{isAddingSkill ? '...' : '+'}</Text>
          </TouchableOpacity>
        </View>

        {/* Languages section */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Sprachen</Text>
        {languages.map((lang) => (
          <View key={lang.id} style={styles.langRow}>
            <View style={styles.langInfo}>
              <Text style={styles.langName}>{lang.language}</Text>
              <View style={styles.proficiencyBadge}>
                <Text style={styles.proficiencyText}>{lang.proficiency}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleRemoveLanguage(lang.id)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.langAddForm}>
          <TextInput
            style={styles.langInput}
            placeholder="Sprache (z.B. Deutsch)"
            placeholderTextColor="#9CA3AF"
            value={newLanguage}
            onChangeText={setNewLanguage}
          />
          <Text style={styles.fieldLabel}>Niveau</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.proficiencyRow}>
            {PROFICIENCY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.profChip, newProficiency === level && styles.profChipActive]}
                onPress={() => setNewProficiency(level)}
              >
                <Text style={[styles.profChipText, newProficiency === level && styles.profChipTextActive]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.addLangBtn, (!newLanguage.trim() || isAddingLang) && styles.addLangBtnDisabled]}
            onPress={handleAddLanguage}
            disabled={!newLanguage.trim() || isAddingLang}
          >
            <Text style={styles.addLangBtnText}>{isAddingLang ? 'Hinzufügen...' : '+ Sprache hinzufügen'}</Text>
          </TouchableOpacity>
        </View>
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
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  skillChipText: { fontSize: 14, color: '#4A90E2', fontWeight: '500' },
  skillChipRemove: { fontSize: 11, color: '#9CA3AF' },
  addRow: { flexDirection: 'row', gap: 10 },
  addInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 22, color: '#FFFFFF', fontWeight: '400', lineHeight: 26 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  langInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  langName: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  proficiencyBadge: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  proficiencyText: { fontSize: 12, color: '#16A34A', fontWeight: '700' },
  removeBtn: { padding: 4 },
  removeBtnText: { fontSize: 16, color: '#EF4444' },
  langAddForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  langInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A2E',
    marginBottom: 10,
  },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  proficiencyRow: { marginBottom: 12 },
  profChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  profChipActive: { backgroundColor: '#10B981' },
  profChipText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  profChipTextActive: { color: '#FFFFFF' },
  addLangBtn: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addLangBtnDisabled: { backgroundColor: '#9CA3AF' },
  addLangBtnText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
});
