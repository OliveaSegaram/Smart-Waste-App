import { Tabs, usePathname } from "expo-router";
import { BarChart3, FileText, History, Home, Star, Trash2 } from "lucide-react-native";
import { Platform, StyleSheet, View } from "react-native";

export default function TabLayout() {
  const pathname = usePathname();

  // Hide tab bar on login and register screens
  const hideTabBar =
    pathname.includes("LoginScreen") || pathname.includes("RegisterScreen");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: hideTabBar ? { display: "none" } : styles.tabBar,
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="screens/ManageAccount/DashboardScreen"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.navItem}>
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerActive,
                ]}
              >
                <Home
                  size={24}
                  color={focused ? "#10B981" : color}
                  strokeWidth={2.5}
                />
              </View>
              {focused && (
                <View style={styles.activeIndicator} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="screens/ManageAccount/PaymentScreen"
        options={{
          title: "Pay Bill",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.navItem}>
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerActive,
                ]}
              >
                <FileText
                  size={24}
                  color={focused ? "#10B981" : color}
                  strokeWidth={2.5}
                />
              </View>
              {focused && (
                <View style={styles.activeIndicator} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="screens/ManageAccount/GarbageHistoryScreen"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.navItem}>
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerActive,
                ]}
              >
                <History
                  size={24}
                  color={focused ? "#10B981" : color}
                  strokeWidth={2.5}
                />
              </View>
              {focused && (
                <View style={styles.activeIndicator} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="screens/ManageAccount/RewardsScreen"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.navItem}>
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerActive,
                ]}
              >
                <Star
                  size={24}
                  color={focused ? "#10B981" : color}
                  strokeWidth={2.5}
                />
              </View>
              {focused && (
                <View style={styles.activeIndicator} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="screens/ManageAccount/ScheduleScreen"
        options={{
          title: "Pickup",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.navItem}>
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerActive,
                ]}
              >
                <Trash2
                  size={24}
                  color={focused ? "#10B981" : color}
                  strokeWidth={2.5}
                />
              </View>
              {focused && (
                <View style={styles.activeIndicator} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="screens/ManageAccount/ReportsDashboard"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.navItem}>
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerActive,
                ]}
              >
                <BarChart3
                  size={24}
                  color={focused ? "#10B981" : color}
                  strokeWidth={2.5}
                />
              </View>
              {focused && (
                <View style={styles.activeIndicator} />
              )}
            </View>
          ),
        }}
      />

      {/* Keep BusinessDashboard but hide it from tab bar */}
      <Tabs.Screen
        name="screens/ManageAccount/BusinessDashboardScreen"
        options={{ href: null }}
      />

      {/* Keep Login & Register inside ManageAccount but hide them */}
      <Tabs.Screen
        name="screens/ManageAccount/LoginScreen"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="screens/ManageAccount/RegisterScreen"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    height: Platform.OS === "ios" ? 88 : 72,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  iconContainerActive: {
    backgroundColor: "#ECFDF5",
  },
  activeIndicator: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10B981",
    marginTop: 8,
  },
});