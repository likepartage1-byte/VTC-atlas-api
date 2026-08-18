import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  I18nManager,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
  Circle,
  Rect,
} from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface YallaSplashAnimationProps {
  onAnimationComplete?: () => void;
  duration?: number;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.View;

export const YallaSplashAnimation: React.FC<YallaSplashAnimationProps> = ({
  onAnimationComplete,
  duration = 2500,
}) => {
  const animProgress = useRef(new Animated.Value(0)).current;
  const laneDashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Continuous lane dash movement loop (motion on road)
    const laneLoop = Animated.loop(
      Animated.timing(laneDashAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    laneLoop.start();

    // 2. Timeline sequence (2.5 seconds)
    animProgress.setValue(0);
    Animated.timing(animProgress, {
      toValue: 1,
      duration: duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setTimeout(() => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, 400);
      }
    });

    return () => {
      laneLoop.stop();
    };
  }, [animProgress, laneDashAnim, duration, onAnimationComplete]);

  // ── Phase 1: Y-Road Icon Scale & Appear (0.0 -> 0.20) ──
  const iconScale = animProgress.interpolate({
    inputRange: [0, 0.12, 0.20, 1],
    outputRange: [0.8, 1.05, 1.0, 1.0],
  });

  // ── Phase 2: Road Motion Dash Offset ──
  const laneDashOffset = laneDashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  // ── Phase 3: Location Pins Ripple Pulse (0.44 -> 0.64) ──
  const rippleScale = animProgress.interpolate({
    inputRange: [0.44, 0.54, 0.64],
    outputRange: [1, 1.6, 1],
    extrapolate: 'clamp',
  });
  const rippleOpacity = animProgress.interpolate({
    inputRange: [0.44, 0.54, 0.64],
    outputRange: [0.9, 0.2, 0],
    extrapolate: 'clamp',
  });

  // ── Phase 4: Text ALLA Slide & Fade Reveal (0.64 -> 0.88) ──
  const allaOpacity = animProgress.interpolate({
    inputRange: [0.64, 0.76, 1],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });
  const allaTranslateX = animProgress.interpolate({
    inputRange: [0.64, 0.78, 1],
    outputRange: [25, 0, 0],
    extrapolate: 'clamp',
  });

  // ── Phase 5: VTC Reveal & Slogan (0.88 -> 1.0) ──
  const vtcOpacity = animProgress.interpolate({
    inputRange: [0.85, 0.94, 1],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });
  const vtcTranslateX = animProgress.interpolate({
    inputRange: [0.85, 0.95, 1],
    outputRange: [15, 0, 0],
    extrapolate: 'clamp',
  });

  // Light Sweep Beam across text (0.72 -> 0.98)
  const sweepX = animProgress.interpolate({
    inputRange: [0.72, 0.98],
    outputRange: [-80, SCREEN_WIDTH * 0.75],
    extrapolate: 'clamp',
  });
  const sweepOpacity = animProgress.interpolate({
    inputRange: [0.72, 0.80, 0.92, 0.98],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp',
  });

  // Arabic Tagline Fade In
  const sloganOpacity = animProgress.interpolate({
    inputRange: [0.88, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Physical LTR flex direction for RTL devices
  const isRTL = I18nManager.isRTL;
  const ltrRowFlexDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F1117" translucent />

      {/* Background Navy Gradient */}
      <View style={StyleSheet.absoluteFill}>
        <Svg height={SCREEN_HEIGHT} width={SCREEN_WIDTH} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#0B0D12" stopOpacity="1" />
              <Stop offset="50%" stopColor="#0F1117" stopOpacity="1" />
              <Stop offset="100%" stopColor="#06070A" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="purpleGlow" x1="50%" y1="0%" x2="50%" y2="100%">
              <Stop offset="0%" stopColor="#683EE6" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#683EE6" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="url(#bgGrad)" />
          <Circle cx={SCREEN_WIDTH * 0.5} cy={SCREEN_HEIGHT * 0.45} r={180} fill="url(#purpleGlow)" />
        </Svg>
      </View>

      {/* Main Brand Container */}
      <View style={styles.brandCenterContainer}>
        {/* Physical LTR Container: [1. Y Icon] -> [2. ALLA] -> [3. VTC] */}
        <View style={[styles.horizontalLogoRow, { flexDirection: ltrRowFlexDirection }]}>
          {/* 1. FIRST ELEMENT (FAR LEFT): Animated Y-Road Icon (Letter Y) */}
          <AnimatedView
            style={{
              transform: [{ scale: iconScale }],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={78} height={92} viewBox="0 0 100 100">
              {/* Ripple Ring Effect behind Left Pin */}
              <AnimatedCircle
                cx="26"
                cy="25"
                r={16}
                fill="none"
                stroke="#683EE6"
                strokeWidth={2}
                opacity={rippleOpacity}
                transform={[{ scale: rippleScale }]}
              />
              {/* Ripple Ring Effect behind Right Pin */}
              <AnimatedCircle
                cx="74"
                cy="25"
                r={16}
                fill="none"
                stroke="#683EE6"
                strokeWidth={2}
                opacity={rippleOpacity}
                transform={[{ scale: rippleScale }]}
              />

              {/* Left Pin */}
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M 29.6 9 C 21.1 9, 14.6 15.5, 14.6 24 C 14.6 33, 29.6 46, 29.6 46 C 29.6 46, 44.6 33, 44.6 24 C 44.6 15.5, 38.1 9, 29.6 9 Z M 29.6 18.8 A 5.2 5.2 0 1 0 29.6 29.2 A 5.2 5.2 0 1 0 29.6 18.8 Z"
                fill="#683EE6"
              />

              {/* Right Pin */}
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M 70.4 9 C 61.9 9, 55.4 15.5, 55.4 24 C 55.4 33, 70.4 46, 70.4 46 C 70.4 46, 85.4 33, 85.4 24 C 85.4 15.5, 78.9 9, 70.4 9 Z M 70.4 18.8 A 5.2 5.2 0 1 0 70.4 29.2 A 5.2 5.2 0 1 0 70.4 18.8 Z"
                fill="#683EE6"
              />

              {/* Left Branch Road Ribbon */}
              <Path
                d="M 25 42 C 27 57, 41 68, 51 73"
                stroke="#683EE6"
                strokeWidth="10.8"
                strokeLinecap="round"
                fill="none"
              />

              {/* Right Main Stem Road Ribbon */}
              <Path
                d="M 75.6 38 C 68 52, 49.6 64, 47 93"
                stroke="#683EE6"
                strokeWidth="10.8"
                strokeLinecap="round"
                fill="none"
              />

              {/* Animated Dashed Lane Lines (Moving headlights effect) */}
              <AnimatedPath
                d="M 25 42 C 27 57, 41 68, 51 73"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeDasharray="4 3.2"
                strokeDashoffset={laneDashOffset}
                strokeLinecap="round"
                fill="none"
              />
              <AnimatedPath
                d="M 75.6 38 C 68 52, 49.6 64, 47 93"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeDasharray="4 3.2"
                strokeDashoffset={laneDashOffset}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </AnimatedView>

          {/* 2. SECOND & THIRD ELEMENTS (MIDDLE & RIGHT): Text Reveal Container */}
          <View style={[styles.textContainer, { flexDirection: ltrRowFlexDirection }]}>
            {/* 2. SECOND ELEMENT (MIDDLE): ALLA */}
            <AnimatedView
              style={{
                opacity: allaOpacity,
                transform: [{ translateX: allaTranslateX }],
              }}
            >
              <Text style={styles.allaText}>ALLA</Text>
            </AnimatedView>

            {/* 3. THIRD ELEMENT (FAR RIGHT): VTC */}
            <AnimatedView
              style={{
                opacity: vtcOpacity,
                transform: [{ translateX: vtcTranslateX }],
              }}
            >
              <Text style={styles.vtcText}>VTC</Text>
            </AnimatedView>

            {/* Light Sweep Flash Beam */}
            <AnimatedView
              style={[
                styles.lightSweepBeam,
                {
                  transform: [{ translateX: sweepX }, { rotate: '30deg' }],
                  opacity: sweepOpacity,
                },
              ]}
            />
          </View>
        </View>

        {/* 3. Arabic Slogan Reveal */}
        <AnimatedView style={{ opacity: sloganOpacity, alignItems: 'center', marginTop: 18 }}>
          <Text style={styles.sloganText}>رحلة تبدأ بثقة.. نوصلك بأمان.</Text>
          <Text style={styles.driverPartnerText}>DRIVER PARTNER</Text>
        </AnimatedView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1117',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalLogoRow: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  textContainer: {
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  allaText: {
    fontSize: 44,
    fontWeight: '900', // Extra Bold
    color: '#FFFFFF',
    letterSpacing: 2,
    transform: [{ skewX: '-10deg' }],
    marginLeft: 6,
  },
  vtcText: {
    fontSize: 44,
    fontWeight: '800', // Bold
    color: '#683EE6',
    letterSpacing: 1.0,
    transform: [{ skewX: '-10deg' }],
    marginLeft: 6,
  },
  lightSweepBeam: {
    position: 'absolute',
    width: 25,
    height: '180%',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  sloganText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  driverPartnerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 4,
    letterSpacing: 4,
    textAlign: 'center',
  },
});
