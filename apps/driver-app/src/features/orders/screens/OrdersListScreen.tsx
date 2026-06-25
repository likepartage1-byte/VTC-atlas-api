import React, { useState } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Text, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useOrdersStore } from '../../../store/useOrdersStore';
import { OrderCard } from '../components/OrderCard';
import { useNavigation } from '@react-navigation/native';

export const OrdersListScreen = () => {
  const { orders } = useOrdersStore();
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const onRefresh = () => {
    setRefreshing(true);
    // محاكاة تحميل البيانات
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('TripDetails', { orderId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ville</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <View style={styles.dot} />
          <View style={styles.dot} />
        </TouchableOpacity>
      </View>

      <View style={styles.onlineStatusRow}>
        <View style={styles.statusPill}>
          <View style={styles.onlineIndicator} />
          <Text style={styles.statusText}>EN LIGNE</Text>
        </View>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>Recherche de commandes à proximité...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={({ item }) => (
            <OrderCard 
              order={item} 
              onPress={() => handleOrderPress(item.id)} 
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPadding}
          refreshControl={
            <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                tintColor="#32FF7E" 
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 2,
    backgroundColor: '#FFF',
    marginVertical: 2,
  },
  onlineStatusRow: {
    alignItems: 'center',
    marginVertical: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(50, 255, 126, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#32FF7E',
    marginRight: 8,
    shadowColor: '#32FF7E',
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  statusText: {
    color: '#32FF7E',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  listPadding: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#444',
    fontSize: 15,
  }
});
