import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { Bell, ArrowLeft, Calendar, Clock, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { getAuth } from 'firebase/auth';

export default function ScheduleScreen() {
  const router = useRouter();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    wasteType: '',
    quantity: '',
    unit: 'kg',
    preferredDate: '',
    preferredTime: '',
    specialInstructions: '',
    address: '',
  });

  const wasteTypes = ['Organic', 'Recyclable', 'Electronic', 'Furniture', 'Mixed', 'Other'];
  const units = ['kg', 'bag', 'bucket', 'box'];

  const handleConfirmPickup = async () => {
    if (!formData.wasteType || !formData.quantity || !formData.preferredDate || !formData.preferredTime || !formData.address) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const scheduleData = {
        userId: auth.currentUser?.uid || 'anonymous',
        userEmail: auth.currentUser?.email || 'unknown',
        wasteType: formData.wasteType,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        specialInstructions: formData.specialInstructions || 'None',
        address: formData.address,
        status: 'Scheduled',
        createdAt: new Date().toISOString(),
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      };

      await addDoc(collection(db, 'schedules'), scheduleData);

      Alert.alert('Success', 'Pickup Scheduled Successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setFormData({
              wasteType: '',
              quantity: '',
              unit: 'kg',
              preferredDate: '',
              preferredTime: '',
              specialInstructions: '',
              address: '',
            });
            router.back();
          }
        }
      ]);
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      Alert.alert('Error', 'Failed to schedule pickup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule Pickup</Text>
          <View style={styles.notificationContainer}>
            <Bell size={24} color="white" />
            <View style={styles.notificationDot} />
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Waste Type Selection */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Type of Waste *</Text>
            <View style={styles.wasteTypeGrid}>
              {wasteTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.wasteTypeButton,
                    formData.wasteType === type && styles.wasteTypeButtonSelected
                  ]}
                  onPress={() => setFormData({...formData, wasteType: type})}
                >
                  <Trash2 size={16} color={formData.wasteType === type ? 'white' : '#6B7280'} />
                  <Text style={[
                    styles.wasteTypeText,
                    formData.wasteType === type && styles.wasteTypeTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity Input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Quantity *</Text>
            <View style={styles.quantityRow}>
              <TextInput
                style={[styles.input, styles.quantityInput]}
                keyboardType="numeric"
                placeholder="e.g., 25"
                placeholderTextColor="#9CA3AF"
                value={formData.quantity}
                onChangeText={(text) => setFormData({...formData, quantity: text})}
              />
              <View style={styles.unitSelector}>
                <Text style={styles.selectedUnit}>{formData.unit}</Text>
              </View>
            </View>
            <View style={styles.unitGrid}>
              {units.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.unitButton,
                    formData.unit === u && styles.unitButtonSelected
                  ]}
                  onPress={() => setFormData({...formData, unit: u})}
                >
                  <Text style={[
                    styles.unitButtonText,
                    formData.unit === u && styles.unitButtonTextSelected
                  ]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Address Input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Address *</Text>
            <TextInput
              style={[styles.input, styles.addressInput]}
              placeholder="e.g., 123 Main Street, Colombo 03"
              placeholderTextColor="#9CA3AF"
              value={formData.address}
              onChangeText={(text) => setFormData({...formData, address: text})}
              multiline
            />
          </View>

          {/* Date Input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Preferred Date *</Text>
            <View style={styles.dateTimeRow}>
              <View style={styles.dateInputContainer}>
                <Calendar size={20} color="#5DADE2" />
                <TextInput
                  style={styles.dateTimeInput}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#9CA3AF"
                  value={formData.preferredDate}
                  onChangeText={(text) => setFormData({...formData, preferredDate: text})}
                />
              </View>
            </View>
          </View>

          {/* Time Input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Preferred Time *</Text>
            <View style={styles.dateTimeRow}>
              <View style={styles.timeInputContainer}>
                <Clock size={20} color="#5DADE2" />
                <TextInput
                  style={styles.dateTimeInput}
                  placeholder="HH:MM (e.g., 09:30)"
                  placeholderTextColor="#9CA3AF"
                  value={formData.preferredTime}
                  onChangeText={(text) => setFormData({...formData, preferredTime: text})}
                />
              </View>
            </View>
          </View>

          {/* Special Instructions */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Special Instructions (Optional)</Text>
            <TextInput
              style={[styles.input, styles.instructionsInput]}
              placeholder="e.g., Please ring the bell twice, Side gate is locked"
              placeholderTextColor="#9CA3AF"
              value={formData.specialInstructions}
              onChangeText={(text) => setFormData({...formData, specialInstructions: text})}
              multiline
            />
          </View>

          {/* Confirm Button */}
          <TouchableOpacity 
            style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
            onPress={handleConfirmPickup}
            disabled={loading}
          >
            <Text style={styles.confirmButtonText}>
              {loading ? 'Scheduling...' : 'Confirm Pickup Schedule'}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#5DADE2',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: '#EF4444',
    borderRadius: 5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  inputCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  wasteTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wasteTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    width: '48%',
  },
  wasteTypeButtonSelected: {
    backgroundColor: '#5DADE2',
    borderColor: '#5DADE2',
  },
  wasteTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  wasteTypeTextSelected: {
    color: 'white',
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quantityInput: {
    flex: 1,
  },
  unitSelector: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    minWidth: 80,
  },
  selectedUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  unitGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  unitButtonSelected: {
    backgroundColor: '#5DADE2',
    borderColor: '#5DADE2',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  unitButtonTextSelected: {
    color: 'white',
  },
  addressInput: {
    minHeight: 80,
  },
  dateTimeRow: {
    gap: 12,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },
  dateTimeInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
  },
  instructionsInput: {
    minHeight: 100,
  },
  confirmButton: {
    backgroundColor: '#FF6347',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});