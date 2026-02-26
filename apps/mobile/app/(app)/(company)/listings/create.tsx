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
import { Ionicons } from '@expo/vector-icons';
import Button from '../../../../components/ui/Button';
import api from '../../../../services/api';
import { APPRENTICESHIP_FIELDS, SWISS_CANTONS, INFO_CARD_PRESETS } from '@lehrstellen/shared';
import type { InfoCard, InfoCardType } from '@lehrstellen/shared';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../../../constants/theme';

export default function CreateListingScreen() {
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
  const [infoCards, setInfoCards] = useState<InfoCard[]>([]);

  const handleCreate = async () => {
    if (!form.title || !form.field || !form.canton || !form.city) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    setIsLoading(true);
    try {
      const filteredCards = infoCards
        .map((c) => ({ ...c, items: c.items.filter((item) => item.trim().length > 0) }))
        .filter((c) => c.items.length > 0);
      await api.post('/listings', {
        ...form,
        spotsAvailable: parseInt(form.spotsAvailable, 10) || 1,
        durationYears: parseInt(form.durationYears, 10) || 3,
        requirements: form.requirements ? form.requirements.split('\n').filter(Boolean) : [],
        cards: filteredCards,
      });
      Alert.alert('Erfolg', 'Lehrstelle wurde erstellt!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
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
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Neue Lehrstelle</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Titel *</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={(v) => update('title', v)}
          placeholder="z.B. Informatiker/in EFZ"
          placeholderTextColor={colors.textTertiary}
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
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.label}>Beschreibung</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={(v) => update('description', v)}
          placeholder="Was erwartet die Lernenden?"
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Anforderungen (eine pro Zeile)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.requirements}
          onChangeText={(v) => update('requirements', v)}
          placeholder={'Sekundarschule A\nGute Noten in Mathe'}
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={3}
        />

        {/* Info Cards Editor */}
        <Text style={styles.label}>Info-Karten</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {(Object.keys(INFO_CARD_PRESETS) as InfoCardType[]).map((type) => {
            const exists = infoCards.some((c) => c.type === type);
            return (
              <TouchableOpacity
                key={type}
                style={[styles.chip, exists && styles.chipSelected]}
                onPress={() => {
                  if (exists) {
                    setInfoCards((prev) => prev.filter((c) => c.type !== type));
                  } else {
                    const preset = INFO_CARD_PRESETS[type];
                    setInfoCards((prev) => [
                      ...prev,
                      { type, title: preset.title, icon: preset.icon, items: [''] },
                    ]);
                  }
                }}
              >
                <Text style={[styles.chipText, exists && styles.chipTextSelected]}>
                  {INFO_CARD_PRESETS[type].icon} {INFO_CARD_PRESETS[type].title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {infoCards.map((card, cardIdx) => (
          <View key={card.type} style={styles.cardEditor}>
            <View style={styles.cardEditorHeader}>
              <Text style={styles.cardEditorTitle}>
                {card.icon} {card.title}
              </Text>
              <TouchableOpacity
                onPress={() => setInfoCards((prev) => prev.filter((_, i) => i !== cardIdx))}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={22} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
            {card.items.map((item, itemIdx) => (
              <View key={itemIdx} style={styles.cardItemRow}>
                <TextInput
                  style={[styles.input, styles.cardItemInput]}
                  value={item}
                  onChangeText={(text) => {
                    setInfoCards((prev) => {
                      const next = [...prev];
                      const items = [...next[cardIdx].items];
                      items[itemIdx] = text;
                      next[cardIdx] = { ...next[cardIdx], items };
                      return next;
                    });
                  }}
                  placeholder={`Punkt ${itemIdx + 1}`}
                  placeholderTextColor={colors.textTertiary}
                />
                <TouchableOpacity
                  onPress={() => {
                    setInfoCards((prev) => {
                      const next = [...prev];
                      const items = next[cardIdx].items.filter((_, i) => i !== itemIdx);
                      next[cardIdx] = { ...next[cardIdx], items: items.length > 0 ? items : [''] };
                      return next;
                    });
                  }}
                  hitSlop={8}
                >
                  <Ionicons name="remove-circle-outline" size={22} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => {
                setInfoCards((prev) => {
                  const next = [...prev];
                  next[cardIdx] = { ...next[cardIdx], items: [...next[cardIdx].items, ''] };
                  return next;
                });
              }}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.addItemText}>Punkt hinzufügen</Text>
            </TouchableOpacity>
          </View>
        ))}

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
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backText: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: fontWeights.extraBold,
    color: colors.text,
  },
  form: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  label: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: typography.body,
    color: colors.text,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  chipTextSelected: {
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  cardEditor: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardEditorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardEditorTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  cardItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardItemInput: {
    flex: 1,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
  },
  addItemText: {
    fontSize: typography.bodySmall,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
});
