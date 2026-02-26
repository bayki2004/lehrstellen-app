import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../stores/auth.store';
import { colors, typography, fontWeights, spacing, borderRadius, shadows } from '../../constants/theme';

type Role = 'STUDENT' | 'COMPANY';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Felder aus.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Fehler', 'Die Passwörter stimmen nicht überein.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Fehler', 'Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    try {
      await register({ email: email.trim(), password, role });
      router.replace('/');
    } catch {
      // Error is set in store
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Ionicons name="flame" size={50} color={colors.primary} />
            <Text style={styles.title}>Konto erstellen</Text>
            <Text style={styles.subtitle}>
              Starte jetzt deine Reise zur perfekten Lehrstelle
            </Text>
          </View>

          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>Ich bin...</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'STUDENT' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('STUDENT')}
              >
                <Text style={styles.roleIcon}>{'[S]'}</Text>
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'STUDENT' && styles.roleButtonTextActive,
                  ]}
                >
                  Schüler/in
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'COMPANY' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('COMPANY')}
              >
                <Text style={styles.roleIcon}>{'[C]'}</Text>
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'COMPANY' && styles.roleButtonTextActive,
                  ]}
                >
                  Unternehmen
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            <Input
              label="E-Mail"
              placeholder="deine@email.ch"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Input
              label="Passwort"
              placeholder="Min. 8 Zeichen"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError();
              }}
              secureTextEntry
            />
            <Input
              label="Passwort bestätigen"
              placeholder="Passwort wiederholen"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError();
              }}
              secureTextEntry
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title="Registrieren"
              onPress={handleRegister}
              loading={isLoading}
              variant="primary"
              style={styles.submitButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Bereits registriert? </Text>
            <Text
              style={styles.footerLink}
              onPress={() => router.push('/(auth)/login')}
            >
              Anmelden
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  roleSection: {
    marginBottom: spacing.lg,
  },
  roleLabel: {
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  roleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  roleIcon: {
    fontSize: typography.h3,
    marginBottom: spacing.xs,
    color: colors.primary,
    fontWeight: fontWeights.bold,
  },
  roleButtonText: {
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  roleButtonTextActive: {
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  form: {
    gap: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.bodySmall,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  footerText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
});
