import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';

interface Props {
  basePrice: number;
  onSubmitBid: (amount: number) => void;
  onAcceptBase: () => void;
  onClose: () => void;
}

export const BidBottomSheet: React.FC<Props> = ({ 
  basePrice, 
  onSubmitBid, 
  onAcceptBase, 
  onClose 
}) => {
  const [customBid, setCustomBid] = useState('');

  // مبالغ المزايدة السريعة
  const quickBids = [
    Math.ceil(basePrice * 1.05),
    Math.ceil(basePrice * 1.10),
    Math.ceil(basePrice * 1.15),
  ];

  const handleCustomBidSubmit = () => {
    const amount = parseInt(customBid);
    if (!amount || amount <= basePrice) return;

    // التحقق من قيد الـ 50%
    if (amount > basePrice * 1.5) {
      Alert.alert('Erreur', 'Votre offre لا يمكن أن تتجاوز 50% من السعر الأصلي');
      return;
    }

    onSubmitBid(amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      
      <Text style={styles.title}>Proposez votre prix</Text>
      
      <View style={styles.quickBidRow}>
        {quickBids.map((bid) => (
          <TouchableOpacity 
            key={bid} 
            style={styles.bidButton} 
            onPress={() => onSubmitBid(bid)}
          >
            <Text style={styles.bidButtonText}>{bid} MAD</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.customInputButton}>
           <TextInput
             style={styles.input}
             placeholder="MAD"
             placeholderTextColor="#666"
             keyboardType="numeric"
             value={customBid}
             onChangeText={setCustomBid}
             onSubmitEditing={handleCustomBidSubmit}
           />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.acceptButton} onPress={onAcceptBase}>
        <Text style={styles.acceptButtonText}>Accepter pour {basePrice} MAD</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Fermer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  quickBidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bidButton: {
    flex: 1,
    backgroundColor: '#222',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  bidButtonText: {
    color: '#32FF7E',
    fontWeight: 'bold',
    fontSize: 14,
  },
  customInputButton: {
    flex: 1.2,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 10,
    marginHorizontal: 4,
    borderRadius: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  input: {
    color: '#32FF7E',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  acceptButton: {
    backgroundColor: '#32FF7E',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#888',
    fontSize: 14,
  },
});
