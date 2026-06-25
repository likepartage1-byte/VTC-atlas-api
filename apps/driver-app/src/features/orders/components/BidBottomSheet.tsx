import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

interface Props {
  basePrice: number;
  onAccept: () => void;
  onSubmitBid: (amount: number) => void;
  onClose: () => void;
}

export const BidBottomSheet = ({ basePrice, onAccept, onSubmitBid, onClose }: Props) => {
  const [customBid, setCustomBid] = useState('');
  const presets = [5, 10, 20]; // Fixed MAD increments for Moroccan market

  const handleManualSubmit = () => {
    const amount = Number(customBid);
    if (Number.isNaN(amount) || amount <= 0) return;
    if (amount < basePrice * 0.7) return; // Min 70%
    onSubmitBid(amount);
  };

  return (
    <View style={styles.sheetContainer}>
      <View style={styles.handle} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Action: Accept directly */}
        <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
          <Text style={styles.acceptButtonText}>ACCEPTER {basePrice} MAD</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Ou proposer un autre prix</Text>

        {/* Rapid Choice Chips */}
        <View style={styles.presetsRow}>
          {presets.map((val) => (
            <TouchableOpacity 
              key={val} 
              style={styles.presetBtn} 
              onPress={() => onSubmitBid(basePrice + val)}
            >
              <Text style={styles.presetText}>+{val} MAD</Text>
              <Text style={styles.totalText}>{basePrice + val}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Manual Input Section */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Montant personnalisé"
            placeholderTextColor="#444"
            keyboardType="numeric"
            value={customBid}
            onChangeText={setCustomBid}
          />
          <TouchableOpacity 
            style={[styles.submitBtn, !customBid && styles.submitBtnDisabled]} 
            onPress={handleManualSubmit}
            disabled={!customBid}
          >
            <Text style={styles.submitBtnText}>PROPOSER</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoText}>
          Min: {Math.ceil(basePrice * 0.7)} MAD • Max: {Math.ceil(basePrice * 1.5)} MAD
        </Text>
      </ScrollView>

      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeText}>Ignorer cette offre</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#333',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  acceptButton: {
    backgroundColor: '#32FF7E',
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#32FF7E',
    shadowRadius: 15,
    shadowOpacity: 0.3,
  },
  acceptButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    color: '#555',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: '#141414',
    paddingVertical: 12,
    borderRadius: 15,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  presetText: {
    color: '#32FF7E',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  totalText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: '#141414',
    height: 56,
    borderRadius: 15,
    paddingHorizontal: 20,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  submitBtn: {
    backgroundColor: '#FFF',
    width: 100,
    height: 56,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.3,
  },
  submitBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
  infoText: {
    color: '#333',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  closeText: {
    color: '#444',
    fontSize: 14,
    fontWeight: '700',
  },
});
