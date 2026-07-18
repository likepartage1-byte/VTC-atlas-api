import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { Colors } from '../theme/colors';

interface LaserLogoProps {
  fontSize?: number;
  showTagline?: boolean;
}

export const LaserLogo = ({ fontSize = 42, showTagline = true }: LaserLogoProps) => {
  const sweepAnim = useRef(new Animated.Value(0)).current;
  const textGlowAnim = useRef(new Animated.Value(0.4)).current;
  
  const containerWidth = fontSize * 7.8; 
  const containerHeight = fontSize * 1.6;

  useEffect(() => {
    // F1 Style sequence: 
    // 1. Fast sweep (600ms) + Ignite text glow.
    // 2. Keep text fully glowing/illuminated (3.0s pause).
    // 3. Dim text glow down (800ms) + Pause (1.0s) before next sweep.
    
    const triggerF1Animation = () => {
      // Reset sweep to start position
      sweepAnim.setValue(0);
      
      Animated.sequence([
        // Phase 1: High speed laser/flash sweep and simultaneous text ignite
        Animated.parallel([
          Animated.timing(sweepAnim, {
            toValue: 1,
            duration: 650,
            easing: Easing.bezier(0.16, 1, 0.3, 1), // ultra-fast deceleration like F1 braking
            useNativeDriver: true,
          }),
          Animated.timing(textGlowAnim, {
            toValue: 1.0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        
        // Phase 2: Laser sweeps out but text remains FULLY glowing/lit up ("يقف مضيء")
        Animated.delay(2800),
        
        // Phase 3: Slowly dim the glow down to prepare for the next lightning flash
        Animated.timing(textGlowAnim, {
          toValue: 0.3,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        
        // Short rest/dim phase
        Animated.delay(800),
      ]).start(() => {
        // Loop again
        triggerF1Animation();
      });
    };

    triggerF1Animation();

    return () => {
      sweepAnim.stopAnimation();
      textGlowAnim.stopAnimation();
    };
  }, [sweepAnim, textGlowAnim]);

  // Interpolate sweep position from offscreen-left to offscreen-right
  const laserX = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, containerWidth + 60],
  });

  // Fade out laser beam as it approaches the end of sequence
  const laserOpacity = sweepAnim.interpolate({
    inputRange: [0, 0.05, 0.75, 1],
    outputRange: [0, 1, 1, 0],
  });

  // Skew text for a high-velocity F01/sporty aerodynamic racing look (-12 degrees)
  const skewAngle = '-12deg';

  return (
    <View style={[styles.wrapper, { width: containerWidth }]}>
      
      {/* 1. Underlying Pulsing Glow layer: Creates neon radiating backdrop */}
      <Animated.View 
        style={[
          styles.textWrapper, 
          { 
            height: containerHeight, 
            opacity: textGlowAnim,
            transform: [
              { skewX: skewAngle },
              { scale: textGlowAnim.interpolate({ inputRange: [0.3, 1], outputRange: [0.98, 1.02] }) }
            ] 
          }
        ]}
      >
        <Text style={[styles.logoBase, { fontSize }]}>
          <Text style={styles.yallaText}>YALLA</Text>
          <Text style={styles.vtcText}> VTC</Text>
        </Text>
      </Animated.View>

      {/* 2. Sharp foreground sharp layer */}
      <View style={[styles.textWrapper, styles.absolute, { height: containerHeight, transform: [{ skewX: skewAngle }] }]}>
        <Text style={[styles.logoText, { fontSize }]}>
          <Text style={styles.yallaText}>YALLA</Text>
          <Text style={styles.vtcText}> VTC</Text>
        </Text>
      </View>

      {/* 3. Laser Sweep Overlay inside text boundaries */}
      <View style={[styles.laserMask, styles.absolute, { height: containerHeight, width: containerWidth, transform: [{ skewX: skewAngle }] }]}>
        
        {/* Animated Laser Speed Beam */}
        <Animated.View
          style={[
            styles.laserBeamContainer,
            {
              transform: [
                { translateX: laserX },
                { rotate: '30deg' } // Diagonal flare angle
              ],
              opacity: laserOpacity,
            },
          ]}
        >
          {/* F1 White Core */}
          <View style={styles.laserCore} />
          
          {/* Inner Light Turquoise Glow */}
          <View style={styles.laserGlowTurquoise} />

          {/* Outer Light Blue Flare Wing */}
          <View style={styles.laserGlowBlue} />
        </Animated.View>
      </View>

      {/* 4. Subtitle tag line with sleek spacing */}
      {showTagline && (
        <Text style={[styles.tagline, { fontSize: fontSize * 0.28 }]}>
          DRIVER PARTNER
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  textWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  logoBase: {
    fontWeight: '900',
    letterSpacing: 4,
    color: '#3FD1EA', // Medium Turquoise glow backing
    ...Platform.select({
      ios: {
        shadowColor: '#29E9F6', // Light Turquoise shadow glow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1.0,
        shadowRadius: 22,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  logoText: {
    fontWeight: '900',
    letterSpacing: 4,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  yallaText: {
    color: '#FFFFFF',
  },
  vtcText: {
    color: '#29E9F6', // Light Turquoise branding
    fontWeight: '955',
  },
  laserMask: {
    overflow: 'hidden',
    justifyContent: 'center',
  },
  laserBeamContainer: {
    position: 'absolute',
    height: '180%',
    width: 32, // Wider glare line like formula 1 headlight flash
    alignItems: 'center',
    justifyContent: 'center',
  },
  laserCore: {
    width: 4,
    height: '100%',
    backgroundColor: '#FFFFFF',
    zIndex: 4,
    shadowColor: '#FFF',
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  laserGlowTurquoise: {
    position: 'absolute',
    width: 14,
    height: '100%',
    backgroundColor: '#29E9F6', // Light Turquoise inner beam
    opacity: 0.8,
    borderRadius: 7,
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#29E9F6',
        shadowOpacity: 1,
        shadowRadius: 10,
      },
    }),
  },
  laserGlowBlue: {
    position: 'absolute',
    width: 30,
    height: '100%',
    backgroundColor: '#2F8EF3', // Light Blue outer flare trail
    opacity: 0.45,
    borderRadius: 15,
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#2F8EF3',
        shadowOpacity: 0.9,
        shadowRadius: 15,
      },
    }),
  },
  tagline: {
    color: Colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 6,
    marginTop: 8,
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
});
