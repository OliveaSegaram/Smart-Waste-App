import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { Trash2, Award, Calendar, Bell, TrendingUp, Users, Package, X, Clock, MapPin } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { collection, addDoc, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { db } from '../../../../firebase';

export default function BusinessDashboardScreen() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showGarbageModal, setShowGarbageModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [garbageRecords, setGarbageRecords] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    residentName: '',
    residentAddress: '',
    residentPhone: '',
    collectionDate: '',
    organicWaste: '',
    recyclableWaste: '',
    otherWaste: '',
    totalWeight: '',
    pricePerKg: '1',
    totalCost: '0',
    status: 'Unpaid',
  });

  const cities = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Matara'];

  useFocusEffect(
    React.useCallback(() => {
      fetchAllData();
    }, [])
  );

  useEffect(() => {
    const organic = parseFloat(formData.organicWaste) || 0;
    const recyclable = parseFloat(formData.recyclableWaste) || 0;
    const other = parseFloat(formData.otherWaste) || 0;
    const pricePerKg = parseFloat(formData.pricePerKg) || 1;
    
    const total = organic + recyclable + other;
    const cost = total * pricePerKg;
    
    setFormData(prev => ({
      ...prev,
      totalWeight: total.toFixed(2),
      totalCost: cost.toFixed(2)
    }));
  }, [formData.organicWaste, formData.recyclableWaste, formData.otherWaste, formData.pricePerKg]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchGarbageRecords(),
        fetchSchedules()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGarbageRecords = async () => {
    try {
      const q = query(collection(db, 'garbageCollections'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const records = [];
      querySnapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() });
      });
      setGarbageRecords(records);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      // Simple query without orderBy to avoid index requirement
      const q = query(
        collection(db, 'schedules'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const scheduleList = [];
      
      querySnapshot.forEach((doc) => {
        const scheduleData = { id: doc.id, ...doc.data() };
        // Filter for scheduled status on client side
        if (scheduleData.status === 'Scheduled') {
          scheduleList.push(scheduleData);
        }
      });
      
      // Sort by createdAt on client side (most recent first)
      scheduleList.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      // Take only the first 20
      setSchedules(scheduleList.slice(0, 20));
    } catch (error) {
      console.error('Error fetching schedules:', error);
      
      // Fallback: get all schedules without filtering
      try {
        const q = query(collection(db, 'schedules'));
        const querySnapshot = await getDocs(q);
        const scheduleList = [];
        
        querySnapshot.forEach((doc) => {
          const scheduleData = { id: doc.id, ...doc.data() };
          if (scheduleData.status === 'Scheduled') {
            scheduleList.push(scheduleData);
          }
        });
        
        // Sort by createdAt
        scheduleList.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        
        setSchedules(scheduleList);
      } catch (fallbackError) {
        console.error('Fallback schedule fetch failed:', fallbackError);
      }
    }
  };

  const handleSaveGarbageRecord = async () => {
    if (!formData.residentName || !formData.residentAddress || !formData.residentPhone || 
        !formData.collectionDate || !formData.totalWeight || parseFloat(formData.totalWeight) === 0) {
      Alert.alert('Validation Error', 'Please fill in all required fields and add waste weight');
      return;
    }

    try {
      await addDoc(collection(db, 'garbageCollections'), {
        ...formData,
        createdAt: new Date().toISOString(),
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      });

      Alert.alert('Success', 'Garbage collection record saved successfully');
      setShowGarbageModal(false);
      resetForm();
      fetchGarbageRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      Alert.alert('Error', 'Failed to save garbage record');
    }
  };

  const resetForm = () => {
    setFormData({
      residentName: '',
      residentAddress: '',
      residentPhone: '',
      collectionDate: '',
      organicWaste: '',
      recyclableWaste: '',
      otherWaste: '',
      totalWeight: '',
      pricePerKg: '1',
      totalCost: '0',
      status: 'Unpaid',
    });
  };

  const handleSaveDiscount = async () => {
    if (!selectedCity || !discountAmount) {
      Alert.alert('Validation Error', 'Please select a city and enter discount amount');
      return;
    }

    try {
      await addDoc(collection(db, 'cityDiscounts'), {
        city: selectedCity,
        discountAmount: parseFloat(discountAmount),
        createdAt: new Date().toISOString()
      });

      Alert.alert('Success', `Discount of $${discountAmount} saved for ${selectedCity}`);
      setShowModal(false);
      setSelectedCity('');
      setDiscountAmount('');
    } catch (error) {
      console.error('Error saving discount:', error);
      Alert.alert('Error', 'Failed to save discount');
    }
  };

  const formatDate = (dateString) => {
    try {
      const [day, month, year] = dateString.split('/');
      const date = new Date(year, month - 1, day);
      const options = { month: 'short', day: 'numeric', weekday: 'short' };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case 'Scheduled':
        return [styles.statusBadge, styles.statusScheduled];
      case 'Pending':
        return [styles.statusBadge, styles.statusPending];
      case 'Completed':
        return [styles.statusBadge, styles.statusCompleted];
      default:
        return [styles.statusBadge, styles.statusPending];
    }
  };

  const totalRevenue = garbageRecords.reduce((sum, record) => sum + parseFloat(record.totalCost || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Business Dashboard</Text>
            <View style={styles.notificationContainer}>
              <Bell size={24} color="white" />
              <View style={styles.notificationDot} />
            </View>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
          {/* Monthly Garbage Collection Card */}
          <View style={styles.calculatorCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, styles.greenBg]}>
                <Package size={28} color="#10B981" strokeWidth={2.5} />
              </View>
              <Text style={styles.sectionTitle}>Monthly Garbage Collection</Text>
            </View>
            
            <Text style={styles.description}>Record garbage collected from residents this month</Text>
            
            <TouchableOpacity style={styles.calculateButton} onPress={() => setShowGarbageModal(true)}>
              <Text style={styles.calculateButtonText}>+ Add Collection Record</Text>
            </TouchableOpacity>

            {/* Recent Records Summary */}
            {garbageRecords.length > 0 && (
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Total Collections: {garbageRecords.length}</Text>
                <Text style={styles.summaryText}>
                  Total Revenue: ${totalRevenue.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          {/* Stats Overview */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.iconCircle, styles.blueBg]}>
                <TrendingUp size={24} color="#3B82F6" strokeWidth={2.5} />
              </View>
              <Text style={styles.statLabel}>Total Revenue</Text>
              <Text style={styles.statValue}>${totalRevenue.toFixed(2)}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.iconCircle, styles.yellowBg]}>
                <Users size={24} color="#F59E0B" strokeWidth={2.5} />
              </View>
              <Text style={styles.statLabel}>Active Schedules</Text>
              <Text style={styles.statValue}>{schedules.length}</Text>
            </View>
          </View>

          {/* Discount Rewards Section */}
          <View style={styles.discountCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, styles.yellowBg]}>
                <Award size={28} color="#F59E0B" strokeWidth={2.5} />
              </View>
              <Text style={styles.sectionTitle}>City Discount Rewards</Text>
            </View>
            
            <TouchableOpacity style={styles.addDiscountButton} onPress={() => setShowModal(true)}>
              <Text style={styles.addDiscountButtonText}>+ Add Discount for City</Text>
            </TouchableOpacity>
          </View>

          {/* Scheduled Waste Pickups Section - Real Data */}
          <View style={styles.pickupsSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconCircle, styles.greenBg]}>
                <Calendar size={28} color="#10B981" strokeWidth={2.5} />
              </View>
              <Text style={styles.sectionTitle}>Scheduled Waste Pickups</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#5DADE2" style={styles.loader} />
            ) : schedules.length > 0 ? (
              schedules.map((schedule) => (
                <View key={schedule.id} style={styles.pickupCard}>
                  <View style={styles.pickupHeader}>
                    <View style={styles.pickupTitleContainer}>
                      <Text style={styles.pickupName}>{schedule.wasteType}</Text>
                      <View style={getStatusBadgeStyle(schedule.status)}>
                        <Text style={styles.statusText}>{schedule.status}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.pickupDetailRow}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.pickupAddress}>{schedule.address}</Text>
                  </View>

                  <View style={styles.pickupFooter}>
                    <View style={styles.pickupInfo}>
                      <Calendar size={16} color="#6B7280" />
                      <Text style={styles.pickupDate}>{formatDate(schedule.preferredDate)}</Text>
                    </View>
                    <View style={styles.pickupInfo}>
                      <Clock size={16} color="#6B7280" />
                      <Text style={styles.pickupTime}>{schedule.preferredTime}</Text>
                    </View>
                  </View>

                  <View style={styles.quantityInfo}>
                    <Text style={styles.quantityLabel}>Quantity: {schedule.quantity} {schedule.unit}</Text>
                  </View>

                  {schedule.specialInstructions && schedule.specialInstructions !== 'None' && (
                    <View style={styles.instructionsBox}>
                      <Text style={styles.instructionsLabel}>Instructions:</Text>
                      <Text style={styles.instructionsText}>{schedule.specialInstructions}</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Trash2 size={32} color="#D1D5DB" />
                <Text style={styles.emptyStateText}>No scheduled pickups yet</Text>
              </View>
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Garbage Collection Modal */}
        <Modal
          visible={showGarbageModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowGarbageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add Garbage Collection</Text>
                  <TouchableOpacity onPress={() => setShowGarbageModal(false)}>
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>Resident Information</Text>
                
                <Text style={styles.modalLabel}>Full Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., John Silva"
                  value={formData.residentName}
                  onChangeText={(text) => setFormData({...formData, residentName: text})}
                />

                <Text style={styles.modalLabel}>Address *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., 123 Main St, Colombo 03"
                  value={formData.residentAddress}
                  onChangeText={(text) => setFormData({...formData, residentAddress: text})}
                />

                <Text style={styles.modalLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., 0771234567"
                  keyboardType="phone-pad"
                  value={formData.residentPhone}
                  onChangeText={(text) => setFormData({...formData, residentPhone: text})}
                />

                <Text style={styles.modalLabel}>Collection Date *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., 2024-10-15"
                  value={formData.collectionDate}
                  onChangeText={(text) => setFormData({...formData, collectionDate: text})}
                />

                <Text style={styles.sectionLabel}>Waste Details (kg)</Text>
                
                <Text style={styles.modalLabel}>Organic Waste</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., 15"
                  keyboardType="numeric"
                  value={formData.organicWaste}
                  onChangeText={(text) => setFormData({...formData, organicWaste: text})}
                />

                <Text style={styles.modalLabel}>Recyclable Waste</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., 8"
                  keyboardType="numeric"
                  value={formData.recyclableWaste}
                  onChangeText={(text) => setFormData({...formData, recyclableWaste: text})}
                />

                <Text style={styles.modalLabel}>Other Waste</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., 5"
                  keyboardType="numeric"
                  value={formData.otherWaste}
                  onChangeText={(text) => setFormData({...formData, otherWaste: text})}
                />

                <Text style={styles.sectionLabel}>Pricing</Text>
                
                <Text style={styles.modalLabel}>Price per kg ($)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., 1"
                  keyboardType="numeric"
                  value={formData.pricePerKg}
                  onChangeText={(text) => setFormData({...formData, pricePerKg: text})}
                />

                <View style={styles.summaryBox}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Weight:</Text>
                    <Text style={styles.summaryValue}>{formData.totalWeight} kg</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Cost:</Text>
                    <Text style={styles.summaryValueLarge}>${formData.totalCost}</Text>
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setShowGarbageModal(false);
                      resetForm();
                    }}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSaveButton}
                    onPress={handleSaveGarbageRecord}
                  >
                    <Text style={styles.modalSaveText}>Save Record</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Discount Modal */}
        <Modal
          visible={showModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add City Discount</Text>
              
              <Text style={styles.modalLabel}>Select City</Text>
              <View style={styles.cityGrid}>
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[
                      styles.cityButton,
                      selectedCity === city && styles.cityButtonSelected
                    ]}
                    onPress={() => setSelectedCity(city)}
                  >
                    <Text style={[
                      styles.cityButtonText,
                      selectedCity === city && styles.cityButtonTextSelected
                    ]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Discount Amount ($)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., 50"
                keyboardType="numeric"
                value={discountAmount}
                onChangeText={setDiscountAmount}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleSaveDiscount}
                  disabled={!selectedCity || !discountAmount}
                >
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  calculatorCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  greenBg: {
    backgroundColor: '#D1FAE5',
  },
  yellowBg: {
    backgroundColor: '#FEF3C7',
  },
  blueBg: {
    backgroundColor: '#DBEAFE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  calculateButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#166534',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  discountCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addDiscountButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addDiscountButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  pickupsSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickupCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pickupHeader: {
    marginBottom: 12,
  },
  pickupTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusScheduled: {
    backgroundColor: '#DBEAFE',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  pickupDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  pickupAddress: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  pickupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pickupDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  pickupTime: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  quantityInfo: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  quantityLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  instructionsBox: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  instructionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 12,
    color: '#15803D',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  loader: {
    marginVertical: 20,
  },
  bottomPadding: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalScrollContent: {
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  summaryBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#166534',
    fontWeight: '600',
  },
  summaryValueLarge: {
    fontSize: 24,
    color: '#10B981',
    fontWeight: 'bold',
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  cityButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  cityButtonSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  cityButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  cityButtonTextSelected: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});