import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";
import {
  Trash2,
  User,
  Calendar,
  MapPin,
  DollarSign,
  BarChart3,
  Truck,
  Building,
  Home,
  LogOut,
  Bell
} from "lucide-react-native";
import { auth } from "../../../../firebase";
import { useRouter, useLocalSearchParams } from "expo-router";

const COLORS = {
  primary: "#10b981",
  secondary: "#6b7280",
  error: "#ef4444",
  white: "#ffffff",
  background: "#f9fafb",
  border: "#e5e7eb",
  text: "#111827",
  textLight: "#6b7280",
};

const HomeScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get user data from params
  const user = {
    uid: params.uid,
    fullName: params.fullName || "User",
    email: params.email,
    userType: params.userType || "resident",
    phoneNumber: params.phoneNumber,
  };
  
  const userRole = user.userType;

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await auth.signOut();
              router.replace("/(tabs)/screens/ManageAccount/LoginScreen");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Role-based features and data
  const getRoleBasedData = () => {
    switch (userRole) {
      case "collector":
        return {
          welcomeMessage: "Ready for today's collections?",
          stats: [
            { label: "Today's Pickups", value: "12", icon: <Truck size={20} color={COLORS.primary} /> },
            { label: "Completed", value: "8", icon: <Calendar size={20} color={COLORS.primary} /> },
            { label: "Pending", value: "4", icon: <Bell size={20} color={COLORS.primary} /> },
          ],
          quickActions: [
            { title: "View Schedule", icon: <Calendar size={24} color={COLORS.white} />, color: "#10b981" },
            { title: "My Routes", icon: <MapPin size={24} color={COLORS.white} />, color: "#3b82f6" },
            { title: "Earnings", icon: <DollarSign size={24} color={COLORS.white} />, color: "#f59e0b" },
          ]
        };
      
      case "business":
        return {
          welcomeMessage: "Manage your business waste efficiently",
          stats: [
            { label: "Scheduled Pickups", value: "3", icon: <Calendar size={20} color={COLORS.primary} /> },
            { label: "This Month", value: "15", icon: <BarChart3 size={20} color={COLORS.primary} /> },
            { label: "Total Waste", value: "245kg", icon: <Trash2 size={20} color={COLORS.primary} /> },
          ],
          quickActions: [
            { title: "Schedule Pickup", icon: <Calendar size={24} color={COLORS.white} />, color: "#10b981" },
            { title: "View History", icon: <BarChart3 size={24} color={COLORS.white} />, color: "#3b82f6" },
            { title: "Billing", icon: <DollarSign size={24} color={COLORS.white} />, color: "#f59e0b" },
          ]
        };
      
      default: // resident
        return {
          welcomeMessage: "Manage your waste collection easily",
          stats: [
            { label: "Next Pickup", value: "Tomorrow", icon: <Calendar size={20} color={COLORS.primary} /> },
            { label: "This Month", value: "4", icon: <BarChart3 size={20} color={COLORS.primary} /> },
            { label: "Recycled", value: "18kg", icon: <Trash2 size={20} color={COLORS.primary} /> },
          ],
          quickActions: [
            { title: "Schedule Pickup", icon: <Calendar size={24} color={COLORS.white} />, color: "#10b981" },
            { title: "Find Centers", icon: <MapPin size={24} color={COLORS.white} />, color: "#3b82f6" },
            { title: "My History", icon: <BarChart3 size={24} color={COLORS.white} />, color: "#f59e0b" },
          ]
        };
    }
  };

  const roleData = getRoleBasedData();

  const getRoleIcon = () => {
    switch (userRole) {
      case "collector": return <Truck size={24} color={COLORS.primary} />;
      case "business": return <Building size={24} color={COLORS.primary} />;
      default: return <Home size={24} color={COLORS.primary} />;
    }
  };

  const getRoleDisplayName = () => {
    switch (userRole) {
      case "collector": return "Waste Collector";
      case "business": return "Business Owner";
      default: return "Resident";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back!</Text>
              <Text style={styles.userName}>{user.fullName}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Bell size={24} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
                <LogOut size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.roleBadge}>
            {getRoleIcon()}
            <Text style={styles.roleText}>{getRoleDisplayName()}</Text>
          </View>
          
          <Text style={styles.welcomeMessage}>{roleData.welcomeMessage}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsContainer}>
            {roleData.stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statIcon}>
                  {stat.icon}
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            {roleData.quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  {action.icon}
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#d1fae5' }]}>
                <Trash2 size={16} color={COLORS.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Waste pickup scheduled</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#dbeafe' }]}>
                <User size={16} color="#3b82f6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Profile updated</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  roleText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  welcomeMessage: {
    fontSize: 18,
    color: COLORS.textLight,
    lineHeight: 24,
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
  },
  actionsSection: {
    marginBottom: 30,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionCard: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 6,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  activitySection: {
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});

export default HomeScreen;