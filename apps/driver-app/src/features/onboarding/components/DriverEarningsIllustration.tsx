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
 * DriverEarningsIllustration
 *
 * Page 3: Flexible Work, Earnings, and Rides.
 * Displays a premium smartphone interface showing currency trends,
 * positioned in front of a modern transport sedan.
 */
export const DriverEarningsIllustration = ({ colors }: Props) => {
  const isDark = colors.bg === '#0A0F1E';

  const carBody = isDark ? colors.surfaceAlt : colors.surface;
  const phoneBody = '#1E293B';
  const screenBg = isDark ? '#0A0F1E' : '#FFFFFF';
  const greenTrend = colors.online || '#10B981';

  return (
    <View style={styles.container}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 340 230"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          {/* Background glow using accent color */}
          <RadialGradient id="earningGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.online || colors.primary} stopOpacity={0.15} />
            <Stop offset="100%" stopColor={colors.bg} stopOpacity={0} />
          </RadialGradient>

          {/* Gradient for phone screen graph */}
          <LinearGradient id="graphGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={greenTrend} stopOpacity={0.25} />
            <Stop offset="100%" stopColor={colors.bg} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* 1. Backdrop Glow */}
        <Circle cx="170" cy="115" r="110" fill="url(#earningGlow)" />

        {/* 2. Ground Shadow */}
        <Path d="M 40 185 Q 170 198 300 185" stroke="rgba(0,0,0,0.15)" strokeWidth="6" fill="none" />

        {/* 3. Transport Sedan (Page 3 Background Element) */}
        <G transform="translate(40, 85)" opacity={0.6}>
          {/* Wheels */}
          <Circle cx="45" cy="80" r="16" fill="#121824" />
          <Circle cx="45" cy="80" r="5" fill={colors.textMuted} />
          <Circle cx="130" cy="80" r="16" fill="#121824" />
          <Circle cx="130" cy="80" r="5" fill={colors.textMuted} />
          {/* Chassis */}
          <Path
            d="M 10,62
               C 10,52 20,38 45,38
               L 110,38
               C 125,38 145,45 155,58
               L 165,70
               C 165,76 155,80 145,80
               L 20,80
               C 12,80 10,76 10,62 Z"
            fill={carBody}
          />
        </G>

        {/* 4. Large Phone Interface (Page 3 Foreground Focus) */}
        <G transform="translate(195, 30)">
          {/* Phone body */}
          <Rect x="0" y="0" width="76" height="142" rx="14" fill={phoneBody} />
          {/* Phone screen */}
          <Rect x="4" y="4" width="68" height="134" rx="10" fill={screenBg} />
          {/* Camera notch */}
          <Rect x="26" y="4" width="24" height="5" rx="2" fill={phoneBody} />

          {/* Graph trend on phone screen */}
          <Path
            d="M 8,95 
               Q 20,70 32,75 
               T 52,48 
               L 68,52
               L 68,125 
               L 8,125 Z"
            fill="url(#graphGrad)"
          />
          <Path
            d="M 8,95 
               Q 20,70 32,75 
               T 52,48 
               L 68,52"
            stroke={greenTrend}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Floating dynamic points */}
          <Circle cx="32" cy="75" r="4.5" fill={colors.bg} stroke={colors.primary} strokeWidth="2.5" />
          <Circle cx="52" cy="48" r="4.5" fill={colors.bg} stroke={colors.primary} strokeWidth="2.5" />

          {/* Currency indicator card */}
          <Rect x="10" y="16" width="48" height="24" rx="6" fill={colors.surface} />
          <Path
            d="M 20,28 L 20,28"
            stroke={colors.primary}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Mock text lines inside card */}
          <Rect x="30" y="22" width="20" height="4" rx="2" fill={colors.textSecondary} />
          <Rect x="30" y="30" width="14" height="3" rx="1" fill={colors.textMuted} />
        </G>

        {/* 5. Incoming requests signals (wavy waves) */}
        <G transform="translate(145, 52)">
          <Path d="M 0,10 Q 15,20 30,10" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.6} />
          <Path d="M -5,0 Q 15,15 35,0" stroke={colors.primary} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity={0.4} />
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
