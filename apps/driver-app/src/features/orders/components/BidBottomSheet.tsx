import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Dimensions,
  Platform
} from 'react-native';

const { width } = Dimensions.get('window');

interface Props {
  basePrice: number;
  onAccept: () => void;
  onSubmitBid: (amount: number) => void;
  onClose: () => void;
}

export const BidBottomSheet: React.FC<Props> = ({ 
  basePrice, 
  onAccept, 
  onSubmitBid, 
  onClose 
}) => {
  const [customBid, setCustomBid] = useState('');

  // محاسبة أزرار المزايدة السريعة (+10%, +20%, +30%)
  const quickBids = [
    Math.ceil(basePrice * 1.10),
    Math.ceil(basePrice * 1.20),
    Math.ceil(basePrice * 1.30),
  ];

  const handleCustomBid = (text: string) => {
    // قبول الأرقام فقط
    const cleaned = text.replace(/[^0-9]/g, '');
    setCustomBid(cleaned);
  };

  const handleManualSubmit = () => {
    const amount = Number(customBid);
    
    if (Number.isNaN(amount) || amount <= 0) return;

    // قيد الـ 70% كحد أدنى
    if (amount < basePrice * 0.7) {
      alert(`Min bid: ${Math.ceil(basePrice * 0.7)} MAD (Limite 70%)`);
      return;
    }

    // قيد الـ 150% كحد أقصى
    if (amount > basePrice * 1.5) {
      alert(`Max bid: ${Math.floor(basePrice * 1.5)} MAD (Limite 150%)`);
      return;
    }
    
    onSubmitBid(amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      
      <Text style={styles.title}>Proposez votre prix</Text>
      
      <View style={styles.quickBidRow}>
        {quickBids.map((val) => (
          <TouchableOpacity 
            key={val} 
            style={styles.bidBtn} 
            onPress={() => onSubmitBid(val)}
          >
            <Text style={styles.bidBtnText}>{val}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.customInput}
            value={customBid}
            onChangeText={handleCustomBid}
            placeholder="..."
            placeholderTextColor="#666"
            keyboardType="numeric"
            maxLength={4}
            onSubmitEditing={handleManualSubmit}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.primaryBtn} 
        onPress={onAccept}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>Accepter pour {basePrice} MAD</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeBtnText}>Fermer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
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
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 25,
  },
  quickBidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  bidBtn: {
    width: (width - 60) / 4,
    height: 50,
    backgroundColor: '#222',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  bidBtnText: {
    color: '#32FF7E',
    fontSize: 16,
    fontWeight: '900',
  },
  inputWrapper: {
    width: (width - 60) / 4,
    height: 50,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  customInput: {
    color: '#32FF7E',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    width: '100%',
  },
  primaryBtn: {
    backgroundColor: '#32FF7E',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryBtnText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '900',
  },
  closeBtn: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
  }
});
