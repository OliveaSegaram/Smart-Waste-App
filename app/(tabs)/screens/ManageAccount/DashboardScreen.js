import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { DollarSign, Trash2, Award, Calendar, Bell, User, LogOut, Edit2, X, MapPin, Phone, Mail } from 'lucide-react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { collection, getDocs, query, orderBy, limit, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../../firebase';
import { signOut } from 'firebase/auth';

export default function DashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [latestCollection, setLatestCollection] = useState(null);
  const [nextSchedule, setNextSchedule] = useState(null);
  const [currentBill, setCurrentBill] = useState({ amount: 0, unpaidCount: 0 });
  const [currentPoints, setCurrentPoints] = useState(0);
  const [nextReward, setNextReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
  });

  useFocusEffect(
    React.useCallback(() => {
      console.log('Dashboard focused - fetching data...');
      fetchUserData();
      fetchData();
    }, [])
  );

  useEffect(() => {
    console.log('Notifications state updated:', notifications);
    console.log('Has unread notifications:', hasUnreadNotifications);
  }, [notifications, hasUnreadNotifications]);

  const fetchUserData = async () => {
    try {
      const userId = auth.currentUser?.uid || params.uid;
      if (!userId) return;

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setEditFormData({
          fullName: data.fullName || '',
          phone: data.phone || '',
          address: data.address || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchLatestCollection(),
        fetchCurrentBill(),
        fetchNextSchedule(),
        fetchUserRewards(),
      ]);
      // Generate notifications after all data is fetched
      await generateNotifications();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = async () => {
    const notifs = [];
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    
    try {
      const userId = auth.currentUser?.uid || params.uid;
      
      if (!userId) {
        console.log('No user ID found');
        setNotifications([]);
        setHasUnreadNotifications(false);
        return;
      }

      console.log('Generating notifications for user:', userId);

      // Check for unpaid bills
      const billQuery = query(
        collection(db, 'garbageCollections'),
        where('status', '==', 'Unpaid'),
        where('month', '==', currentMonth)
      );
      const billSnapshot = await getDocs(billQuery);
      
      console.log('Unpaid bills found:', billSnapshot.size);
      
      if (!billSnapshot.empty) {
        let totalAmount = 0;
        billSnapshot.forEach((doc) => {
          const data = doc.data();
          totalAmount += parseFloat(data.totalCost) || 0;
        });
        
        notifs.push({
          id: 'payment-' + Date.now(),
          type: 'payment',
          title: 'Payment Due',
          message: `You have an unpaid bill of ${totalAmount.toFixed(2)} for ${currentMonth}`,
          timestamp: new Date().toISOString(),
          priority: 'high',
          action: 'pay',
        });
      }

      // Check for scheduled pickups
      const scheduleQuery = query(
        collection(db, 'schedules'),
        where('userId', '==', userId),
        where('status', '==', 'Scheduled')
      );
      const scheduleSnapshot = await getDocs(scheduleQuery);
      
      console.log('Scheduled pickups found:', scheduleSnapshot.size);
      
      scheduleSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Schedule data:', data);
        notifs.push({
          id: 'schedule-' + doc.id,
          type: 'schedule',
          title: 'Upcoming Pickup',
          message: `${data.wasteType} waste pickup scheduled for ${data.preferredDate} at ${data.preferredTime}`,
          timestamp: data.createdAt || new Date().toISOString(),
          priority: 'medium',
          action: 'view',
        });
      });

      // Sort by priority and timestamp
      notifs.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (a.priority !== 'high' && b.priority === 'high') return 1;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      console.log('Total notifications:', notifs.length);
      setNotifications(notifs);
      setHasUnreadNotifications(notifs.length > 0);
    } catch (error) {
      console.error('Error generating notifications:', error);
      setNotifications([]);
      setHasUnreadNotifications(false);
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
      const userId = auth.currentUser?.uid || params.uid;
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
      const userId = auth.currentUser?.uid || params.uid;
      if (!userId) return;

      const userRewardsRef = doc(db, 'userRewards', userId);
      const userRewardsSnap = await getDoc(userRewardsRef);

      let points = 0;
      let claimedRewards = [];
      
      if (userRewardsSnap.exists()) {
        const data = userRewardsSnap.data();
        points = data.totalPoints || 0;
        claimedRewards = data.claimedRewards || [];
      }
      
      setCurrentPoints(points);

      const rewardTasksQuery = query(
        collection(db, 'rewardTasks'), 
        orderBy('pointsRequired', 'asc')
      );
      const rewardTasksSnapshot = await getDocs(rewardTasksQuery);
      
      const rewardTasks = [];
      rewardTasksSnapshot.forEach((doc) => {
        rewardTasks.push({ id: doc.id, ...doc.data() });
      });

      if (rewardTasks.length === 0) {
        setNextReward(null);
        return;
      }

      const nextRewardTier = rewardTasks.find(reward => {
        const isClaimed = claimedRewards.some(
          claimed => claimed.rewardId === reward.id && claimed.status === 'active'
        );
        return !isClaimed && points < reward.pointsRequired;
      });
      
      if (nextRewardTier) {
        setNextReward({
          ...nextRewardTier,
          pointsNeeded: nextRewardTier.pointsRequired - points,
          progress: (points / nextRewardTier.pointsRequired) * 100,
        });
      } else {
        const unclaimedReward = rewardTasks.find(reward => {
          const isClaimed = claimedRewards.some(
            claimed => claimed.rewardId === reward.id && claimed.status === 'active'
          );
          return !isClaimed && points >= reward.pointsRequired;
        });

        if (unclaimedReward) {
          setNextReward({
            ...unclaimedReward,
            pointsNeeded: 0,
            progress: 100,
            canClaim: true,
          });
        } else {
          const highestTier = rewardTasks[rewardTasks.length - 1];
          setNextReward({
            ...highestTier,
            pointsNeeded: 0,
            progress: 100,
            allUnlocked: true,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user rewards:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editFormData.fullName || !editFormData.phone || !editFormData.address) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const userId = auth.currentUser?.uid || params.uid;
      if (!userId) return;

      await updateDoc(doc(db, 'users', userId), {
        fullName: editFormData.fullName,
        phone: editFormData.phone,
        address: editFormData.address,
        updatedAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Profile updated successfully');
      setShowEditModal(false);
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/(tabs)/screens/ManageAccount/LoginScreen');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const handleNotificationAction = (notification) => {
    setShowNotificationModal(false);
    if (notification.type === 'payment') {
      router.push('/(tabs)/screens/ManageAccount/PaymentScreen');
    } else if (notification.type === 'schedule') {
      router.push('/(tabs)/screens/ManageAccount/ScheduleScreen');
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

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
            <View>
              <Text style={styles.headerTitle}>Smart Waste Management</Text>
              <Text style={styles.headerSubtitle}>Welcome, {userData?.fullName || 'User'}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => setShowProfileModal(true)}
              >
                <User size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.notificationContainer}
                onPress={() => setShowNotificationModal(true)}
              >
                <Bell size={24} color="white" />
                {hasUnreadNotifications && <View style={styles.notificationDot} />}
              </TouchableOpacity>
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
                  ) : nextReward.canClaim ? (
                    <Text style={styles.canClaimText}>Ready to claim! ✓</Text>
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

        {/* Notification Modal */}
        <Modal 
          visible={showNotificationModal} 
          transparent={true} 
          animationType="slide" 
          onRequestClose={() => setShowNotificationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.notificationModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
                {notifications.length > 0 ? (
                  <>
                    <Text style={styles.notificationDebug}>
                      Found {notifications.length} notification(s)
                    </Text>
                    {notifications.map((notification) => (
                      <TouchableOpacity
                        key={notification.id}
                        style={[
                          styles.notificationItem,
                          notification.priority === 'high' && styles.notificationItemHigh
                        ]}
                        onPress={() => handleNotificationAction(notification)}
                      >
                        <View style={styles.notificationIcon}>
                          {notification.type === 'payment' ? (
                            <DollarSign size={20} color={notification.priority === 'high' ? '#EF4444' : '#10B981'} />
                          ) : (
                            <Calendar size={20} color="#5DADE2" />
                          )}
                        </View>
                        <View style={styles.notificationContent}>
                          <Text style={styles.notificationTitle}>{notification.title}</Text>
                          <Text style={styles.notificationMessage}>{notification.message}</Text>
                          <Text style={styles.notificationTime}>
                            {formatNotificationTime(notification.timestamp)}
                          </Text>
                        </View>
                        <View style={styles.notificationAction}>
                          <Text style={styles.notificationActionText}>›</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                ) : (
                  <View style={styles.noNotifications}>
                    <Bell size={48} color="#D1D5DB" />
                    <Text style={styles.noNotificationsText}>No notifications</Text>
                    <Text style={styles.noNotificationsSubtext}>
                      You're all caught up!
                    </Text>
                    <TouchableOpacity 
                      style={styles.refreshButton}
                      onPress={() => {
                        console.log('Manual refresh triggered');
                        fetchData();
                      }}
                    >
                      <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Profile Modal */}
        <Modal visible={showProfileModal} transparent={true} animationType="slide" onRequestClose={() => setShowProfileModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>My Profile</Text>
                <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {userData && (
                <>
                  <View style={styles.profileAvatarContainer}>
                    <View style={styles.profileAvatar}>
                      <User size={48} color="#5DADE2" />
                    </View>
                    <Text style={styles.profileName}>{userData.fullName}</Text>
                    <View style={styles.userTypeBadge}>
                      <Text style={styles.userTypeText}>{userData.userType || 'Resident'}</Text>
                    </View>
                  </View>

                  <View style={styles.profileInfo}>
                    <View style={styles.profileItem}>
                      <Mail size={20} color="#6B7280" />
                      <Text style={styles.profileLabel}>Email</Text>
                      <Text style={styles.profileValue}>{userData.email}</Text>
                    </View>

                    <View style={styles.profileItem}>
                      <Phone size={20} color="#6B7280" />
                      <Text style={styles.profileLabel}>Phone</Text>
                      <Text style={styles.profileValue}>{userData.phone || 'Not set'}</Text>
                    </View>

                    <View style={styles.profileItem}>
                      <MapPin size={20} color="#6B7280" />
                      <Text style={styles.profileLabel}>Address</Text>
                      <Text style={styles.profileValue}>{userData.address || 'Not set'}</Text>
                    </View>
                  </View>

                  <View style={styles.profileActions}>
                    <TouchableOpacity 
                      style={styles.editProfileButton}
                      onPress={() => {
                        setShowProfileModal(false);
                        setShowEditModal(true);
                      }}
                    >
                      <Edit2 size={20} color="white" />
                      <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.signOutButton}
                      onPress={handleSignOut}
                    >
                      <LogOut size={20} color="#EF4444" />
                      <Text style={styles.signOutButtonText}>Sign Out</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Edit Profile Modal */}
        <Modal visible={showEditModal} transparent={true} animationType="slide" onRequestClose={() => setShowEditModal(false)}>
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit Profile</Text>
                  <TouchableOpacity onPress={() => setShowEditModal(false)}>
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={editFormData.fullName}
                  onChangeText={(text) => setEditFormData({...editFormData, fullName: text})}
                />

                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  value={editFormData.phone}
                  onChangeText={(text) => setEditFormData({...editFormData, phone: text})}
                  keyboardType="phone-pad"
                />

                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your address"
                  value={editFormData.address}
                  onChangeText={(text) => setEditFormData({...editFormData, address: text})}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.modalCancelButton} 
                    onPress={() => setShowEditModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.modalSaveButton} 
                    onPress={handleUpdateProfile}
                  >
                    <Text style={styles.modalSaveText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#5DADE2', paddingHorizontal: 24, paddingVertical: 32 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 14, marginTop: 4 },
  headerIcons: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContainer: { position: 'relative' },
  notificationDot: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, backgroundColor: '#EF4444', borderRadius: 5, borderWidth: 2, borderColor: '#5DADE2' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
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
  iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  greenBg: { backgroundColor: '#D1FAE5' },
  purpleBg: { backgroundColor: '#E9D5FF' },
  cardLabel: { color: '#9CA3AF', fontSize: 14, marginBottom: 8 },
  billAmount: { fontSize: 30, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  billSubtext: { fontSize: 12, color: '#EF4444', marginBottom: 8 },
  loader: { marginVertical: 20 },
  payButton: { backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  payButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  wasteInfo: { marginBottom: 12 },
  wasteRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  wasteLabel: { fontSize: 12, color: '#6B7280' },
  wasteValue: { fontSize: 12, fontWeight: '600', color: '#111827' },
  wasteTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  wasteTotalLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  wasteTotalValue: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  noDataText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginVertical: 20 },
  noScheduleText: { fontSize: 14, color: '#9CA3AF', marginBottom: 12 },
  noRewardText: { fontSize: 14, color: '#9CA3AF', marginBottom: 12 },
  viewHistoryButton: { backgroundColor: '#3B82F6', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  viewHistoryText: { color: 'white', fontSize: 14, fontWeight: '600' },
  redeemButton: { backgroundColor: '#3B82F6', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  redeemButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  rewardName: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 },
  progressContainer: { marginBottom: 12 },
  progressBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#A855F7', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  pointsNeeded: { fontSize: 12, color: '#F59E0B', marginBottom: 8, fontWeight: '500' },
  canClaimText: { fontSize: 12, color: '#10B981', marginBottom: 8, fontWeight: '600' },
  unlockedText: { fontSize: 12, color: '#10B981', marginBottom: 8, fontWeight: '600' },
  pickupDate: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: 12 },
  pickupTime: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  pickupType: { fontSize: 12, color: '#10B981', marginTop: 8, fontWeight: '500' },
  scheduleActions: { marginTop: 12 },
  scheduleButton: { backgroundColor: '#5DADE2', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  scheduleButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalScrollContent: { flexGrow: 1 },
  notificationModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalContent: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 24,
    minHeight: '80%',
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'flex-start',
  },
  notificationItemHigh: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notificationAction: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  notificationActionText: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  noNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noNotificationsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  noNotificationsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  notificationDebug: {
    fontSize: 12,
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 16,
    backgroundColor: '#5DADE2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  profileAvatarContainer: { alignItems: 'center', marginBottom: 32 },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#5DADE2',
  },
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  userTypeBadge: { 
    backgroundColor: '#D1FAE5', 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    borderRadius: 16 
  },
  userTypeText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#10B981', 
    textTransform: 'capitalize' 
  },
  profileInfo: { marginBottom: 32 },
  profileItem: { 
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileLabel: { 
    fontSize: 13, 
    color: '#6B7280', 
    marginBottom: 6, 
    marginLeft: 16,
    fontWeight: '500',
  },
  profileValue: { 
    fontSize: 16, 
    color: '#111827', 
    fontWeight: '500', 
    marginLeft: 16,
    flex: 1,
  },
  profileActions: { gap: 16, marginTop: 8 },
  editProfileButton: {
    backgroundColor: '#5DADE2',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#5DADE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editProfileButtonText: { color: 'white', fontSize: 17, fontWeight: '600' },
  signOutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  signOutButtonText: { color: '#EF4444', fontSize: 17, fontWeight: '600' },
  inputLabel: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#111827', 
    marginBottom: 10, 
    marginTop: 20 
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  modalButtons: { flexDirection: 'row', gap: 16, marginTop: 32, marginBottom: 16 },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  modalCancelText: { fontSize: 17, color: '#6B7280', fontWeight: '600' },
  modalSaveButton: { 
    flex: 1, 
    paddingVertical: 16, 
    borderRadius: 12, 
    backgroundColor: '#10B981', 
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalSaveText: { fontSize: 17, color: 'white', fontWeight: '600' },
});