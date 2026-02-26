import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, shadows, cardDimensions } from '../../constants/theme';

interface ActionButtonsProps {
  onReject: () => void;
  onLike: () => void;
  disabled?: boolean;
}

function ActionButton({
  icon,
  iconColor,
  size,
  shadow,
  onPress,
  disabled,
}: {
  icon: string;
  iconColor: string;
  size: number;
  shadow: object;
  onPress: () => void;
  disabled?: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();
  };

  const handlePress = async () => {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.actionButton,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: scaleAnim }],
          },
          shadow,
          disabled && styles.disabled,
        ]}
      >
        <Text style={[styles.icon, { color: iconColor, fontSize: size * 0.42 }]}>{icon}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

export default function ActionButtons({ onReject, onLike, disabled }: ActionButtonsProps) {
  const btnSize = 60;

  return (
    <View style={styles.container}>
      <ActionButton
        icon={'\u2715'}
        iconColor={colors.swipeLeft}
        size={btnSize}
        shadow={shadows.elevated}
        onPress={onReject}
        disabled={disabled}
      />
      <ActionButton
        icon={'\u2665'}
        iconColor={colors.swipeRight}
        size={btnSize}
        shadow={shadows.elevated}
        onPress={onLike}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 16,
  },
  actionButton: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
