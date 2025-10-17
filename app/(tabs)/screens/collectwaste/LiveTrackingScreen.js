import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

/**
 * LiveTrackingScreen Component
 * Displays real-time tracking of agent and assigned bin locations
 * Allows messaging and navigation to scan screen
 * 
 * @component
 * @follows Single Responsibility Principle - Handles live tracking display
 * @follows Dependency Inversion Principle - Depends on abstractions (props/state)
 */
const LiveTrackingScreen = ({ navigation, route }) => {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');

  // Mock data - Replace with actual real-time data from API/WebSocket
  const agentData = {
    id: '324800',
    name: 'Hanohana',
    contact: '9011234560',
    address: 'Kaduwela Rd, Malabe, SLIT.',
    status: 'Assigned',
    pickupTime: '6/20/24',
    completeTime: '6/22/24',
    latitude: 28.6139,
    longitude: 77.2090,
  };

  const routeCoordinates = [
    { latitude: 28.6139, longitude: 77.2090 },
    { latitude: 28.6189, longitude: 77.2140 },
    { latitude: 28.6239, longitude: 77.2190 },
    { latitude: 28.6289, longitude: 77.2240 },
  ];

  const destinationCoordinates = {
    latitude: 28.6289,
    longitude: 77.2240,
  };

  /**
   * AgentInfoCard Component
   * Displays detailed information about the assigned agent
   * @follows Single Responsibility Principle
   */
  const AgentInfoCard = () => (
    <View style={styles.agentCard}>
      <View style={styles.agentHeader}>
        <View style={styles.agentAvatar}>
          <Ionicons name="person" size={32} color="#666" />
        </View>
        <View style={styles.agentInfo}>
          <Text style={styles.agentName}>{agentData.name}</Text>
          <Text style={styles.agentAddress}>{agentData.address}</Text>
        </View>
        <TouchableOpacity style={styles.expandButton}>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.agentDetails}>
        <DetailRow label="ID Details" value={agentData.id} />
        <DetailRow label="Contact" value={agentData.contact} />
      </View>

      <View style={styles.statusContainer}>
        <StatusBadge label="Assigned" status={agentData.status} />
        <StatusBadge label="Pick Up" time={agentData.pickupTime} />
        <StatusBadge label="Complete" time={agentData.completeTime} />
      </View>
    </View>
  );

  /**
   * DetailRow Component
   * Reusable component for displaying label-value pairs
   * @follows DRY Principle
   */
  const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label} -</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  /**
   * StatusBadge Component
   * Displays status information with appropriate styling
   * @follows Single Responsibility Principle
   */
  const StatusBadge = ({ label, status, time }) => (
    <View style={styles.statusBadge}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{status || time}</Text>
    </View>
  );

  /**
   * MessageModal Component
   * Modal for sending messages to admin/support
   * @follows Single Responsibility Principle
   */
  const MessageModal = () => (
    <Modal
      visible={showMessageModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowMessageModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Message</Text>
            <TouchableOpacity
              onPress={() => setShowMessageModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.messageInput}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => {
              // Handle message send
              console.log('Message sent:', message);
              setMessage('');
              setShowMessageModal(false);
            }}
          >
            <Text style={styles.sendButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleScanQR = () => {
    navigation.navigate('ScanBinQR', { binId: agentData.id });
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
        <Text style={styles.headerTitle}>Live tracking</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>Agent Assigned for Pick-up</Text>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: agentData.latitude,
            longitude: agentData.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/* Agent Location Marker */}
          <Marker
            coordinate={{
              latitude: agentData.latitude,
              longitude: agentData.longitude,
            }}
            title="Agent Location"
          >
            <View style={styles.agentMarker}>
              <Ionicons name="car" size={24} color="#FFFFFF" />
            </View>
          </Marker>

          {/* Destination Marker */}
          <Marker
            coordinate={destinationCoordinates}
            title="Bin Location"
          >
            <View style={styles.destinationMarker}>
              <Ionicons name="location" size={30} color="#FF5252" />
            </View>
          </Marker>

          {/* Route Polyline */}
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#FF5252"
            strokeWidth={3}
          />
        </MapView>

        {/* My Location Button */}
        <TouchableOpacity style={styles.myLocationButton}>
          <Ionicons name="navigate-circle-outline" size={28} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Agent Info Card */}
      <View style={styles.bottomSection}>
        <AgentInfoCard />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => setShowMessageModal(true)}
          >
            <Text style={styles.messageButtonText}>Send message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Message Modal */}
      <MessageModal />

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
          <Ionicons name="search-outline" size={24} color="#999" />
          <Text style={styles.navText}>Search</Text>
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
  subtitleContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  agentMarker: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  destinationMarker: {
    alignItems: 'center',
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  agentCard: {
    paddingHorizontal: 20,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  agentAddress: {
    fontSize: 13,
    color: '#666',
  },
  expandButton: {
    padding: 5,
  },
  agentDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 5,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statusBadge: {
    flex: 1,
    marginHorizontal: 5,
  },
  statusLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  messageButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  messageInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: '#333',
    minHeight: 120,
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  sendButtonText: {
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
});

export default LiveTrackingScreen;