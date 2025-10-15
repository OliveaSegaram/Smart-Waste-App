import { Tabs } from "expo-router";
import { Home, FileText, Star, Trash2, Building, History } from "lucide-react-native";
import { StyleSheet, View, Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#6B7280",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="screens/ManageAccount/DashboardScreen"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.navItem}>
              <Home size={size} color={focused ? "#10B981" : color} />
              <Text style={[styles.navText, focused && styles.navTextActive]}>
                Dashboard
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="screens/ManageAccount/PaymentScreen"
        options={{
          title: "Pay Bill",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.navItem}>
              <FileText size={size} color={focused ? "#10B981" : color} />
              <Text style={[styles.navText, focused && styles.navTextActive]}>
                Pay Bill
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="screens/ManageAccount/GarbageHistoryScreen"
        options={{
          title: "History",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.navItem}>
              <History size={size} color={focused ? "#10B981" : color} />
              <Text style={[styles.navText, focused && styles.navTextActive]}>
                History
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="screens/ManageAccount/RewardsScreen"
        options={{
          title: "My Rewards",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.navItem}>
              <Star size={size} color={focused ? "#10B981" : color} />
              <Text style={[styles.navText, focused && styles.navTextActive]}>
                Rewards
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="screens/ManageAccount/ScheduleScreen"
        options={{
          title: "Special Pickup",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.navItem}>
              <Trash2 size={size} color={focused ? "#10B981" : color} />
              <Text style={[styles.navText, focused && styles.navTextActive]}>
                Pickup
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="screens/ManageAccount/BusinessDashboardScreen"
        options={{
          title: "Business",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.navItem}>
              <Building size={size} color={focused ? "#10B981" : color} />
              <Text style={[styles.navText, focused && styles.navTextActive]}>
                Business
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 4,
    paddingVertical: 8,
    height: 70,
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  navText: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },
  navTextActive: {
    color: "#10B981",
    fontWeight: "600",
  },
});