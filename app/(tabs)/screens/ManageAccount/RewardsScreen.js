import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Bell, Recycle, Percent, TrendingUp, ArrowLeft, Lock, Award } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { doc, getDoc, updateDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { getAuth } from 'firebase/auth';

export default function RewardsScreen() {
  const router = useRouter();
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [userRewardsData, setUserRewardsData] = useState(null);
  const [rewardTasks, setRewardTasks] = useState([]);
  const [claimedReward, setClaimedReward] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUserRewardsData(),
        fetchRewardTasks()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRewardsData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        console.error('No user logged in');
        return;
      }

      const userRewardsRef = doc(db, 'userRewards', userId);
      const userRewardsSnap = await getDoc(userRewardsRef);

      if (userRewardsSnap.exists()) {
        const data = userRewardsSnap.data();
        setCurrentPoints(data.totalPoints || 0);
        setUserRewardsData(data);
      } else {
        const newUserRewards = {
          userId,
          totalPoints: 0,
          claimedRewards: [],
          activeDiscount: null,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };
        setCurrentPoints(0);
        setUserRewardsData(newUserRewards);
      }
    } catch (error) {
      console.error('Error fetching user rewards:', error);
    }
  };

  const fetchRewardTasks = async () => {
    try {
      const q = query(collection(db, 'rewardTasks'), orderBy('pointsRequired', 'asc'));
      const querySnapshot = await getDocs(q);
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      setRewardTasks(tasks);
    } catch (error) {
      console.error('Error fetching reward tasks:', error);
    }
  };

  const handleClaimReward = async (reward) => {
    if (currentPoints < reward.pointsRequired) {
      Alert.alert('Insufficient Points', `You need ${reward.pointsRequired - currentPoints} more points to claim this reward.`);
      return;
    }

    Alert.alert(
      'Claim Reward',
      `Claim "${reward.name}" for ${reward.pointsRequired} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim',
          onPress: async () => {
            try {
              const userId = auth.currentUser?.uid;
              const userRewardsRef = doc(db, 'userRewards', userId);

              const newTotalPoints = currentPoints - reward.pointsRequired;
              const claimData = {
                rewardId: reward.id,
                rewardName: reward.name,
                rewardType: reward.rewardType,
                rewardValue: reward.rewardValue,
                pointsUsed: reward.pointsRequired,
                claimedAt: new Date().toISOString(),
                status: 'active',
              };

              let updateData = {
                totalPoints: newTotalPoints,
                claimedRewards: [
                  ...(userRewardsData?.claimedRewards || []),
                  claimData
                ],
                lastUpdated: new Date().toISOString(),
              };

              // If it's a discount, set as active discount
              if (reward.rewardType === 'discount') {
                updateData.activeDiscount = claimData;
              }

              // If it's bonus points, add them immediately
              if (reward.rewardType === 'bonus_points') {
                updateData.totalPoints = newTotalPoints + reward.rewardValue;
              }

              await updateDoc(userRewardsRef, updateData);

              setCurrentPoints(updateData.totalPoints);
              setClaimedReward(reward);
              
              let message = `You've claimed "${reward.name}"!`;
              if (reward.rewardType === 'discount') {
                message += `\n\n${reward.rewardValue}% discount will be applied to your next payment.`;
              } else if (reward.rewardType === 'bonus_points') {
                message += `\n\n+${reward.rewardValue} bonus points added to your account!`;
              }

              Alert.alert('Reward Claimed!', message);
              
              setTimeout(() => {
                setClaimedReward(null);
              }, 3000);

              fetchUserRewardsData();
            } catch (error) {
              console.error('Error claiming reward:', error);
              Alert.alert('Error', 'Failed to claim reward. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleBackPress = () => {
    router.back();
  };

  const renderIcon = (iconType, color) => {
    switch (iconType) {
      case 'recycle':
        return <Recycle size={32} color={color} strokeWidth={2} />;
      case 'percent':
        return <Percent size={32} color={color} strokeWidth={2} />;
      case 'trending':
        return <TrendingUp size={32} color={color} strokeWidth={2} />;
      case 'award':
        return <Award size={32} color={color} strokeWidth={2} />;
      default:
        return <Award size={32} color={color} strokeWidth={2} />;
    }
  };

  const getProgressPercentage = (reward) => {
    return Math.min((currentPoints / reward.pointsRequired) * 100, 100);
  };

  const getRemainingPoints = (reward) => {
    return Math.max(reward.pointsRequired - currentPoints, 0);
  };

  const isRewardClaimed = (rewardId) => {
    return userRewardsData?.claimedRewards?.some(
      claimed => claimed.rewardId === rewardId && claimed.status === 'active'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Rewards</Text>
          <View style={styles.notificationContainer}>
            <Bell size={24} color="white" />
            <View style={styles.notificationDot} />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5DADE2" />
            <Text style={styles.loadingText}>Loading rewards...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
            {/* Total Points Display */}
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsValue}>{currentPoints}</Text>
              <Text style={styles.pointsLabel}>Total Points</Text>
            </View>

            {/* Active Discount Banner */}
            {userRewardsData?.activeDiscount && (
              <View style={styles.activeDiscountBanner}>
                <View style={styles.activeDiscountIcon}>
                  <Percent size={24} color="#F59E0B" />
                </View>
                <View style={styles.activeDiscountInfo}>
                  <Text style={styles.activeDiscountTitle}>Active Discount</Text>
                  <Text style={styles.activeDiscountText}>
                    {userRewardsData.activeDiscount.rewardValue}% off - {userRewardsData.activeDiscount.rewardName}
                  </Text>
                </View>
              </View>
            )}

            {/* Available Rewards */}
            <Text style={styles.sectionTitle}>Available Rewards</Text>
            
            {rewardTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Award size={48} color="#D1D5DB" />
                <Text style={styles.emptyStateText}>No rewards available yet</Text>
                <Text style={styles.emptyStateSubtext}>Check back later for exciting rewards!</Text>
              </View>
            ) : (
              rewardTasks.map((reward) => {
                const isLocked = currentPoints < reward.pointsRequired;
                const isClaimed = isRewardClaimed(reward.id);
                const progress = getProgressPercentage(reward);
                const remaining = getRemainingPoints(reward);

                return (
                  <View key={reward.id} style={styles.rewardCardContainer}>
                    <TouchableOpacity
                      style={[
                        styles.rewardCard,
                        isLocked && styles.rewardCardLocked,
                        isClaimed && styles.rewardCardClaimed
                      ]}
                      onPress={() => !isLocked && !isClaimed && handleClaimReward(reward)}
                      disabled={isLocked || isClaimed}
                    >
                      <View style={styles.rewardContent}>
                        <View style={[styles.rewardIcon, { backgroundColor: reward.bgColor }]}>
                          {isLocked ? (
                            <Lock size={20} color="#9CA3AF" strokeWidth={2} />
                          ) : (
                            renderIcon(reward.icon, reward.iconColor)
                          )}
                        </View>
                        <View style={styles.rewardInfo}>
                          <Text style={styles.rewardName}>{reward.name}</Text>
                          <Text style={styles.rewardDescription}>{reward.description}</Text>
                          <View style={styles.rewardValueBadge}>
                            <Text style={styles.rewardValueText}>
                              {reward.rewardType === 'discount' 
                                ? `${reward.rewardValue}% Off` 
                                : reward.rewardType === 'bonus_points'
                                ? `+${reward.rewardValue} Points`
                                : reward.rewardValue}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.rewardPointsDisplay}>
                        {isClaimed ? (
                          <Text style={styles.claimedBadge}>Claimed ✓</Text>
                        ) : (
                          <Text style={[
                            styles.rewardPoints,
                            isLocked && styles.rewardPointsDisabled
                          ]}>
                            {reward.pointsRequired} pts
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Progress Bar */}
                    {!isClaimed && (
                      <View style={styles.progressSection}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${progress}%`,
                                backgroundColor: isLocked ? '#D1D5DB' : reward.iconColor,
                              }
                            ]}
                          />
                        </View>
                        <View style={styles.progressInfo}>
                          <Text style={styles.progressText}>
                            {currentPoints} / {reward.pointsRequired} pts
                          </Text>
                          {!isLocked ? (
                            <Text style={styles.unlocked}>✓ Ready to Claim</Text>
                          ) : (
                            <Text style={styles.remaining}>
                              {remaining} more points needed
                            </Text>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            )}

            {/* Success Message */}
            {claimedReward && (
              <View style={styles.successCard}>
                <View style={styles.successIcon}>
                  <Award size={32} color="#10B981" />
                </View>
                <View style={styles.successContent}>
                  <Text style={styles.successTitle}>Reward Claimed!</Text>
                  <Text style={styles.successSubtitle}>{claimedReward.name}</Text>
                </View>
              </View>
            )}

            {/* How to Earn Points */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>How to Earn Points</Text>
              <View style={styles.infoPoint}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>Earn 1 point for every garbage collection payment</Text>
              </View>
              <View style={styles.infoPoint}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>Points accumulate and unlock rewards</Text>
              </View>
              <View style={styles.infoPoint}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>Claim rewards instantly once unlocked</Text>
              </View>
              <View style={styles.infoPoint}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>Discounts apply automatically to your next payment</Text>
              </View>
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#5DADE2', paddingHorizontal: 20, paddingVertical: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { padding: 4 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  notificationContainer: { position: 'relative' },
  notificationDot: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, backgroundColor: '#EF4444', borderRadius: 5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  pointsContainer: { alignItems: 'center', paddingVertical: 32, marginBottom: 20 },
  pointsValue: { fontSize: 72, fontWeight: 'bold', color: '#111827', lineHeight: 72 },
  pointsLabel: { fontSize: 18, color: '#6B7280', marginTop: 4 },
  activeDiscountBanner: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 16, marginBottom: 24, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#FEF3C7' },
  activeDiscountIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activeDiscountInfo: { flex: 1 },
  activeDiscountTitle: { fontSize: 14, fontWeight: '600', color: '#92400E', marginBottom: 4 },
  activeDiscountText: { fontSize: 16, fontWeight: 'bold', color: '#D97706' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16, marginTop: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 18, color: '#9CA3AF', marginTop: 16, fontWeight: '600' },
  emptyStateSubtext: { fontSize: 14, color: '#D1D5DB', marginTop: 8 },
  rewardCardContainer: { marginBottom: 20 },
  rewardCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#D1D5DB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  rewardCardLocked: { opacity: 0.7, backgroundColor: '#F9FAFB' },
  rewardCardClaimed: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  rewardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rewardIcon: { width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  rewardInfo: { flex: 1 },
  rewardName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  rewardDescription: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  rewardValueBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  rewardValueText: { fontSize: 12, fontWeight: '600', color: '#111827' },
  rewardPointsDisplay: { justifyContent: 'center' },
  rewardPoints: { fontSize: 14, fontWeight: '600', color: '#111827' },
  rewardPointsDisabled: { color: '#9CA3AF' },
  claimedBadge: { fontSize: 12, fontWeight: '600', color: '#10B981', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  progressSection: { marginTop: 12, paddingHorizontal: 8 },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  unlocked: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  remaining: { fontSize: 12, color: '#F59E0B', fontWeight: '500' },
  successCard: { backgroundColor: '#D1FAE5', borderRadius: 12, padding: 20, marginTop: 24, marginBottom: 16, borderWidth: 1, borderColor: '#10B981', flexDirection: 'row', alignItems: 'center' },
  successIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  successContent: { flex: 1 },
  successTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 4 },
  successSubtitle: { fontSize: 16, color: '#6B7280' },
  infoCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginTop: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  infoTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  infoPoint: { flexDirection: 'row', marginBottom: 10 },
  infoBullet: { fontSize: 14, color: '#5DADE2', marginRight: 8, fontWeight: '600' },
  infoText: { fontSize: 13, color: '#6B7280', flex: 1 },
  bottomPadding: { height: 20 },
});