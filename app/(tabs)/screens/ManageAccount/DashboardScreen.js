import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { DollarSign, Trash2, Award, Calendar, Bell, ArrowRight, Zap } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { collection, getDocs, query, orderBy, limit, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { getAuth } from 'firebase/auth';

export default function DashboardScreen() {
  const router = useRouter();
  const auth = getAuth();
  const [latestCollection, setLatestCollection] = useState(null);
  const [nextSchedule, setNextSchedule] = useState(null);
  const [currentBill, setCurrentBill] = useState({ amount: 0, unpaidCount: 0 });
  const [currentPoints, setCurrentPoints] = useState(0);
  const [nextReward, setNextReward] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reward tiers for dashboard display
  const rewardTiers = [
    {
      id: 1,
      name: 'Compost Bags',
      pointsRequired: 5,
      icon: '🎁',
      bgColor: '#D1FAE5',
    },
    {
      id: 2,
      name: 'Bill Discount',
      pointsRequired: 15,
      icon: '💰',
      bgColor: '#FEF3C7',
    },
    {
      id: 3,
      name: 'Eco-Bonus',
      pointsRequired: 30,
      icon: '⭐',
      bgColor: '#DBEAFE',
    },
  ];

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchLatestCollection(),
        fetchCurrentBill(),
        fetchNextSchedule(),
        fetchUserRewards(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestCollection = async () => {
    try {
      const q = query(
        collection(db, 'garbageCollections'), 
        orderBy('createdAt', 'desc'), 
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setLatestCollection({ id: doc.id, ...doc.data() });
      }
    } catch (error) {
      console.error('Error fetching latest collection:', error);
    }
  };

  const fetchCurrentBill = async () => {
    try {
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      
      const q = query(
        collection(db, 'garbageCollections'),
        where('status', '==', 'Unpaid'),
        where('month', '==', currentMonth)
      );
      
      const querySnapshot = await getDocs(q);
      let totalAmount = 0;
      let count = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalAmount += parseFloat(data.totalCost) || 0;
        count++;
      });

      setCurrentBill({
        amount: totalAmount.toFixed(2),
        unpaidCount: count
      });
    } catch (error) {
      console.error('Error fetching current bill:', error);
    }
  };

  const fetchNextSchedule = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const q = query(
        collection(db, 'schedules'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const schedules = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          schedules.push({ id: doc.id, ...data });
        });

        schedules.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });

        const scheduledPickup = schedules.find(s => s.status === 'Scheduled');
        if (scheduledPickup) {
          setNextSchedule(scheduledPickup);
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching next schedule:', error);
    }
  };

  const fetchUserRewards = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userRewardsRef = doc(db, 'userRewards', userId);
      const userRewardsSnap = await getDoc(userRewardsRef);

      if (userRewardsSnap.exists()) {
        const data = userRewardsSnap.data();
        const points = data.totalPoints || 0;
        setCurrentPoints(points);

        // Find next available reward
        const nextRewardTier = rewardTiers.find(
          reward => points < reward.pointsRequired
        );
        
        if (nextRewardTier) {
          setNextReward({
            ...nextRewardTier,
            pointsNeeded: nextRewardTier.pointsRequired - points,
            progress: (points / nextRewardTier.pointsRequired) * 100,
          });
        } else {
          // All rewards unlocked, show the highest tier
          const highestTier = rewardTiers[rewardTiers.length - 1];
          setNextReward({
            ...highestTier,
            pointsNeeded: 0,
            progress: 100,
            allUnlocked: true,
          });
        }
      } else {
        setCurrentPoints(0);
        // New user, set first reward target
        setNextReward({
          ...rewardTiers[0],
          pointsNeeded: rewardTiers[0].pointsRequired,
          progress: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching user rewards:', error);
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

  const handlePayNow = () => {
    router.push('/(tabs)/screens/ManageAccount/PaymentScreen');
  };

  const handleRedeem = () => {
    router.push('/(tabs)/screens/ManageAccount/RewardsScreen');
  };

  const handleViewHistory = () => {
    router.push('/(tabs)/screens/ManageAccount/GarbageHistoryScreen');
  };

  const handleScheduleNew = () => {
    router.push('/(tabs)/screens/ManageAccount/ScheduleScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Smart Waste Management</Text>
            <View style={styles.notificationContainer}>
              <Bell size={24} color="white" />
              <View style={styles.notificationDot} />
            </View>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* First Row */}
          <View style={styles.row}>
            {/* Current Bill Card */}
            <View style={styles.card}>
              <View style={[styles.iconCircle, styles.greenBg]}>
                <DollarSign size={32} color="#10B981" strokeWidth={2.5} />
              </View>
              <Text style={styles.cardLabel}>Current Bill</Text>
              
              {loading ? (
                <ActivityIndicator size="small" color="#10B981" style={styles.loader} />
              ) : (
                <>
                  <Text style={styles.billAmount}>${currentBill.amount}</Text>
                  {currentBill.unpaidCount > 0 && (
                    <Text style={styles.billSubtext}>
                      {currentBill.unpaidCount} unpaid collection{currentBill.unpaidCount > 1 ? 's' : ''}
                    </Text>
                  )}
                  <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
                    <Text style={styles.payButtonText}>Pay Now</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Waste History Card */}
            <View style={styles.card}>
              <View style={[styles.iconCircle, styles.greenBg]}>
                <Trash2 size={32} color="#10B981" strokeWidth={2.5} />
              </View>
              <Text style={styles.cardLabel}>Latest Collection</Text>
              
              {loading ? (
                <ActivityIndicator size="small" color="#10B981" style={styles.loader} />
              ) : latestCollection ? (
                <>
                  <View style={styles.wasteInfo}>
                    <View style={styles.wasteRow}>
                      <Text style={styles.wasteLabel}>Organic:</Text>
                      <Text style={styles.wasteValue}>{latestCollection.organicWaste || 0} kg</Text>
                    </View>
                    <View style={styles.wasteRow}>
                      <Text style={styles.wasteLabel}>Recyclable:</Text>
                      <Text style={styles.wasteValue}>{latestCollection.recyclableWaste || 0} kg</Text>
                    </View>
                    <View style={styles.wasteTotalRow}>
                      <Text style={styles.wasteTotalLabel}>Total:</Text>
                      <Text style={styles.wasteTotalValue}>{latestCollection.totalWeight} kg</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.viewHistoryButton} onPress={handleViewHistory}>
                    <Text style={styles.viewHistoryText}>View History</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.noDataText}>No collections yet</Text>
                  <TouchableOpacity style={styles.viewHistoryButton} onPress={handleViewHistory}>
                    <Text style={styles.viewHistoryText}>View History</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Second Row */}
          <View style={styles.row}>
            {/* Next Reward Progress Card */}
            <View style={styles.card}>
              <View style={[styles.iconCircle, styles.purpleBg]}>
                <Award size={32} color="#A855F7" strokeWidth={2.5} />
              </View>
              <Text style={styles.cardLabel}>Next Reward</Text>
              
              {loading ? (
                <ActivityIndicator size="small" color="#A855F7" style={styles.loader} />
              ) : nextReward ? (
                <>
                  <Text style={styles.rewardName}>{nextReward.name}</Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(nextReward.progress, 100)}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {currentPoints}/{nextReward.pointsRequired}
                    </Text>
                  </View>
                  {nextReward.allUnlocked ? (
                    <Text style={styles.unlockedText}>All rewards unlocked! 🎉</Text>
                  ) : (
                    <Text style={styles.pointsNeeded}>
                      {nextReward.pointsNeeded} pts to unlock
                    </Text>
                  )}
                  <TouchableOpacity style={styles.redeemButton} onPress={handleRedeem}>
                    <Text style={styles.redeemButtonText}>View All</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.noRewardText}>No rewards available</Text>
                  <TouchableOpacity style={styles.redeemButton} onPress={handleRedeem}>
                    <Text style={styles.redeemButtonText}>View Rewards</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Next Pickup Card */}
            <View style={styles.card}>
              <View style={[styles.iconCircle, styles.greenBg]}>
                <Calendar size={32} color="#10B981" strokeWidth={2.5} />
              </View>
              <Text style={styles.cardLabel}>Next Pickup</Text>
              
              {loading ? (
                <ActivityIndicator size="small" color="#10B981" style={styles.loader} />
              ) : nextSchedule ? (
                <>
                  <Text style={styles.pickupDate}>{formatDate(nextSchedule.preferredDate)}</Text>
                  <Text style={styles.pickupTime}>{nextSchedule.preferredTime}</Text>
                  <Text style={styles.pickupType}>{nextSchedule.wasteType}</Text>
                  <View style={styles.scheduleActions}>
                    <TouchableOpacity style={styles.scheduleButton} onPress={handleScheduleNew}>
                      <Text style={styles.scheduleButtonText}>New Schedule</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.noScheduleText}>No schedule yet</Text>
                  <TouchableOpacity style={styles.redeemButton} onPress={handleScheduleNew}>
                    <Text style={styles.redeemButtonText}>Schedule Now</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
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
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  greenBg: {
    backgroundColor: '#D1FAE5',
  },
  purpleBg: {
    backgroundColor: '#E9D5FF',
  },
  cardLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  billAmount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  billSubtext: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 8,
  },
  loader: {
    marginVertical: 20,
  },
  payButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  wasteInfo: {
    marginBottom: 12,
  },
  wasteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  wasteLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  wasteValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  wasteTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  wasteTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  wasteTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 20,
  },
  noScheduleText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  noRewardText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  viewHistoryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewHistoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  redeemButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  redeemButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  rewardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  pointsNeeded: {
    fontSize: 12,
    color: '#F59E0B',
    marginBottom: 8,
    fontWeight: '500',
  },
  unlockedText: {
    fontSize: 12,
    color: '#10B981',
    marginBottom: 8,
    fontWeight: '600',
  },
  pickupDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  pickupTime: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  pickupType: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 8,
    fontWeight: '500',
  },
  scheduleActions: {
    marginTop: 12,
  },
  scheduleButton: {
    backgroundColor: '#5DADE2',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});