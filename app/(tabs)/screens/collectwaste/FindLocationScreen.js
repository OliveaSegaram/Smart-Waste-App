import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
//import MapView, { Marker, Polyline } from 'react-native-maps';

/**
 * FindLocationScreen Component
 * Displays map with bin locations and navigation routes
 * 
 * @component
 * @follows Single Responsibility Principle - Handles location display and navigation
 * @follows Open/Closed Principle - Extensible for additional map features
 */
const FindLocationScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Mock data - Replace with actual data from API
  const currentLocation = {
    latitude: 28.6139,
    longitude: 77.2090,
    name: 'Welcome Kaduwela',
  };

  const nextLocations = [
    {
      id: '1',
      name: 'Location 2',
      address: 'Service Rd, SLIT, Malabe',
      weight: '6 KG',
      latitude: 28.6239,
      longitude: 77.2190,
      //image: require('./assets/location-image.png'),
    },
    // Add more locations as needed
  ];

  const routeCoordinates = [
    { latitude: 28.6139, longitude: 77.2090 },
    { latitude: 28.6189, longitude: 77.2140 },
    { latitude: 28.6239, longitude: 77.2190 },
  ];

  /**
   * LocationCard Component
   * Reusable card for displaying location information
   * @follows Single Responsibility Principle
   */
  const LocationCard = ({ location }) => (
    <View style={styles.locationCard}>
      {/*<Image source={location.image} style={styles.locationImage} />*/}
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{location.name}</Text>
        <Text style={styles.locationAddress}>{location.address}</Text>
        <View style={styles.weightBadge}>
          <Text style={styles.weightText}>Weight</Text>
          <Text style={styles.weightValue}>{location.weight}</Text>
        </View>
      </View>
    </View>
  );

  /**
   * SearchBar Component
   * Handles location search functionality
   * @follows Single Responsibility Principle
   */
  const SearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={20} color="#999" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search Location"
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Ionicons name="mic-outline" size={20} color="#999" />
    </View>
  );

  /**
   * CurrentLocationBanner Component
   * Displays the current location information
   * @follows Single Responsibility Principle
   */
  const CurrentLocationBanner = () => (
    <View style={styles.currentLocationBanner}>
      <View style={styles.locationRow}>
        <Ionicons name="location" size={18} color="#333" />
        <Text style={styles.currentLocationText}>
          {currentLocation.name}
        </Text>
      </View>
      <TouchableOpacity style={styles.myLocationButton}>
        <Ionicons name="navigate-circle-outline" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );

  /**
   * NextLocationsSection Component
   * Displays list of upcoming collection locations
   * @follows Single Responsibility Principle
   */
  const NextLocationsSection = () => (
    <View style={styles.nextLocationsContainer}>
      <Text style={styles.sectionTitle}>Next Locations</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.locationsScrollView}
      >
        {nextLocations.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </ScrollView>
      <View style={styles.paginationDots}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );

  const handleNextLocation = () => {
    navigation.navigate('LiveTracking');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Location</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <SearchBar />
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Current Location Marker */}
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Current Location"
          >
            <View style={styles.currentMarker}>
              <Ionicons name="location" size={30} color="#2196F3" />
            </View>
          </Marker>

          {/* Next Location Markers */}
          {nextLocations.map((location) => (
            <Marker
              key={location.id}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={location.name}
            >
              <View style={styles.nextMarker}>
                <Ionicons name="location" size={30} color="#4CAF50" />
              </View>
            </Marker>
          ))}

          {/* Route Polyline */}
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#FF5252"
            strokeWidth={3}
          />
        </MapView>

        {/* Map Overlays */}
        <CurrentLocationBanner />
      </View>

      {/* Next Locations Section */}
      <NextLocationsSection />

      {/* Next Location Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNextLocation}
        activeOpacity={0.8}
      >
        <Text style={styles.nextButtonText}>Next Location</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={24} color="#999" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubbles-outline" size={24} color="#999" />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="search" size={24} color="#4CAF50" />
          <Text style={[styles.navText, styles.activeNavText]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  currentMarker: {
    alignItems: 'center',
  },
  nextMarker: {
    alignItems: 'center',
  },
  currentLocationBanner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  myLocationButton: {
    padding: 5,
  },
  nextLocationsContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  locationsScrollView: {
    paddingHorizontal: 20,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginRight: 15,
    width: 280,
  },
//   locationImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     backgroundColor: '#E0E0E0',
//   },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  weightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
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
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  activeDot: {
    backgroundColor: '#4CAF50',
    width: 24,
  },
  nextButton: {
    backgroundColor: '#2196F3',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomNav: {
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

export default FindLocationScreen;