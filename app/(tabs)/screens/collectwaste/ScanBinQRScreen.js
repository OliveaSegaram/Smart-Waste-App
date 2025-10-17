//import { Ionicons } from '@expo/vector-icons';
//import { BarCodeScanner } from 'expo-barcode-scanner';
//import { Camera } from 'expo-camera';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * ScanBinQRScreen Component
 * Handles QR/RFID code scanning for bin identification
 * Provides feedback and error handling for scan operations
 * 
 * @component
 * @follows Single Responsibility Principle - Handles only QR scanning
 * @follows Open/Closed Principle - Can be extended for additional scan types
 */
const ScanBinQRScreen = ({ navigation, route }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Request camera permission on component mount
   * @follows Dependency Inversion Principle - Depends on Camera API abstraction
   */
  useEffect(() => {
    const getCameraPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermission();
  }, []);

  /**
   * Handles QR code scan event
   * Validates bin ID and navigates to appropriate screen
   * @follows Single Responsibility Principle
   * 
   * @param {Object} scanResult - The scan result from barcode scanner
   */
  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;

    setScanned(true);
    setIsProcessing(true);

    try {
      // Simulate API call to verify bin ID
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate the scanned data
      const isValidBin = validateBinId(data);

      if (isValidBin) {
        setIsProcessing(false);
        Alert.alert(
          'Success',
          'Bin scanned successfully!',
          [
            {
              text: 'Mark as Collected',
              onPress: () => handleMarkAsCollected(data),
            },
            {
              text: 'Cancel',
              onPress: () => {
                setScanned(false);
                setIsProcessing(false);
              },
              style: 'cancel',
            },
          ]
        );
      } else {
        throw new Error('Invalid bin ID');
      }
    } catch (error) {
      setIsProcessing(false);
      Alert.alert(
        'Error',
        'Bin not found. Please try again or enter manually.',
        [
          {
            text: 'Retry',
            onPress: () => setScanned(false),
          },
          {
            text: 'Enter Manually',
            onPress: () => handleManualEntry(),
          },
        ]
      );
    }
  };

  /**
   * Validates the scanned bin ID
   * @follows Single Responsibility Principle
   * 
   * @param {string} binId - The scanned bin ID
   * @returns {boolean} Whether the bin ID is valid
   */
  const validateBinId = (binId) => {
    // Add your validation logic here
    // Example: Check format, verify against database, etc.
    return binId && binId.startsWith('ID-');
  };

  /**
   * Handles marking bin as collected
   * Updates system and navigates to confirmation screen
   * 
   * @param {string} binId - The bin ID to mark as collected
   */
  const handleMarkAsCollected = async (binId) => {
    try {
      // Simulate API call to update bin status
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Navigate to success screen or back to home
      navigation.navigate('Home', { 
        collectedBinId: binId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update bin status. Please try again.');
      setScanned(false);
    }
  };

  /**
   * Handles manual bin ID entry
   * Opens input modal for manual entry
   */
  const handleManualEntry = () => {
    // Navigate to manual entry screen or show modal
    Alert.prompt(
      'Enter Bin ID',
      'Please enter the bin ID manually',
      [
        {
          text: 'Cancel',
          onPress: () => setScanned(false),
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: (binId) => {
            if (validateBinId(binId)) {
              handleMarkAsCollected(binId);
            } else {
              Alert.alert('Error', 'Invalid bin ID format');
              setScanned(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  /**
   * Handles reporting issues with the bin
   * Opens issue reporting interface
   */
  const handleReportIssue = () => {
    Alert.alert(
      'Report Issue',
      'Select the type of issue',
      [
        {
          text: 'Bin Not Found',
          onPress: () => reportIssue('not_found'),
        },
        {
          text: 'Bin Damaged',
          onPress: () => reportIssue('damaged'),
        },
        {
          text: 'Bin Blocked',
          onPress: () => reportIssue('blocked'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  /**
   * Reports an issue with the bin
   * @param {string} issueType - Type of issue being reported
   */
  const reportIssue = async (issueType) => {
    try {
      // Simulate API call to report issue
      await new Promise((resolve) => setTimeout(resolve, 500));

      Alert.alert(
        'Issue Reported',
        'Your issue has been reported to the admin.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to report issue. Please try again.');
    }
  };

  // Handle permission states
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-off" size={64} color="#999" />
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Bin QR Code</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Camera Scanner */}
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Scan Frame Overlay */}
        <View style={styles.scannerOverlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* QR Code Icon in Center */}
        <View style={styles.qrIconContainer}>
          <View style={styles.qrIcon}>
            <Ionicons name="qr-code" size={80} color="#FFFFFF" />
          </View>
        </View>

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionText}>
          Position the QR code within the frame
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setScanned(false)}
          disabled={!scanned || isProcessing}
        >
          <Ionicons name="scan" size={24} color="#FFFFFF" />
          <Text style={styles.scanButtonText}>Scan QR Code</Text>
        </TouchableOpacity>

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleReportIssue}
          >
            <Text style={styles.secondaryButtonText}>Report Issue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.alternativeButton}
            onPress={handleManualEntry}
          >
            <Text style={styles.alternativeButtonText}>Bin Not Found</Text>
          </TouchableOpacity>
        </View>
      </View>

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
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 34,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4CAF50',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  qrIconContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrIcon: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 20,
    padding: 20,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
  },
  instructionsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FF5252',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  alternativeButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  alternativeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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

export default ScanBinQRScreen;