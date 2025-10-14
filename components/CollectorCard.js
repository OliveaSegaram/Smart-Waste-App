// app/components/CollectorCard.js

import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // ✅ Added Image import
import profileImg from '../../assets/images/profile.jpg';

/**
 * ================================
 * SOLID PRINCIPLES APPLIED
 * ================================
 * 
 * 1️⃣ Single Responsibility Principle (SRP):
 *     - Component only responsible for displaying collector details visually.
 *     - Does not manage data fetching or logic — handled by parent.
 * 
 * 2️⃣ Open/Closed Principle (OCP):
 *     - New collector fields (e.g., rating, region) can be added without changing existing logic.
 * 
 * 3️⃣ Liskov Substitution Principle (LSP):
 *     - Any card following the same interface (props collector, onAssign) can replace this component.
 * 
 * 4️⃣ Interface Segregation Principle (ISP):
 *     - Requires only essential props (collector object and optional callbacks).
 * 
 * 5️⃣ Dependency Inversion Principle (DIP):
 *     - Depends on abstract actions (onAssign callback), not concrete implementation.
 */

/**
 * BEST PRACTICE: 
 * Document prop structure for clarity and maintainability.
 * 
 * @param {Object} collector - Collector data object
 * @param {string} collector.name - Collector’s full name
 * @param {string} collector.contact - Contact number or email
 * @param {string} collector.image - Optional image URL or local path
 * @param {number} collector.assignedBins - Number of bins assigned
 * @param {string} collector.region - Area or route name
 * @param {Function} onAssign - Callback for assigning a new bin/route
 * 
 **/
const CollectorCard = ({ collector, onAssign }) => {
  // Defensive check to prevent runtime errors
  if (!collector) {
    console.warn('CollectorCard requires collector prop');
    return null;
  }

  const { name, contact, image, assignedBins, region } = collector;

  return (
    <View style={styles.card}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={
            image
              ? { uri: image }
              : profileImg
          }
          style={styles.avatar}
          resizeMode="cover"
        />
        <View style={styles.infoSection}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.region}>{region}</Text>
          <Text style={styles.contact}>{contact}</Text>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Assigned Bins</Text>
          <Text style={styles.statValue}>{assignedBins}</Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.assignButton}
        onPress={onAssign}
        activeOpacity={0.7}
      >
        <Text style={styles.assignText}>Assign New Bin</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * PERFORMANCE OPTIMIZATION:
 * React.memo used to prevent unnecessary re-renders.
 * Only re-renders when props change.
 */
export default React.memo(CollectorCard);

/**
 * STYLING BEST PRACTICES:
 * - Grouped by logical sections.
 * - Clear spacing and alignment for readability.
 */
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },

  // Profile Section
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEE',
    marginRight: 12,
  },
  infoSection: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  region: {
    fontSize: 14,
    color: '#4CAF50',
    marginVertical: 2,
    fontWeight: '500',
  },
  contact: {
    fontSize: 13,
    color: '#666',
  },

  // Stats
  statsContainer: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  // Action Button
  assignButton: {
    backgroundColor: '#21f375ff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  assignText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
