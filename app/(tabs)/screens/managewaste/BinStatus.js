// app/tabs/screens/managewaste/BinStatus.js

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CollectorCard from '../../../../components/CollectorCard';

/**
 * SOLID PRINCIPLES APPLIED:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - Component handles bin status display and collector selection ONLY
 *    - Route management logic delegated to separate functions
 *    - Each section (bin info, collectors, actions) separated into functions
 * 
 * 2. Open/Closed Principle (OCP):
 *    - Extensible through props without modifying component
 *    - CollectorCard component can be enhanced independently
 * 
 * 3. Liskov Substitution Principle (LSP):
 *    - Navigation prop can be substituted with any navigation implementation
 * 
 * 4. Interface Segregation Principle (ISP):
 *    - Only receives necessary props (navigation, route)
 * 
 * 5. Dependency Inversion Principle (DIP):
 *    - Depends on navigation abstraction, not concrete implementation
 */

const BinStatus = () => {
    //const router = useRouter();
    const params = useLocalSearchParams(); // safely get route params
    const binId = params?.binId;

    // STATE MANAGEMENT - SRP: Each state serves single purpose
    const [binData, setBinData] = useState({
        id: 'ID-258800',
        fillLevel: 90,
        fillChange: 10,
        location: 'SMT, Motueka',
    });

    const [collectors, setCollectors] = useState([
        {
            id: '1',
            name: 'Jane Smith',
            distance: '2.5km Away',
            availability: 'Available Now',
            type: 'nearest',
        },
        {
            id: '2',
            name: 'Jane Smith',
            distance: '3.5km Away',
            availability: 'Available Now',
            type: 'general',
        },
        {
            id: '3',
            name: 'James',
            distance: '5.0km Away',
            availability: 'Available Now',
            type: 'special',
        },
    ]);

    const [selectedCollectors, setSelectedCollectors] = useState([]);

    /**
     * BEST PRACTICE: useEffect for data fetching
     * Separation of Concerns - Data loading separate from rendering
     */
    useEffect(() => {
        fetchBinData();
        fetchAvailableCollectors();
    }, [binId]);

    /**
     * BEST PRACTICE: Async data fetching with error handling
     * DIP: Will depend on injected Firebase service
     */
    const fetchBinData = async () => {
        try {
            console.log('Bin ID:', binId);
            // TODO: Replace with Firebase call
            // const data = await FirebaseService.getBinDetails(binId);
            // setBinData(data);
        } catch (error) {
            console.error('Error fetching bin data:', error);
            Alert.alert('Error', 'Failed to load bin data');
        }
    };

    const fetchAvailableCollectors = async () => {
        try {
            // TODO: Replace with Firebase call
            // const data = await FirebaseService.getAvailableCollectors();
            // setCollectors(data);
        } catch (error) {
            console.error('Error fetching collectors:', error);
        }
    };

    /**
     * BEST PRACTICE: Pure function for collector selection
     * No side effects, returns new state
     */
    const toggleCollectorSelection = (collectorId) => {
        setSelectedCollectors(prev => {
            if (prev.includes(collectorId)) {
                return prev.filter(id => id !== collectorId);
            } else {
                return [...prev, collectorId];
            }
        });
    };

    /**
     * BEST PRACTICE: Separate business logic functions
     * SRP: Each function has single responsibility
     */
    const handleRemoveFromReview = () => {
        Alert.alert(
            'Remove from Review',
            'Are you sure you want to remove this bin from review?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // TODO: Firebase call to remove from review
                            // await FirebaseService.removeBinFromReview(binData.id);
                            router.back(); // use Expo Router to go back
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove bin from review');
                        }
                    },
                },
            ]
        );
    };

    const handleAddSelectedToRoute = () => {
        if (selectedCollectors.length === 0) {
            Alert.alert('No Selection', 'Please select at least one collector');
            return;
        }

        // Navigate to route management screen with selected data
        router.push({
            pathname: '/app/tabs/screens/managewaste/RouteManagement',
            params: { binId: binData.id, collectorIds: selectedCollectors },
        });
    };

    /**
     * BEST PRACTICE: Extracted render functions for readability (Clean Code)
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

    const renderBinInfo = () => (
        <View style={styles.binInfoCard}>
            <View style={styles.fillLevelContainer}>
                <Text style={styles.fillLevelLabel}>Fill Level</Text>
                <Text style={styles.fillLevelValue}>{binData.fillLevel}%</Text>
                <Text style={styles.fillLevelChange}>
                    Increased by {binData.fillChange}%
                </Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>FULL</Text>
                </View>
            </View>
        </View>
    );

    const renderCollectorsList = () => (
        <View style={styles.collectorsSection}>
            <View style={styles.collectorHeader}>
                <Text style={styles.sectionTitle}>Available Collectors</Text>
                <TouchableOpacity style={styles.assignButton}>
                    <Text style={styles.assignButtonText}>Assign Collector</Text>
                    <Ionicons name="chevron-forward" size={16} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.collectorsGrid}>
                {collectors.map((collector) => (
                    <CollectorCard
                        key={collector.id}
                        collector={collector}
                        isSelected={selectedCollectors.includes(collector.id)}
                        onPress={() => toggleCollectorSelection(collector.id)}
                    />
                ))}
            </View>
        </View>
    );

    const renderActionButtons = () => (
        <View style={styles.actionButtons}>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveFromReview}
            >
                <Text style={styles.removeButtonText}>Remove from Review</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.addToRouteButton}
                onPress={handleAddSelectedToRoute}
            >
                <Text style={styles.addToRouteButtonText}>Add Selected to Route</Text>
            </TouchableOpacity>
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
                    <Text style={styles.titleText}>Bin Status</Text>
                </View>

                {renderBinInfo()}
                {renderCollectorsList()}
                {renderActionButtons()}
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity 
                    style={styles.navItem}
                    onPress={() => router.push('/app/tabs/screens/AdminDashboard')}
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
 * BEST PRACTICE: Centralized styles using StyleSheet
 */
