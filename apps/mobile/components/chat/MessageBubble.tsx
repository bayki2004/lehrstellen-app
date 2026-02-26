import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, fontWeights, spacing } from '../../constants/theme';
import type { MessageDTO } from '@lehrstellen/shared';

interface MessageBubbleProps {
  message: MessageDTO;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  if (message.type === 'SYSTEM') {
    return (
      <View style={styles.systemContainer}>
        <Text style={styles.systemText}>{message.content}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>
          {message.content}
        </Text>
      </View>
      <Text style={[styles.time, isOwn ? styles.ownTime : styles.otherTime]}>
        {new Date(message.createdAt).toLocaleTimeString('de-CH', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    paddingHorizontal: spacing.md - 4,
  },
  ownContainer: {
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    backgroundColor: colors.secondaryBackground,
    borderBottomLeftRadius: 6,
  },
  text: {
    fontSize: typography.body,
    lineHeight: 22,
  },
  ownText: {
    color: colors.white,
  },
  otherText: {
    color: colors.text,
  },
  time: {
    fontSize: typography.tiny + 1,
    marginTop: 2,
  },
  ownTime: {
    color: colors.textTertiary,
    textAlign: 'right',
  },
  otherTime: {
    color: colors.textTertiary,
  },
  systemContainer: {
    alignItems: 'center',
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.lg - 4,
  },
  systemText: {
    fontSize: typography.caption + 1,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
