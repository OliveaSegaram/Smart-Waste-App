// app/tabs/screens/managewaste/RouteSuccess.js

import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

/**
 * SOLID PRINCIPLES APPLIED:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - Component has ONE job: Display success confirmation
 *    - Navigation logic separated from UI rendering
 * 
 * 2. Open/Closed Principle (OCP):
 *    - Can extend with animations or additional actions without modifying core
 *    - Success icon can be replaced with custom component
 * 
 * 3. Liskov Substitution Principle (LSP):
 *    - Navigation object is substitutable with any navigation implementation
 * 
 * 4. Interface Segregation Principle (ISP):
 *    - Only depends on navigation prop, nothing more
 * 
 * 5. Dependency Inversion Principle (DIP):
 *    - Depends on navigation abstraction, not concrete implementation
 */

/**
 * BEST PRACTICE: Functional component with hooks
 * Simpler than class components, easier to test
 */
const RouteSuccess = ({ navigation }) => {
  /**
   * BEST PRACTICE: useEffect for analytics/logging
   * Side effects separated from rendering logic
   */
  useEffect(() => {
    
   
  }, []);

  /**
   * BEST PRACTICE: Named function for navigation
   * Makes code more readable and testable
   */
  const handleBackToDashboard = () => {
    // Navigate to root of stack (Dashboard)
    navigation.reset({
      index: 0,
      routes: [{ name: 'AdminDashboard' }],
    });
  };

  /**
   * BEST PRACTICE: Extracted render functions
   * Clean Code principle - single level of abstraction
   */
  const renderSuccessIcon = () => (
    <View style={styles.iconContainer}>
      <View style={styles.checkmarkCircle}>
        <Ionicons name="checkmark" size={80} color="#FFF" />
      </View>
    </View>
  );

  const renderSuccessMessage = () => (
    <View style={styles.messageContainer}>
      <Text style={styles.successTitle}>Awesome!</Text>
      <Text style={styles.successMessage}>Route added Successfully</Text>
    </View>
  );

  const renderActionButton = () => (
    <TouchableOpacity
      style={styles.backButton}
      onPress={handleBackToDashboard}
      activeOpacity={0.8}
    >
      <Text style={styles.backButtonText}>Back to Dashboard</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with notification */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Main content centered */}
      <View style={styles.content}>
        {renderSuccessIcon()}
        {renderSuccessMessage()}
        {renderActionButton()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={handleBackToDashboard}
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
 * BEST PRACTICE: StyleSheet for performance
 * Styles computed once, reused across renders
 */
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
    backgroundColor: '#F5F5F5',
  },
  headerSpacer: {
    width: 24,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  checkmarkCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    // BEST PRACTICE: Shadow for depth (iOS & Android compatible)
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 8,
    // BEST PRACTICE: Shadow for button depth
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButtonText: {
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

export default RouteSuccess;