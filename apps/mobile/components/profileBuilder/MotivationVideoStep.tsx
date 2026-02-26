import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useProfileBuilderStore } from '../../stores/profileBuilder.store';
import { colors, typography, spacing, borderRadius, fontWeights, shadows } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function MotivationVideoStep() {
  const { videoUri, updateField } = useProfileBuilderStore();
  const [isRecording, setIsRecording] = useState(false);

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      updateField('videoUri', 'file://dummy-video-recording.mp4');
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        updateField('videoUri', 'file://dummy-video-recording.mp4');
      }, 3000);
    }
  };

  const handleReRecord = () => {
    updateField('videoUri', null);
  };

  if (videoUri) {
    return (
      <View style={styles.container}>
        <View style={styles.videoPreviewEdge}>
          <View style={styles.playIconContainerEdge}>
            <Text style={styles.playIconEdge}>{'▶'}</Text>
          </View>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradientOverlay}
          >
            <Text style={styles.successTextEdge}>Dein Story-Video ist ready! ✨</Text>
            <Pressable style={styles.reRecordButtonEdge} onPress={handleReRecord}>
              <Text style={styles.reRecordButtonTextEdge}>Neu aufnehmen</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.containerEdge}>
      {/* Fake Camera View */}
      <View style={styles.cameraView}>
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={styles.cameraOverlay}
        >
          <View style={styles.topBar}>
            <View style={styles.durationBadgeEdge}>
              <View style={styles.recordingIndicator} />
              <Text style={styles.durationTextEdge}>00:00 / 01:00</Text>
            </View>
          </View>

          <View style={styles.bottomControls}>
            <Text style={styles.storyPrompt}>Erzähle deine Story!</Text>
            <Text style={styles.storySubPrompt}>Wer bist du und warum genau diese Lehrstelle?</Text>
            
            <View style={styles.recordButtonWrapper}>
              <Pressable 
                style={[styles.recordButtonOuter, isRecording && styles.recordButtonOuterActive]} 
                onPress={handleRecordToggle}
              >
                <View style={[styles.recordButtonInner, isRecording && styles.recordButtonInnerActive]} />
              </Pressable>
            </View>
            <Text style={styles.swipeText}>Tap to record</Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  containerEdge: {
    flex: 1,
    backgroundColor: colors.black,
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
  },
  cameraView: {
    flex: 1,
    backgroundColor: '#1a1a1a', // Fake camera background
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingTop: 60,
  },
  topBar: {
    alignItems: 'center',
  },
  durationBadgeEdge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  durationTextEdge: {
    color: colors.white,
    fontWeight: fontWeights.bold,
    fontSize: typography.bodySmall,
  },
  bottomControls: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  storyPrompt: {
    color: colors.white,
    fontSize: typography.h2,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  storySubPrompt: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.body,
    marginBottom: spacing.xl,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  recordButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  recordButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevated,
    shadowColor: colors.primary,
  },
  recordButtonOuterActive: {
    borderColor: 'rgba(255,59,48,0.5)',
    shadowColor: colors.error,
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
  recordButtonInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.error,
  },
  swipeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: typography.caption,
    fontWeight: fontWeights.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // Preview
  videoPreviewEdge: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainerEdge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  playIconEdge: {
    fontSize: typography.hero,
    color: colors.white,
    marginLeft: 6,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  successTextEdge: {
    color: colors.white,
    fontSize: typography.h3,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  reRecordButtonEdge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  reRecordButtonTextEdge: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: fontWeights.semiBold,
  }
});
