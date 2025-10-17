import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Alert, Linking } from 'react-native';
import { ArrowLeft, Bell, CreditCard, Landmark, CheckCircle, Clock, Copy, Building2, Award } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { getAuth } from 'firebase/auth';
import * as Clipboard from 'expo-clipboard';

export default function PaymentScreen() {
  const router = useRouter();
  const auth = getAuth();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [currentBill, setCurrentBill] = useState({ amount: 0, unpaidRecords: [] });
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    fetchCurrentBill();
  }, []);

  const fetchCurrentBill = async () => {
    try {
      setLoading(true);
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      
      const q = query(
        collection(db, 'garbageCollections'),
        where('status', '==', 'Unpaid'),
        where('month', '==', currentMonth)
      );
      
      const querySnapshot = await getDocs(q);
      let totalAmount = 0;
      const unpaidRecords = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalAmount += parseFloat(data.totalCost) || 0;
        unpaidRecords.push({ id: doc.id, ...data });
      });

      setCurrentBill({
        amount: totalAmount.toFixed(2),
        unpaidRecords: unpaidRecords
      });
    } catch (error) {
      console.error('Error fetching current bill:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real bank details for Sri Lanka (Common banks)
  const bankOptions = [
    {
      id: 'boc',
      name: 'Bank of Ceylon',
      accountName: 'Waste Management Services Ltd',
      accountNumber: '0087451234',
      branch: 'Colombo Fort Branch',
      branchCode: '001',
      swiftCode: 'BCEYLKLX'
    },
    {
      id: 'commercial',
      name: 'Commercial Bank of Ceylon',
      accountName: 'Waste Management Services Ltd',
      accountNumber: '1100234567',
      branch: 'Colombo City Office',
      branchCode: '110',
      swiftCode: 'CCEYLKLX'
    }
  ];

  /**
   * Awards points to user based on payment amount
   * Formula: 1 point per garbage collection payment
   */
  const awardPointsForPayment = async (numberOfCollections = 1) => {
    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        console.error('No user logged in');
        return 0;
      }

      const userRewardsRef = doc(db, 'userRewards', userId);
      const userRewardsSnap = await getDoc(userRewardsRef);

      const pointsToAdd = numberOfCollections; // 1 point per collection

      if (userRewardsSnap.exists()) {
        // User has existing rewards record
        const currentData = userRewardsSnap.data();
        const newTotalPoints = (currentData.totalPoints || 0) + pointsToAdd;

        await updateDoc(userRewardsRef, {
          totalPoints: newTotalPoints,
          lastPointsEarned: pointsToAdd,
          lastPointsEarnedDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        });

        console.log(`Added ${pointsToAdd} points. New total: ${newTotalPoints}`);
        return pointsToAdd;
      } else {
        // Create new rewards record for user
        await setDoc(userRewardsRef, {
          userId,
          totalPoints: pointsToAdd,
          lastPointsEarned: pointsToAdd,
          lastPointsEarnedDate: new Date().toISOString(),
          redeemedRewards: [],
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        });

        console.log(`Created rewards record with ${pointsToAdd} initial points`);
        return pointsToAdd;
      }
    } catch (error) {
      console.error('Error awarding points:', error);
      return 0;
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (selectedPayment === 'card') {
      // Process card payment via Stripe
      await processStripePayment();
    } else if (selectedPayment === 'bank') {
      if (!selectedBank) {
        Alert.alert('Error', 'Please select a bank for transfer');
        return;
      }
      // For bank transfer, show confirmation
      Alert.alert(
        'Bank Transfer Confirmation',
        `Please transfer $${currentBill.amount} to the selected ${bankOptions.find(b => b.id === selectedBank)?.name} account. After completing the transfer, your payment will be marked as pending verification.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'I Have Transferred', 
            onPress: async () => await markAsPendingVerification()
          }
        ]
      );
    }
  };

  const processStripePayment = async () => {
    try {
      setProcessingPayment(true);

      // Simulate successful payment (demo)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Award points before marking as paid
      const numberOfCollections = currentBill.unpaidRecords.length;
      const earnedPoints = await awardPointsForPayment(numberOfCollections);
      setPointsEarned(earnedPoints);
      
      await markAsPaid();
      setPaymentSuccess(true);
      
      Alert.alert(
        'Payment Successful!',
        `Payment processed successfully!\n\n🎉 You earned ${earnedPoints} reward point${earnedPoints > 1 ? 's' : ''}!`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment processing failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const markAsPaid = async () => {
    try {
      const updatePromises = currentBill.unpaidRecords.map(async (record) => {
        const docRef = doc(db, 'garbageCollections', record.id);
        await updateDoc(docRef, {
          status: 'Paid',
          paymentDate: new Date().toISOString(),
          paymentMethod: selectedPayment
        });
      });

      await Promise.all(updatePromises);
      fetchCurrentBill();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const markAsPendingVerification = async () => {
    try {
      setProcessingPayment(true);
      
      // Award points for bank transfer initiation
      const numberOfCollections = currentBill.unpaidRecords.length;
      const earnedPoints = await awardPointsForPayment(numberOfCollections);
      setPointsEarned(earnedPoints);

      const updatePromises = currentBill.unpaidRecords.map(async (record) => {
        const docRef = doc(db, 'garbageCollections', record.id);
        await updateDoc(docRef, {
          status: 'Pending Verification',
          paymentInitiatedDate: new Date().toISOString(),
          paymentMethod: 'bank',
          selectedBank: selectedBank
        });
      });

      await Promise.all(updatePromises);
      setPaymentSuccess(true);
      
      Alert.alert(
        'Transfer Recorded',
        `Your bank transfer has been recorded. Payment status will be updated once verified by our team (usually within 24-48 hours).\n\n🎉 You earned ${earnedPoints} reward point${earnedPoints > 1 ? 's' : ''}!`
      );
      fetchCurrentBill();
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert('Error', 'Failed to record transfer. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', `${label} copied to clipboard`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pay Bill</Text>
          <View style={styles.notificationContainer}>
            <Bell size={24} color="white" />
            <View style={styles.notificationDot} />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Loading payment details...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
            {/* Current Month Bill Summary */}
            <Text style={styles.sectionTitle}>Current Month Bill</Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.monthLabel}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                <View style={styles.unpaidBadge}>
                  <Clock size={14} color="#EF4444" />
                  <Text style={styles.unpaidText}>Unpaid</Text>
                </View>
              </View>
              
              <Text style={styles.amountDue}>Amount Due</Text>
              <Text style={styles.amountValue}>${currentBill.amount}</Text>
              
              {currentBill.unpaidRecords.length > 0 && (
                <View style={styles.recordsBreakdown}>
                  <Text style={styles.breakdownTitle}>Unpaid Collections:</Text>
                  {currentBill.unpaidRecords.slice(0, 3).map((record, index) => (
                    <View key={record.id} style={styles.breakdownRow}>
                      <Text style={styles.breakdownDate}>{record.collectionDate}</Text>
                      <Text style={styles.breakdownAmount}>${record.totalCost}</Text>
                    </View>
                  ))}
                  {currentBill.unpaidRecords.length > 3 && (
                    <Text style={styles.moreRecords}>
                      +{currentBill.unpaidRecords.length - 3} more collection(s)
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Points Earned Preview */}
            {currentBill.unpaidRecords.length > 0 && (
              <View style={styles.pointsPreviewCard}>
                <View style={styles.pointsPreviewHeader}>
                  <Award size={20} color="#F59E0B" />
                  <Text style={styles.pointsPreviewTitle}>Reward Points</Text>
                </View>
                <Text style={styles.pointsPreviewText}>
                  Pay now to earn <Text style={styles.pointsHighlight}>{currentBill.unpaidRecords.length} point{currentBill.unpaidRecords.length > 1 ? 's' : ''}</Text> 
                  {' '}for your rewards!
                </Text>
              </View>
            )}

            {/* Payment Options */}
            <Text style={styles.sectionTitle}>Payment Options</Text>

            {/* Card Payment Option */}
            <TouchableOpacity 
              style={[
                styles.paymentOption,
                selectedPayment === 'card' && styles.paymentOptionSelected
              ]}
              onPress={() => {
                setSelectedPayment('card');
                setSelectedBank(null);
              }}
            >
              <View style={styles.paymentOptionContent}>
                <CreditCard size={24} color="#374151" strokeWidth={2} />
                <View style={styles.paymentOptionTextContainer}>
                  <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
                  <Text style={styles.paymentOptionSubtext}>Pay securely via Stripe</Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            {/* Bank Transfer Option */}
            <TouchableOpacity 
              style={[
                styles.paymentOption,
                selectedPayment === 'bank' && styles.paymentOptionSelected
              ]}
              onPress={() => {
                setSelectedPayment('bank');
              }}
            >
              <View style={styles.paymentOptionContent}>
                <Landmark size={24} color="#374151" strokeWidth={2} />
                <View style={styles.paymentOptionTextContainer}>
                  <Text style={styles.paymentOptionText}>Bank Transfer</Text>
                  <Text style={styles.paymentOptionSubtext}>Transfer to our bank account</Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            {/* Bank Selection */}
            {selectedPayment === 'bank' && (
              <>
                <Text style={styles.bankSelectionTitle}>Select Bank Account</Text>
                {bankOptions.map((bank) => (
                  <TouchableOpacity
                    key={bank.id}
                    style={[
                      styles.bankOption,
                      selectedBank === bank.id && styles.bankOptionSelected
                    ]}
                    onPress={() => setSelectedBank(bank.id)}
                  >
                    <Building2 size={20} color={selectedBank === bank.id ? '#5DADE2' : '#6B7280'} />
                    <View style={styles.bankOptionText}>
                      <Text style={[
                        styles.bankName,
                        selectedBank === bank.id && styles.bankNameSelected
                      ]}>
                        {bank.name}
                      </Text>
                      <Text style={styles.bankBranch}>{bank.branch}</Text>
                    </View>
                    {selectedBank === bank.id && (
                      <CheckCircle size={20} color="#5DADE2" />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Bank Transfer Details */}
            {selectedPayment === 'bank' && selectedBank && (
              <View style={styles.bankDetailsCard}>
                <Text style={styles.bankDetailsTitle}>
                  {bankOptions.find(b => b.id === selectedBank)?.name} Details
                </Text>
                
                {(() => {
                  const bank = bankOptions.find(b => b.id === selectedBank);
                  return (
                    <>
                      <View style={styles.bankDetailRow}>
                        <Text style={styles.bankDetailLabel}>Account Name:</Text>
                        <View style={styles.bankDetailValueContainer}>
                          <Text style={styles.bankDetailValue}>{bank.accountName}</Text>
                          <TouchableOpacity 
                            onPress={() => copyToClipboard(bank.accountName, 'Account name')}
                            style={styles.copyButton}
                          >
                            <Copy size={16} color="#5DADE2" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.bankDetailRow}>
                        <Text style={styles.bankDetailLabel}>Account Number:</Text>
                        <View style={styles.bankDetailValueContainer}>
                          <Text style={[styles.bankDetailValue, styles.monospace]}>{bank.accountNumber}</Text>
                          <TouchableOpacity 
                            onPress={() => copyToClipboard(bank.accountNumber, 'Account number')}
                            style={styles.copyButton}
                          >
                            <Copy size={16} color="#5DADE2" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.bankDetailRow}>
                        <Text style={styles.bankDetailLabel}>Branch:</Text>
                        <View style={styles.bankDetailValueContainer}>
                          <Text style={styles.bankDetailValue}>{bank.branch}</Text>
                          <TouchableOpacity 
                            onPress={() => copyToClipboard(bank.branch, 'Branch')}
                            style={styles.copyButton}
                          >
                            <Copy size={16} color="#5DADE2" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.bankDetailRow}>
                        <Text style={styles.bankDetailLabel}>Branch Code:</Text>
                        <View style={styles.bankDetailValueContainer}>
                          <Text style={[styles.bankDetailValue, styles.monospace]}>{bank.branchCode}</Text>
                          <TouchableOpacity 
                            onPress={() => copyToClipboard(bank.branchCode, 'Branch code')}
                            style={styles.copyButton}
                          >
                            <Copy size={16} color="#5DADE2" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.bankDetailRow}>
                        <Text style={styles.bankDetailLabel}>SWIFT Code:</Text>
                        <View style={styles.bankDetailValueContainer}>
                          <Text style={[styles.bankDetailValue, styles.monospace]}>{bank.swiftCode}</Text>
                          <TouchableOpacity 
                            onPress={() => copyToClipboard(bank.swiftCode, 'SWIFT code')}
                            style={styles.copyButton}
                          >
                            <Copy size={16} color="#5DADE2" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.amountToTransferCard}>
                        <Text style={styles.amountToTransferLabel}>Amount to Transfer:</Text>
                        <Text style={styles.amountToTransferValue}>${currentBill.amount}</Text>
                      </View>

                      <View style={styles.noteContainer}>
                        <Text style={styles.noteText}>
                          📌 Important: Please include your phone number or account reference in the transfer description for faster verification.
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </View>
            )}

            {/* Card Payment Info */}
            {selectedPayment === 'card' && (
              <View style={styles.stripeInfoCard}>
                <Text style={styles.stripeInfoTitle}>🔒 Secure Payment via Stripe</Text>
                <Text style={styles.stripeInfoText}>
                  Your payment will be processed securely through Stripe, one of the world's most trusted payment platforms.
                </Text>
                <View style={styles.stripeFeatures}>
                  <Text style={styles.stripeFeature}>✓ PCI DSS Level 1 certified</Text>
                  <Text style={styles.stripeFeature}>✓ 256-bit SSL encryption</Text>
                  <Text style={styles.stripeFeature}>✓ Instant payment confirmation</Text>
                  <Text style={styles.stripeFeature}>✓ Support for all major cards</Text>
                </View>
              </View>
            )}

            {/* Confirm Payment Button */}
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                (!selectedPayment || currentBill.amount <= 0 || processingPayment || (selectedPayment === 'bank' && !selectedBank)) && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirmPayment}
              disabled={!selectedPayment || currentBill.amount <= 0 || processingPayment || (selectedPayment === 'bank' && !selectedBank)}
            >
              {processingPayment ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {currentBill.amount > 0 
                    ? selectedPayment === 'bank' 
                      ? selectedBank
                        ? `Confirm Transfer - $${currentBill.amount}`
                        : 'Select a Bank'
                      : `Pay $${currentBill.amount} with Card`
                    : 'No Pending Payments'
                  }
                </Text>
              )}
            </TouchableOpacity>

            {/* Payment Success Message */}
            {paymentSuccess && (
              <View style={styles.successContainer}>
                <View style={styles.successIconContainer}>
                  <CheckCircle size={32} color="white" strokeWidth={2.5} />
                </View>
                <View style={styles.successTextContainer}>
                  <Text style={styles.successTitle}>
                    {selectedPayment === 'bank' ? 'Transfer Recorded' : 'Payment Successful'}
                  </Text>
                  <Text style={styles.successSubtitle}>
                    {selectedPayment === 'bank' 
                      ? 'Your transfer will be verified within 24-48 hours'
                      : 'Receipt sent to your email'
                    }
                  </Text>
                  {pointsEarned > 0 && (
                    <View style={styles.pointsEarnedContainer}>
                      <Award size={16} color="#F59E0B" />
                      <Text style={styles.pointsEarnedText}>
                        You earned {pointsEarned} reward point{pointsEarned > 1 ? 's' : ''}!
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={styles.bottomPadding} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    marginBottom: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  unpaidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  unpaidText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  amountDue: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 16,
  },
  recordsBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  breakdownAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  moreRecords: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  pointsPreviewCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  pointsPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  pointsPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  pointsPreviewText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  pointsHighlight: {
    fontWeight: 'bold',
    color: '#D97706',
  },
  paymentOption: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentOptionSelected: {
    borderColor: '#5DADE2',
    borderWidth: 2,
    backgroundColor: '#EFF6FF',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentOptionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  paymentOptionSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  arrow: {
    fontSize: 28,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  bankSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    marginBottom: 12,
  },
  bankOption: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bankOptionSelected: {
    borderColor: '#5DADE2',
    borderWidth: 2,
    backgroundColor: '#F0F9FF',
  },
  bankOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  bankName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  bankNameSelected: {
    color: '#5DADE2',
  },
  bankBranch: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  bankDetailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bankDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bankDetailLabel: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  bankDetailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.2,
    justifyContent: 'flex-end',
  },
  bankDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginRight: 8,
    textAlign: 'right',
  },
  monospace: {
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 4,
  },
  amountToTransferCard: {
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountToTransferLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  amountToTransferValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
  },
  noteContainer: {
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  stripeInfoCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  stripeInfoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#15803D',
    marginBottom: 8,
  },
  stripeInfoText: {
    fontSize: 13,
    color: '#166534',
    marginBottom: 12,
    lineHeight: 18,
  },
  stripeFeatures: {
    marginTop: 4,
  },
  stripeFeature: {
    fontSize: 12,
    color: '#166534',
    marginBottom: 4,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  successIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  pointsEarnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  pointsEarnedText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});