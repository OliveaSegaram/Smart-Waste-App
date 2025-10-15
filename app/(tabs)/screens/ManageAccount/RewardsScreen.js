import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Bell, Recycle, Percent, TrendingUp, ArrowLeft, Lock } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { getAuth } from 'firebase/auth';

export default function RewardsScreen() {
  const router = useRouter();
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [userRewardsData, setUserRewardsData] = useState(null);
  const [rewardRedeemed, setRewardRedeemed] = useState(false);
  const [redeemedRewardName, setRedeemedRewardName] = useState('');

  // Reward tiers - adjust these values as needed
  const rewardTiers = [
    {
      id: 1,
      name: 'Compost Bags',
      icon: 'recycle',
      description: '50 eco-friendly bags',
      pointsRequired: 5,
      pointsToEarn: 5,
      bgColor: '#D1FAE5',
      iconColor: '#10B981',
      redeemValue: 50,
    },
    {
      id: 2,
      name: 'Bill Discount',
      icon: 'percent',
      description: '10% off next bill',
      pointsRequired: 15,
      pointsToEarn: 10,
      bgColor: '#FEF3C7',
      iconColor: '#F59E0B',
      redeemValue: 100,
    },
    {
      id: 3,
      name: 'Eco-Bonus',
      icon: 'trending',
      description: '200 bonus points',
      pointsRequired: 30,
      pointsToEarn: 15,
      bgColor: '#DBEAFE',
      iconColor: '#3B82F6',
      redeemValue: 200,
    },
    {
      id: 4,
      name: 'Premium Service',
      icon: 'recycle',
      description: 'Priority collection',
      pointsRequired: 50,
      pointsToEarn: 20,
      bgColor: '#E9D5FF',
      iconColor: '#A855F7',
      redeemValue: 300,
    },
  ];

  useFocusEffect(
    React.useCallback(() => {
      fetchUserRewardsData();
    }, [])
  );

  const fetchUserRewardsData = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        console.error('No user logged in');
        setLoading(false);
        return;
      }

      // Get user rewards document
      const userRewardsRef = doc(db, 'userRewards', userId);
      const userRewardsSnap = await getDoc(userRewardsRef);

      if (userRewardsSnap.exists()) {
        const data = userRewardsSnap.data();
        setCurrentPoints(data.totalPoints || 0);
        setUserRewardsData(data);
      } else {
        // Initialize rewards for new user
        const newUserRewards = {
          userId,
          totalPoints: 0,
          currentTierPoints: 0,
          redeemedRewards: [],
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };
        await updateDoc(userRewardsRef, newUserRewards).catch(() => {
          // If doc doesn't exist, it will be created on first payment
          setUserRewardsData(newUserRewards);
        });
        setCurrentPoints(0);
        setUserRewardsData(newUserRewards);
      }
    } catch (error) {
      console.error('Error fetching user rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (currentPoints < reward.pointsRequired) {
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      const userRewardsRef = doc(db, 'userRewards', userId);

      const newTotalPoints = currentPoints - reward.pointsRequired;

      await updateDoc(userRewardsRef, {
        totalPoints: newTotalPoints,
        redeemedRewards: [
          ...(userRewardsData?.redeemedRewards || []),
          {
            rewardId: reward.id,
            rewardName: reward.name,
            pointsUsed: reward.pointsRequired,
            redeemedAt: new Date().toISOString(),
          },
        ],
        lastUpdated: new Date().toISOString(),
      });

      setCurrentPoints(newTotalPoints);
      setRedeemedRewardName(reward.name);
      setRewardRedeemed(true);
      setTimeout(() => {
        setRewardRedeemed(false);
      }, 3000);
    } catch (error) {
      console.error('Error redeeming reward:', error);
    }
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
      default:
        return null;
    }
  };

  const getProgressPercentage = (reward) => {
    return Math.min((currentPoints / reward.pointsRequired) * 100, 100);
  };

  const getRemainingPoints = (reward) => {
    return Math.max(reward.pointsRequired - currentPoints, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Header */}
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

            {/* Available Rewards */}
            <Text style={styles.sectionTitle}>Available Rewards</Text>
            {rewardTiers.map((reward) => {
              const isLocked = currentPoints < reward.pointsRequired;
              const progress = getProgressPercentage(reward);
              const remaining = getRemainingPoints(reward);

              return (
                <View key={reward.id} style={styles.rewardCardContainer}>
                  <TouchableOpacity
                    style={[
                      styles.rewardCard,
                      isLocked && styles.rewardCardLocked
                    ]}
                    onPress={() => !isLocked && handleRedeem(reward)}
                    disabled={isLocked}
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
                      </View>
                    </View>
                    <View style={styles.rewardPointsDisplay}>
                      <Text style={[
                        styles.rewardPoints,
                        isLocked && styles.rewardPointsDisabled
                      ]}>
                        {reward.pointsRequired} pts
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Progress Bar */}
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
                        <Text style={styles.unlocked}>✓ Unlocked</Text>
                      ) : (
                        <Text style={styles.remaining}>
                          {remaining} more points needed
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Success Message */}
            {rewardRedeemed && (
              <View style={styles.successCard}>
                <Text style={styles.successTitle}>Reward Redeemed</Text>
                <Text style={styles.successSubtitle}>{redeemedRewardName}</Text>
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
                <Text style={styles.infoText}>Redeem rewards instantly once unlocked</Text>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  pointsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 20,
  },
  pointsValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 72,
  },
  pointsLabel: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  rewardCardContainer: {
    marginBottom: 20,
  },
  rewardCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardCardLocked: {
    opacity: 0.7,
    backgroundColor: '#F9FAFB',
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  rewardPointsDisplay: {
    justifyContent: 'center',
  },
  rewardPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  rewardPointsDisabled: {
    color: '#9CA3AF',
  },
  progressSection: {
    marginTop: 12,
    paddingHorizontal: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  unlocked: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  remaining: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  successCard: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 24,
    marginTop: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'flex-start',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoPoint: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoBullet: {
    fontSize: 14,
    color: '#5DADE2',
    marginRight: 8,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  bottomPadding: {
    height: 20,
  },
});