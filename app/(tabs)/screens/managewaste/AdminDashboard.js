// app/tabs/screens/managewaste/AdminDashboard.js

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import BinCard from '../../../../components/BinCard';
import StatCard from '../../../../components/StatCard';

/**
 * SOLID PRINCIPLES APPLIED:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - This component is responsible ONLY for displaying the admin dashboard
 *    - Data fetching logic is separated (will be in hooks/services)
 *    - Reusable components (StatCard, BinCard) handle their own rendering
 * 
 * 2. Open/Closed Principle (OCP):
 *    - Component accepts props for customization without modifying internals
 *    - StatCard and BinCard are extensible through props
 * 
 * 3. Dependency Inversion Principle (DIP):
 *    - Depends on abstractions (props, state) not concrete implementations
 *    - Firebase logic will be injected via services/hooks
 */

const { width } = Dimensions.get('window');

const AdminDashboard = ({ navigation }) => {
     const router = useRouter();
  // STATE MANAGEMENT - SRP: Separate concerns for different data types
  const [stats, setStats] = useState({
    totalBins: 50,
    binsNeedingCollection: 12,
    totalCollections: 24,
  });

  const [historicalData, setHistoricalData] = useState([
    { day: 'Mon', level: 85 },
    { day: 'Tue', level: 72 },
    { day: 'Wed', level: 65 },
    { day: 'Thu', level: 88 },
    { day: 'Fri', level: 78 },
    { day: 'Sat', level: 90 },
    { day: 'Sun', level: 82 },
  ]);

  const [latestBin, setLatestBin] = useState({
    id: 'ID-258800',
    location: 'SMT, Motueka',
    weight: '65kg',
    fillLevel: 90,
    status: 'FULL',
  });

  /**
   * BEST PRACTICE: useEffect for side effects
   * - Separates data fetching from rendering logic (SRP)
   * - Clean up function prevents memory leaks
   */
  useEffect(() => {
    // TODO: Fetch data from Firebase
    // This will be replaced with actual Firebase calls
    fetchDashboardData();

    return () => {
      // Cleanup function
    };
  }, []);

  /**
   * BEST PRACTICE: Separate functions for different operations (SRP)
   * DIP: This function will depend on injected Firebase service
   */
  const fetchDashboardData = async () => {
    try {
      // TODO: Replace with Firebase fetching logic
      // const data = await FirebaseService.getDashboardStats();
      // setStats(data.stats);
      // setHistoricalData(data.historical);
      // setLatestBin(data.latestBin);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // BEST PRACTICE: Error handling
    }
  };

  /**
   * BEST PRACTICE: Event handlers separated from JSX (Clean Code)
   */
  const handleAddToRoute = () => {
    navigation.navigate('BinStatus', { binId: latestBin.id });
  };

  const handleViewDetails = () => {
    navigation.navigate('BinStatus', { binId: latestBin.id });
  };

  /**
   * BEST PRACTICE: Separate render functions for complex UI sections (SRP)
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Good Morning !</Text>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome </Text>
          <Text style={styles.welcomeName}>Back</Text>
          <Ionicons name="chevron-down" size={20} color="#000" />
        </View>
      </View>
      <TouchableOpacity style={styles.notificationButton}>
        <Ionicons name="notifications-outline" size={24} color="#000" />
        <View style={styles.notificationDot} />
      </TouchableOpacity>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <StatCard
        title="Total Bins"
        value={stats.totalBins}
        change="+2"
        backgroundColor="#4ECCA3"
      />
      <StatCard
        title="Bins Needing Collection"
        value={stats.binsNeedingCollection}
        backgroundColor="#4ECCA3"
      />
      <StatCard
        title="Total Bins"
        value={stats.totalCollections}
        backgroundColor="#4ECCA3"
      />
    </View>
  );

  /**
   * BEST PRACTICE: Rendering chart with normalized data
   * - Pure function approach (no side effects)
   */
  const renderHistoricalChart = () => {
    const maxLevel = Math.max(...historicalData.map(d => d.level));
    
    return (
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Historical Fill Levels</Text>
        <Text style={styles.chartSubtitle}>Fill Level (%)</Text>
        <View style={styles.chartContainer}>
          {historicalData.map((data, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(data.level / maxLevel) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{data.day}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderLatestBinStatus = () => (
    <View style={styles.latestBinSection}>
      <Text style={styles.sectionTitle}>Latest Bin Status</Text>
      <BinCard
        bin={latestBin}
        onAddToRoute={handleAddToRoute}
        onViewDetails={handleViewDetails}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        
        <View style={styles.dashboardTitle}>
          <Text style={styles.dashboardText}>Admin Dashboard</Text>
        </View>

        {renderStatsCards()}
        {renderHistoricalChart()}
        {renderLatestBinStatus()}
      </ScrollView>

      {/* BEST PRACTICE: Bottom Navigation - Component Composition */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#000" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbox-outline" size={24} color="#666" />
          <Text style={[styles.navLabel, styles.navLabelInactive]}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="search-outline" size={24} color="#666" />
          <Text style={[styles.navLabel, styles.navLabelInactive]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={[styles.navLabel, styles.navLabelInactive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * BEST PRACTICE: StyleSheet for performance optimization
 * - Styles are created once and reused
 * - Better performance than inline styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#FFF',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '400',
  },
  welcomeName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 5,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  dashboardTitle: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dashboardText: {
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 20,
    gap: 10,
  },
  chartSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: '70%',
    height: 120,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: '#E8A5A5',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
  },
  latestBinSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    marginBottom: 100,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 11,
    marginTop: 4,
    color: '#000',
  },
  navLabelInactive: {
    color: '#666',
  },
});

export default AdminDashboard;