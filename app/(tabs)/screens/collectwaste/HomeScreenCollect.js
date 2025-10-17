import { Ionicons } from '@expo/vector-icons';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * HomeScreen Component
 * Displays the truck operator's dashboard with bin collection statistics
 * and lists of pending/collected bins
 * 
 * @component
 * @follows Single Responsibility Principle - Handles only dashboard display
 */
const HomeScreenCollect = ({ navigation }) => {
  // Mock data - Replace with actual data from API/State Management
  const stats = {
    noOfBinList: 100,
    noOfCollectedBin: 50,
    noOfNonCollectedBin: 50,
  };

  const binList = [
    {
      id: 'ID-324800',
      location: 'SLIT, Malabe',
      weight: '8 KG',
      daysAgo: '3 Days AGO',
      status: 'Pending',
    },
    {
      id: 'ID-324800',
      location: 'SLIT, Malabe',
      weight: '8 KG',
      daysAgo: '2 Days AGO',
      status: 'Pending',
    },
    {
      id: 'ID-324800',
      location: 'SLIT, Malabe',
      weight: '8 KG',
      daysAgo: '1 Days AGO',
      status: 'Pending',
    },
    {
      id: 'ID-324800',
      location: 'SLIT, Malabe',
      weight: '8 KG',
      daysAgo: '3 Days AGO',
      status: 'Pending',
    },
  ];

  const collectedBins = [
    // Similar structure to binList but with collected status
  ];

  /**
   * Renders individual bin item in the list
   * @follows Open/Closed Principle - Can be extended without modification
   */
  const renderBinItem = ({ item }) => (
    <TouchableOpacity
      style={styles.binCard}
      onPress={() => navigation.navigate('FindLocation', { binId: item.id })}
      activeOpacity={0.7}
    >
      <Image
        source={require('../../../../assets/images/bin.jpg')} // Replace with actual image
        style={styles.binImage}
        defaultSource={require('../../../../assets/images/bin.jpg')}
      />
      <View style={styles.binDetails}>
        <Text style={styles.binId}>{item.id}</Text>
        <Text style={styles.binLocation}>{item.location}</Text>
        <View style={styles.binMetaRow}>
          <View style={styles.weightBadge}>
            <Text style={styles.weightText}>Weight</Text>
            <Text style={styles.weightValue}>{item.weight}</Text>
          </View>
          <Text style={styles.daysAgo}>{item.daysAgo}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  /**
   * Header component displaying user greeting and statistics
   * @follows Single Responsibility Principle
   */
  const DashboardHeader = () => (
    <View style={styles.header}>
      <View style={styles.greetingSection}>
        <Text style={styles.greetingText}>Good Morning!</Text>
        <Text style={styles.welcomeText}>
          Welcome <Text style={styles.boldText}>Back</Text>
        </Text>
        <TouchableOpacity style={styles.notificationIcon}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <StatCard label="No of Bin List" value={stats.noOfBinList} />
        <StatCard
          label="No of Collected Bin"
          value={stats.noOfCollectedBin}
        />
        <StatCard
          label="No of Non - Collected Bin"
          value={stats.noOfNonCollectedBin}
        />
      </View>
    </View>
  );

  /**
   * Reusable StatCard component
   * @follows DRY principle and Single Responsibility
   */
  const StatCard = ({ label, value }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <DashboardHeader />

      {/* Tab Headers */}
      <View style={styles.tabContainer}>
        <View style={styles.tabHeader}>
          <TouchableOpacity style={styles.activeTab}>
            <Text style={styles.activeTabText}>Bin List</Text>
            <Ionicons name="list-outline" size={20} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.inactiveTab}
            onPress={() => {
              /* Switch to collected bins */
            }}
          >
            <Text style={styles.inactiveTabText}>Collected Bin List</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {/* Clear filters */}}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bin List */}
      <FlatList
        data={binList}
        renderItem={renderBinItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#4CAF50" />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Messages')}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#999" />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search-outline" size={24} color="#999" />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color="#999" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 14,
    color: '#666',
  },
  welcomeText: {
    fontSize: 24,
    color: '#333',
    fontWeight: '400',
    position: 'absolute',
    left: 0,
    top: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
  notificationIcon: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5252',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  tabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  inactiveTab: {
    flex: 1,
    marginLeft: 20,
  },
  inactiveTabText: {
    fontSize: 14,
    color: '#999',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 80,
  },
  binCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  binImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  binDetails: {
    flex: 1,
    marginLeft: 15,
  },
  binId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  binLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  binMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weightBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  weightText: {
    fontSize: 11,
    color: '#666',
  },
  weightValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  daysAgo: {
    fontSize: 11,
    color: '#999',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    color: '#F57C00',
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 11,
    color: '#999',
  },
  activeNavText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default HomeScreenCollect;