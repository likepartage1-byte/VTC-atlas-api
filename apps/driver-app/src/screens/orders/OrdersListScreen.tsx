import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, Switch, SafeAreaView } from 'react-native';
import { useOrdersStore } from '../../store/orders.store';
import { OrderCard } from './OrderCard';
import { useNavigation } from '@react-navigation/native';

export const OrdersListScreen = () => {
  const { orders, removeOrder } = useOrdersStore();
  const [isOnline, setIsOnline] = React.useState(true);
  const navigation = useNavigation();

  const handleOrderPress = (order) => {
    navigation.navigate('TripDetails', { orderId: order.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ville</Text>
        <View style={styles.toggleContainer}>
          <Text style={[styles.statusText, { color: isOnline ? '#32FF7E' : '#888' }]}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: '#333', true: '#1A4D2E' }}
            thumbColor={isOnline ? '#32FF7E' : '#f4f3f4'}
          />
        </View>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Recherche de commandes...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard 
              order={item} 
              onPress={() => handleOrderPress(item)} 
            />
          )}
          contentContainerStyle={styles.listContent}
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginRight: 10,
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
});
