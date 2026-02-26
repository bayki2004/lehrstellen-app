import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import { colors, typography, fontWeights, spacing } from '../../constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>L</Text>
          </View>
        </View>
        <Text style={styles.appName}>Lehrstellen</Text>
        <Text style={styles.tagline}>Finde deine Traum-Lehrstelle</Text>
        <Text style={styles.subtitle}>
          Swipe, matche und starte deine Karriere {'\n'}
          -- so einfach wie noch nie.
        </Text>
      </View>

      <View style={styles.featuresSection}>
        <View style={styles.featureRow}>
          <Text style={styles.featureEmoji}>{'{ }'}</Text>
          <Text style={styles.featureText}>Persönlichkeits-Quiz</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureEmoji}>{'<>'}</Text>
          <Text style={styles.featureText}>Smart Matching</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureEmoji}>{'[*]'}</Text>
          <Text style={styles.featureText}>Direkt chatten</Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Button
          title="Jetzt starten"
          onPress={() => router.push('/(auth)/register')}
          variant="primary"
        />
        <Button
          title="Ich habe bereits ein Konto"
          onPress={() => router.push('/(auth)/login')}
          variant="outline"
          style={styles.loginButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: fontWeights.extraBold,
    color: colors.white,
  },
  appName: {
    fontSize: typography.hero,
    fontWeight: fontWeights.extraBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: typography.h3,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresSection: {
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
  },
  featureEmoji: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
    color: colors.primary,
    width: 40,
    textAlign: 'center',
  },
  featureText: {
    fontSize: typography.body,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  bottomSection: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  loginButton: {
    marginTop: spacing.xs,
  },
});