const styles = StyleSheet.create({
  // ... keep all your styles as is
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#FFF',
  },
  greeting: { fontSize: 14, color: '#666' },
  welcomeContainer: { flexDirection: 'row', alignItems: 'center' },
  welcomeText: { fontSize: 20, fontWeight: '400' },
  welcomeName: { fontSize: 20, fontWeight: 'bold', marginRight: 5 },
  notificationButton: { position: 'relative' },
  notificationDot: { position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4444' },
  titleBar: { backgroundColor: '#E8E8E8', paddingVertical: 12, paddingHorizontal: 20 },
  titleText: { fontSize: 16, fontWeight: '500' },
  binInfoCard: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 20, padding: 20, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  fillLevelContainer: { flex: 1, marginLeft: 20 },
  fillLevelLabel: { fontSize: 12, color: '#666' },
  fillLevelValue: { fontSize: 32, fontWeight: 'bold', color: '#000' },
  fillLevelChange: { fontSize: 12, color: '#666', marginTop: 5 },
  statusBadge: { backgroundColor: '#FF4444', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginTop: 10 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  collectorsSection: { marginTop: 20, paddingHorizontal: 20 },
  collectorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  assignButton: { flexDirection: 'row', alignItems: 'center' },
  assignButtonText: { fontSize: 12, marginRight: 5 },
  collectorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionButtons: { paddingHorizontal: 20, paddingVertical: 20, marginBottom: 100 },
  removeButton: { backgroundColor: '#FFF', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#E8E8E8' },
  removeButtonText: { fontSize: 16, fontWeight: '600', color: '#000' },
  addToRouteButton: { backgroundColor: '#2196F3', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  addToRouteButtonText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  bottomNav: { flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 10, paddingBottom: 25, borderTopWidth: 1, borderTopColor: '#E8E8E8', position: 'absolute', bottom: 0, left: 0, right: 0 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 11, marginTop: 4, color: '#000' },
  navLabelInactive: { color: '#666' },
});

export default BinStatus;
