import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../stores/auth.store';
import { colors, typography, fontWeights, spacing } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setLoginError('Bitte füll alli Felder us.');
      return;
    }

    setLoginError(null);
    try {
      await login({ email: email.trim(), password });
      router.replace('/');
    } catch (err: any) {
      setLoginError(err.message || 'Anmeldung fehlgschlage.');
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
            <Text style={styles.title}>Willkommen zurück</Text>
            <Text style={styles.subtitle}>
              Melde dich an, um deine Matches zu sehen
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="E-Mail"
              placeholder="deine@email.ch"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setLoginError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Input
              label="Passwort"
              placeholder="Dein Passwort"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setLoginError(null);
              }}
              secureTextEntry
            />

            {loginError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{loginError}</Text>
              </View>
            )}

            <Button
              title="Anmelden"
              onPress={handleLogin}
              loading={isLoading}
              variant="primary"
              style={styles.submitButton}
            />
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>oder</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.footer}>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Neu hier? Registrieren</Text>
            </Pressable>
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
    marginBottom: spacing.xl,
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
  form: {
    gap: spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '15',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: typography.bodySmall,
    fontWeight: fontWeights.medium,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.textTertiary,
  },
  dividerText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  footerLink: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
});
