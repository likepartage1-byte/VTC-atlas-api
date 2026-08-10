import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, I18nManager } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface LaserLogoProps {
  fontSize?: number;
  showTagline?: boolean;
  taglineText?: string;
  subTaglineText?: string;
  theme?: 'dark' | 'light';
  variant?: 'primary' | 'hero';
}

export const LaserLogo: React.FC<LaserLogoProps> = ({
  fontSize = 38,
  showTagline = true,
  taglineText = 'DRIVER PARTNER',
  subTaglineText,
  theme = 'dark',
  variant = 'primary',
}) => {
  const sweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const triggerLaserSequence = () => {
      sweepAnim.setValue(0);
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          triggerLaserSequence();
        }, 3500);
      });
    };

    triggerLaserSequence();
    return () => sweepAnim.stopAnimation();
  }, [sweepAnim]);

  const laserX = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, fontSize * 8],
  });

  const laserOpacity = sweepAnim.interpolate({
    inputRange: [0, 0.1, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  const isDark = theme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#683EE6';
  const vtcColor = '#683EE6';
  const dotColor = isDark ? '#0F1117' : '#FFFFFF';

  // SVG Y-Road Mark Vector matching ICON1.png
  const renderYRoadIcon = (width: number, height: number) => (
    <Svg width={width} height={height} viewBox="0 0 500 500">
      {/* 1. Left Location Pin (Teardrop with vector hole cutout) */}
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 148 45 C 105.5 45, 73 77.5, 73 120 C 73 165, 148 230, 148 230 C 148 230, 223 165, 223 120 C 223 77.5, 190.5 45, 148 45 Z M 148 94 A 26 26 0 1 0 148 146 A 26 26 0 1 0 148 94 Z"
        fill="#683EE6"
      />

      {/* 2. Right Location Pin (Teardrop with vector hole cutout) */}
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 352 45 C 309.5 45, 277 77.5, 277 120 C 277 165, 352 230, 352 230 C 352 230, 427 165, 427 120 C 427 77.5, 394.5 45, 352 45 Z M 352 94 A 26 26 0 1 0 352 146 A 26 26 0 1 0 352 94 Z"
        fill="#683EE6"
      />

      {/* 3. Left Branch Road Ribbon */}
      <Path
        d="M 125 210 C 135 285, 205 340, 255 365"
        stroke="#683EE6"
        strokeWidth="54"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* 4. Right Main Stem Road Ribbon */}
      <Path
        d="M 378 190 C 340 260, 248 320, 235 465"
        stroke="#683EE6"
        strokeWidth="54"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* 5. Left Road Dashed Center Lane Markings */}
      <Path
        d="M 125 210 C 135 285, 205 340, 255 365"
        stroke={dotColor}
        strokeWidth="12"
        strokeDasharray="20 16"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* 6. Right Main Stem Dashed Center Lane Markings */}
      <Path
        d="M 378 190 C 340 260, 248 320, 235 465"
        stroke={dotColor}
        strokeWidth="12"
        strokeDasharray="20 16"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );

  // Guarantee Physical LTR Ordering on Android/iOS in both RTL & LTR modes
  const isRTL = I18nManager.isRTL;
  const ltrRowFlexDirection = isRTL ? 'row-reverse' : 'row';

  // Hero Variant: Large stacked icon on top
  if (variant === 'hero') {
    const heroIconSize = fontSize * 2.2;
    return (
      <View style={styles.wrapper}>
        {/* Large Standalone Y-Road Icon */}
        <View style={{ width: heroIconSize, height: heroIconSize, marginBottom: 8 }}>
          {renderYRoadIcon(heroIconSize, heroIconSize)}
        </View>

        {/* Title Text (Physical LTR: ALLA then VTC) */}
        <View style={styles.textWrapper}>
          <View style={[styles.brandRowContainer, { flexDirection: ltrRowFlexDirection }]}>
            <Text style={[styles.brandTitleText, { fontSize, color: textColor, fontWeight: '900', letterSpacing: 1.5 }]}>
              YALLA
            </Text>
            <Text style={[styles.brandTitleText, { fontSize, color: vtcColor, fontWeight: '800', letterSpacing: 1.0, marginLeft: 6 }]}>
              VTC
            </Text>
          </View>
        </View>

        {/* Tagline */}
        {showTagline && (subTaglineText || taglineText !== 'DRIVER PARTNER') && (
          <View style={styles.taglineWrapper}>
            {subTaglineText ? (
              <Text style={[styles.subTaglineText, { color: '#000000' }]}>
                {subTaglineText}
              </Text>
            ) : null}
            {taglineText && taglineText !== 'DRIVER PARTNER' ? (
              <Text style={[styles.taglineText, { fontSize: Math.max(11, fontSize * 0.32) }]}>
                {taglineText}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    );
  }

  // Primary Official Logo: Physical LTR [Y Icon] then ALLA then VTC
  const iconWidth = fontSize * 1.25;
  const iconHeight = fontSize * 1.45;

  return (
    <View style={styles.wrapper}>
      {/* ── Strict Physical LTR Brand Row: [Y Icon] -> ALLA -> VTC ── */}
      <View style={styles.textWrapper}>
        <View style={[styles.brandRowContainer, { flexDirection: ltrRowFlexDirection }]}>
          {/* 1. FIRST ELEMENT (FAR LEFT): Y-Road Icon */}
          <View style={[styles.inlineIconContainer, { width: iconWidth, height: iconHeight }]}>
            {renderYRoadIcon(iconWidth, iconHeight)}
          </View>

          {/* 2. SECOND ELEMENT (MIDDLE): ALLA */}
          <Text style={[styles.brandTitleText, { fontSize, color: textColor, fontWeight: '900', letterSpacing: 1.5, marginLeft: 4 }]}>
            YALLA
          </Text>

          {/* 3. THIRD ELEMENT (FAR RIGHT): VTC */}
          <Text style={[styles.brandTitleText, { fontSize, color: vtcColor, fontWeight: '800', letterSpacing: 1.0, marginLeft: 6 }]}>
            VTC
          </Text>
        </View>

        {/* Laser Sweep Flash Overlay */}
        <Animated.View
          style={[
            styles.laserOverlay,
            {
              transform: [{ translateX: laserX }],
              opacity: laserOpacity,
            },
          ]}
        />
      </View>

      {/* ── Subtitle / Taglines ── */}
      {showTagline && (
        <View style={styles.taglineWrapper}>
          {subTaglineText ? (
            <Text style={[styles.subTaglineText, { color: '#000000' }]}>
              {subTaglineText}
            </Text>
          ) : null}
          <Text style={[styles.taglineText, { fontSize: Math.max(11, fontSize * 0.32) }]}>
            {taglineText}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
  },
  textWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 8,
  },
  brandRowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  brandTitleText: {
    fontFamily: 'System',
    transform: [{ skewX: '-10deg' }],
  },
  laserOverlay: {
    position: 'absolute',
    width: 25,
    height: '180%',
    backgroundColor: 'rgba(104, 62, 230, 0.45)',
    transform: [{ rotate: '30deg' }],
  },
  taglineWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    width: '100%',
  },
  taglineText: {
    color: '#683EE6',
    fontWeight: '800',
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subTaglineText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 3,
    textAlign: 'center',
    alignSelf: 'center',
  },
});
