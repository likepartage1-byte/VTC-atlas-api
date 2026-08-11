import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Compass, WifiOff, Navigation } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';

interface OrderRadarProps {
  status: 'AVAILABLE' | 'OFFLINE';
  isSearchingSocket?: boolean;
}

export const OrderRadar: React.FC<OrderRadarProps> = ({ status, isSearchingSocket = true }) => {
  const { isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const rawLang = (i18n.language || 'fr').toLowerCase();
  const isRTL = rawLang.startsWith('ar');

  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;

  // Native-driven 60fps smooth pulse animation loop
  useEffect(() => {
    if (status !== 'AVAILABLE') {
      wave1.stopAnimation();
      wave2.stopAnimation();
      return;
    }

    const createPulse = (anim: Animated.Value, delay: number) => {
      anim.setValue(0);
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const pulse1Anim = createPulse(wave1, 0);
    const pulse2Anim = createPulse(wave2, 1200);

    pulse1Anim.start();
    pulse2Anim.start();

    return () => {
      pulse1Anim.stop();
      pulse2Anim.stop();
    };
  }, [status, wave1, wave2]);

  // Interpolations for Wave 1
  const scale1 = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.8],
  });
  const opacity1 = wave1.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.45, 0.2, 0],
  });

  // Interpolations for Wave 2
  const scale2 = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.8],
  });
  const opacity2 = wave2.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.45, 0.2, 0],
  });

  // Theme Design Tokens
  const primaryBrand = isDarkMode ? '#8B6CF6' : '#683EE6';
  const primaryLightBg = isDarkMode ? '#272042' : '#F3F0FF';
  const textTitleColor = isDarkMode ? '#F9FAFB' : '#111827';
  const textSubColor = isDarkMode ? '#A1A1AA' : '#6B7280';
  const ringBorder = isDarkMode ? 'rgba(139, 108, 246, 0.25)' : 'rgba(104, 62, 230, 0.2)';

  // Multi-language text mapping (Rule #12)
  const getSearchTitle = () => {
    if (status === 'OFFLINE') {
      return isRTL ? 'أنت غير متصل الآن' : rawLang.startsWith('es') ? 'Estás desconectado' : rawLang.startsWith('en') ? 'You are offline' : 'Vous êtes hors ligne';
    }
    return isRTL
      ? 'جاري البحث عن طلبات قريبة...'
      : rawLang.startsWith('es')
      ? 'Buscando viajes cercanos...'
      : rawLang.startsWith('en')
      ? 'Searching for nearby rides...'
      : 'Recherche de demandes à proximité...';
  };

  const getSearchSubtext = () => {
    if (status === 'OFFLINE') {
      return isRTL
        ? 'قم بالتحويل إلى "متصل" لاستقبال إشعارات الطلبات الفورية المباشرة.'
        : rawLang.startsWith('es')
        ? 'Pasa a estar en línea para recibir solicitudes directas de viaje.'
        : rawLang.startsWith('en')
        ? 'Switch to online to receive direct incoming ride requests.'
        : 'Passez en ligne pour recevoir des demandes directes de courses.';
    }
    return isRTL
      ? 'لا توجد طلبات متاحة حالياً. سيصلك إشعار فور توفر رحلة مناسبة.'
      : rawLang.startsWith('es')
      ? 'No hay viajes disponibles en este momento. Se te notificará.'
      : rawLang.startsWith('en')
      ? 'No rides available at the moment. You will be notified instantly.'
      : 'Aucune course disponible pour le moment. Vous serez notifié.';
  };

  return (
    <View style={styles.container}>
      {/* ── Radar Visual Container ── */}
      <View style={styles.radarFrame}>
        {/* Pulsing Concentric Wave 1 */}
        {status === 'AVAILABLE' && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                borderColor: primaryBrand,
                transform: [{ scale: scale1 }],
                opacity: opacity1,
              },
            ]}
          />
        )}

        {/* Pulsing Concentric Wave 2 */}
        {status === 'AVAILABLE' && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                borderColor: primaryBrand,
                transform: [{ scale: scale2 }],
                opacity: opacity2,
              },
            ]}
          />
        )}

        {/* Static Ambient Base Rings */}
        <View style={[styles.staticRing, { width: 140, height: 140, borderRadius: 70, borderColor: ringBorder }]} />
        <View style={[styles.staticRing, { width: 90, height: 90, borderRadius: 45, borderColor: ringBorder }]} />

        {/* Center Pulsing Yalla VTC Icon Core */}
        <View style={[styles.centerCore, { backgroundColor: status === 'AVAILABLE' ? primaryBrand : '#6B7280' }]}>
          {status === 'AVAILABLE' ? (
            <Navigation size={24} color="#FFFFFF" style={{ transform: [{ rotate: '45deg' }] }} />
          ) : (
            <WifiOff size={22} color="#FFFFFF" />
          )}
        </View>
      </View>

      {/* ── Text Labels ── */}
      <Text style={[styles.titleText, { color: textTitleColor }]}>
        {getSearchTitle()}
      </Text>
      <Text style={[styles.subText, { color: textSubColor }]}>
        {getSearchSubtext()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  radarFrame: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
  },
  staticRing: {
    position: 'absolute',
    borderWidth: 1,
  },
  centerCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#683EE6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
