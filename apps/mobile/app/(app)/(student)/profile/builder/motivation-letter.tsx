import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../../../../../services/api';
import Button from '../../../../../components/ui/Button';
import type { StudentProfileExtendedDTO } from '@lehrstellen/shared';

export default function MotivationLetterBuilderScreen() {
  const router = useRouter();
  const [letter, setLetter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.get<StudentProfileExtendedDTO>('/students/me/extended').then((res) => {
      setLetter(res.data.motivationLetter ?? '');
    }).finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/students/me/extended', { motivationLetter: letter });
      router.back();
    } catch {
      Alert.alert('Fehler', 'Motivationsschreiben konnte nicht gespeichert werden.');
    } finally {
      setIsSaving(false);
    }
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
        <Text style={styles.title}>Motivationsschreiben</Text>
        <Text style={styles.hint}>Erkläre, warum du diese Ausbildung machen möchtest.</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          style={styles.textarea}
          value={letter}
          onChangeText={setLetter}
          multiline
          placeholder="Ich möchte diese Ausbildung machen, weil..."
          placeholderTextColor="#9CA3AF"
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{letter.length} Zeichen</Text>
        <Button title={isSaving ? 'Speichern...' : 'Speichern'} onPress={handleSave} disabled={isSaving} />
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
  hint: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  textarea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 240,
    marginBottom: 8,
  },
  charCount: { fontSize: 12, color: '#9CA3AF', textAlign: 'right', marginBottom: 16 },
});
