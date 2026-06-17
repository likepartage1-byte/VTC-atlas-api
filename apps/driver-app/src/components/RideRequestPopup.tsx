import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { Colors } from '../../theme/colors';
import { CustomButton } from '../CustomButton';
import { RideRequest } from '../../store/slices/rideSlice';

interface RideRequestPopupProps {
  request: RideRequest;
  onAccept: () => void;
  onReject: () => void;
}

export const RideRequestPopup = ({ request, onAccept, onReject }: RideRequestPopupProps) => {
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View 
      entering={FadeInUp.springify()} 
      exiting={FadeOutDown}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>New Ride Request</Text>
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{timer}s</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.dot} />
          <Text style={styles.address} numberOfLines={1}>{request.pickup.address}</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
          <Text style={styles.address} numberOfLines={1}>{request.destination.address}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>EST. FARE</Text>
            <Text style={styles.value}>{request.fare} MAD</Text>
          </View>
          <View>
            <Text style={styles.label}>DISTANCE</Text>
            <Text style={styles.value}>{request.distance.toFixed(1)} KM</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <CustomButton 
            title="Reject" 
            onPress={onReject} 
            variant="outline" 
            style={styles.actionBtn}
          />
          <CustomButton 
            title="Accept Ride" 
            onPress={onAccept} 
            style={[styles.actionBtn, { flex: 2 }]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },
  timerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    marginRight: 12,
  },
  line: {
    width: 2,
    height: 20,
    backgroundColor: '#334155',
    marginLeft: 4,
    marginVertical: -2,
  },
  address: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 50,
  },
});
