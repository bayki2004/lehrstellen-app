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

export default function PersonalBuilderScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    api.get<StudentProfileExtendedDTO>('/students/me/extended').then((res) => {
      const p = res.data;
      setFirstName(p.firstName ?? '');
      setLastName(p.lastName ?? '');
      setPhone(p.phone ?? '');
      setNationality(p.nationality ?? '');
      setBio(p.bio ?? '');
    }).finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/students/me', { firstName, lastName, bio });
      await api.put('/students/me/extended', { phone, nationality });
      router.back();
    } catch {
      Alert.alert('Fehler', 'Daten konnten nicht gespeichert werden.');
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
        <Text style={styles.title}>Persönliche Daten</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Field label="Vorname" value={firstName} onChangeText={setFirstName} />
        <Field label="Nachname" value={lastName} onChangeText={setLastName} />
        <Field label="Telefon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="Nationalität" value={nationality} onChangeText={setNationality} placeholder="z.B. Schweizer" />
        <Field label="Über mich" value={bio} onChangeText={setBio} multiline placeholder="Erzähl etwas über dich..." />

        <View style={styles.footer}>
          <Button title={isSaving ? 'Speichern...' : 'Speichern'} onPress={handleSave} disabled={isSaving} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  keyboardType?: any;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  back: { fontSize: 16, color: '#4A90E2', fontWeight: '500', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1A2E' },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputMulti: { height: 120, textAlignVertical: 'top' },
  footer: { marginTop: 8 },
});
