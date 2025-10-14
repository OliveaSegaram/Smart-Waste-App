// app/tabs/screens/managewaste/RouteManagement.js

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

/**
 * SOLID PRINCIPLES APPLIED:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - Component responsible ONLY for route management UI
 *    - Map rendering separated into its own function
 *    - Facility cards separated into reusable sections
 * 
 * 2. Open/Closed Principle (OCP):
 *    - Can extend with new facility types without modifying core logic
 *    - Map component can be swapped with different implementations
 * 
 * 3. Liskov Substitution Principle (LSP):
 *    - Navigation prop is interchangeable with any navigation implementation
 * 
 * 4. Dependency Inversion Principle (DIP):
 *    - Depends on navigation abstraction
 *    - Firebase service will be injected via dependency injection
 */

const RouteManagement = ({ navigation, route }) => {
  // STATE MANAGEMENT - SRP: Each state has single purpose
  const [mapCenter, setMapCenter] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
  });

  const [facilities, setFacilities] = useState([
    {
      id: '1',
      type: 'recycling',
      name: 'Downtown Recycle Center',
      distance: '2.5 km away',
      //image: require('../../../../assets/images/logonav.png'),
    },
    {
      id: '2',
      type: 'composting',
      name: 'City Compost Bin',
      distance: '3.0 km away',
      //image: require('../../../../assets/images/logonav.png'),
    },
  ]);

  const [selectedFacility, setSelectedFacility] = useState(null);

  /**
   * BEST PRACTICE: useEffect for initialization
   * Separates setup logic from rendering
   */
  useEffect(() => {
    initializeRouteData();
  }, [route?.params]);

  /**
   * BEST PRACTICE: Initialization function with error handling
   * DIP: Will use injected Firebase service
   */
  const initializeRouteData = async () => {
    try {
      // TODO: Fetch route data from Firebase
      // const data = await FirebaseService.getRouteDetails(route.params);
      // setFacilities(data.facilities);
      // setMapCenter(data.center);
    } catch (error) {
      console.error('Error initializing route data:', error);
    }
  };

  /**
   * BEST PRACTICE: Event handler with navigation
   * SRP: Single purpose - handle completion action
   */
  const handleCompleteRoute = async () => {
    try {
      // TODO: Firebase call to mark route as completed
      // await FirebaseService.completeRoute({
      //   binId: route.params?.binId,
      //   collectorIds: route.params?.collectorIds,
      //   facilityId: selectedFacility
      // });
      
      navigation.navigate('RouteSuccess');
    } catch (error) {
      console.error('Error completing route:', error);
      Alert.alert('Error', 'Failed to complete route');
    }
  };

  /**
   * BEST PRACTICE: Pure function for facility selection
   * No side effects, clear state update
   */
  const selectFacility = (facilityId) => {
    setSelectedFacility(facilityId);
  };

  /**
   * BEST PRACTICE: Extracted render functions (Clean Code)
   * Improves readability and maintainability
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

  /**
   * BEST PRACTICE: Component composition for map display
   * Map could be replaced with actual map library (Google Maps/Mapbox)
   */
  const renderMap = () => (
    <View style={styles.mapContainer}>
      {/* Placeholder for actual map implementation */}
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapMarker}>
          <Ionicons name="location" size={40} color="#FF0000" />
        </View>
        <Text style={styles.mapText}>Map View</Text>
        <Text style={styles.mapSubtext}>
          Route to selected facility
        </Text>
      </View>
      {/* Map pins */}
    </View>
  );

  /**
   * BEST PRACTICE: Reusable facility card component
   * Could be extracted to separate component file
   */
  const renderFacilityCard = (facility) => (
    <TouchableOpacity
      key={facility.id}
      style={[
        styles.facilityCard,
        selectedFacility === facility.id && styles.facilityCardSelected,
      ]}
      onPress={() => selectFacility(facility.id)}
    >
      {/* <Image
        source={facility.image}
        style={styles.facilityImage}
        defaultSource={require('../../../../assets/images/logonav.png')}
      /> */}
      <View style={styles.facilityInfo}>
        <Text style={styles.facilityType}>
          {facility.type === 'recycling' ? 'Recycling' : 'Composting'}
        </Text>
        <Text style={styles.facilityName}>{facility.name}</Text>
        <Text style={styles.facilityDistance}>{facility.distance}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFacilities = () => (
    <View style={styles.facilitiesSection}>
      <View style={styles.facilitiesRow}>
        {facilities.map(facility => renderFacilityCard(facility))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        <View style={styles.titleBar}>
          <Text style={styles.titleText}>Admin Dashboard</Text>
        </View>

        {renderMap()}
        {renderFacilities()}

        <TouchableOpacity
          style={[
            styles.completeButton,
            !selectedFacility && styles.completeButtonDisabled,
          ]}
          onPress={handleCompleteRoute}
          disabled={!selectedFacility}
        >
          <Text style={styles.completeButtonText}>Completed</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <Ionicons name="home-outline" size={24} color="#666" />
          <Text style={[styles.navLabel, styles.navLabelInactive]}>Home</Text>
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
 * BEST PRACTICE: StyleSheet for optimized styling
 * Compiled once, improves performance
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
  titleBar: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C8E6C9',
  },
  mapMarker: {
    marginBottom: 10,
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  mapSubtext: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 5,
  },
  facilitiesSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  facilitiesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  facilityCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  facilityCardSelected: {
    borderColor: '#4CAF50',
  },
  facilityImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  facilityInfo: {
    alignItems: 'center',
  },
  facilityType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  facilityName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  facilityDistance: {
    fontSize: 12,
    color: '#666',
  },
  completeButton: {
    backgroundColor: '#21f375ff',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 100,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
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

export default RouteManagement;
