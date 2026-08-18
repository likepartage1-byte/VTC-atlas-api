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
 * DriverSafetyIllustration
 *
 * Page 2: Safety, Trust, and Document Verification.
 * Professional layout depicting a driver offering a friendly welcome gesture
 * alongside a modern vehicle, with a floating security shield badge.
 */
export const DriverSafetyIllustration = ({ colors }: Props) => {
  const isDark = colors.bg === '#0A0F1E';

  const carBody = isDark ? colors.surfaceAlt : colors.surface;
  const shieldBg = colors.primary;
  const checkColor = colors.bg;

  return (
    <View style={styles.container}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 340 230"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          {/* Soft background glow */}
          <RadialGradient id="safetyGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.accent || colors.primary} stopOpacity={0.16} />
            <Stop offset="100%" stopColor={colors.bg} stopOpacity={0} />
          </RadialGradient>

          {/* Shield linear gradient */}
          <LinearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.accent || colors.primary} />
          </LinearGradient>
        </Defs>

        {/* 1. Glow Backdrop */}
        <Circle cx="170" cy="115" r="110" fill="url(#safetyGlow)" />

        {/* 2. Ground Shadow */}
        <Path d="M 40 180 Q 170 195 300 180" stroke="rgba(0,0,0,0.15)" strokeWidth="6" fill="none" />

        {/* 3. Modern Sedan (Page 2 Variant) */}
        <G transform="translate(110, 85)">
          {/* Car body shadow */}
          <Rect x="0" y="60" width="170" height="30" rx="10" fill="rgba(0,0,0,0.2)" />
          {/* Wheels */}
          <Circle cx="35" cy="80" r="18" fill="#121824" />
          <Circle cx="35" cy="80" r="14" fill="#1B2436" />
          <Circle cx="35" cy="80" r="6" fill={colors.textMuted} />
          <Circle cx="135" cy="80" r="18" fill="#121824" />
          <Circle cx="135" cy="80" r="14" fill="#1B2436" />
          <Circle cx="135" cy="80" r="6" fill={colors.textMuted} />
          {/* Car main chassis */}
          <Path
            d="M 5,60 
               C 5,50 15,35 45,35 
               L 115,35 
               C 135,35 155,42 165,55
               L 170,68
               C 170,75 160,82 150,82
               L 15,82
               C 8,82 5,75 5,60 Z"
            fill={carBody}
          />
          {/* Window glass */}
          <Path
            d="M 50,38 L 105,38 C 112,38 122,43 125,48 L 129,54 L 50,54 Z"
            fill="rgba(129,140,248,0.18)"
          />
        </G>

        {/* 4. Smiling Driver hand waving */}
        <G transform="translate(50, 75)">
          {/* Body */}
          <Path d="M 12 55 L 48 55 L 40 92 L 20 92 Z" fill="#6366F1" />
          {/* Neck */}
          <Rect x="26" y="47" width="8" height="10" fill="#E0D2C8" />
          {/* Smiling Head */}
          <Circle cx="30" cy="35" r="14" fill="#E0D2C8" />
          {/* Hair */}
          <Path d="M 16 35 C 16 20 44 20 44 35 C 44 23 16 23 16 35" fill="#1E293B" />
          {/* Smile */}
          <Path d="M 27 39 Q 30 43 33 39" stroke="#1E293B" strokeWidth="2" fill="none" />
          {/* Greeting Hand & Arm */}
          <Path
            d="M 14 62 C 6 52 4 40 4 35 C 4 33 6 33 7 35 C 7 40 10 50 16 57 Z"
            fill="#E0D2C8"
          />
        </G>

        {/* 5. Safe Shield Badge (Focus of Page 2) */}
        <G transform="translate(230, 45)">
          {/* Outer glowing glow */}
          <Circle cx="25" cy="28" r="28" fill={colors.primary} opacity={0.12} />
          {/* Shield path */}
          <Path
            d="M 5,10 
               C 5,10 25,2 25,2 
               C 25,2 45,10 45,10 
               C 45,10 45,32 45,32 
               C 45,43 25,52 25,52 
               C 25,52 5,43 5,32 
               C 5,32 5,10 5,10 Z"
            fill="url(#shieldGrad)"
          />
          {/* Validated Check Mark */}
          <Path
            d="M 16,25 L 22,31 L 34,19"
            stroke={checkColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
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
