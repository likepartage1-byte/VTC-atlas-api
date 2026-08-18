import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Rect,
  G,
} from 'react-native-svg';
import { ThemeColorsType } from '../../../theme/ThemeContext';

interface Props {
  colors: ThemeColorsType;
}

/**
 * AuthSelectionIllustration
 *
 * A clean, minimalist illustration showing a secure lock shield and key.
 * Used as a visual anchor on the Welcome Options screen.
 */
export const AuthSelectionIllustration = ({ colors }: Props) => {
  const isDark = colors.bg === '#0A0F1E';
  const primaryGrad = colors.primary;

  return (
    <View style={styles.container}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 340 210"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <RadialGradient id="authGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.15} />
            <Stop offset="100%" stopColor={colors.bg} stopOpacity={0} />
          </RadialGradient>

          <LinearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.accent || colors.primary} />
          </LinearGradient>
        </Defs>

        {/* Background glow */}
        <Circle cx="170" cy="105" r="95" fill="url(#authGlow)" />

        {/* Security Shield & Locked Key Icon */}
        <G transform="translate(130, 45)">
          {/* Shield */}
          <Path
            d="M 10,20
               C 10,20 40,5 40,5
               C 40,5 70,20 70,20
               C 70,20 70,55 70,55
               C 70,75 40,95 40,95
               C 40,95 10,75 10,55
               C 10,55 10,20 10,20 Z"
            fill="url(#shieldGrad)"
            opacity={0.9}
          />
          {/* Key Hole / Lock icon inside the shield */}
          <Circle cx="40" cy="45" r="10" fill={colors.bg} />
          <Path
            d="M 36,52 L 44,52 L 46,75 L 34,75 Z"
            fill={colors.bg}
          />
        </G>

        {/* Decorative background horizontal dots/lines */}
        <G opacity={0.3}>
          <Circle cx="60" cy="105" r="4" fill={colors.textMuted} />
          <Circle cx="80" cy="105" r="3" fill={colors.textMuted} />
          <Circle cx="260" cy="105" r="4" fill={colors.textMuted} />
          <Circle cx="280" cy="105" r="3" fill={colors.textMuted} />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
