// app/components/BinCard.js

import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

/**
 * SOLID PRINCIPLES APPLIED:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - Component's ONLY job: Display bin information card
 *    - Business logic delegated to parent via callbacks
 * 
 * 2. Open/Closed Principle (OCP):
 *    - Can extend with new bin properties without changing core
 *    - Action buttons customizable via props
 * 
 * 3. Liskov Substitution Principle (LSP):
 *    - Can replace any bin display component
 *    - Consistent interface for all bin data
 * 
 * 4. Interface Segregation Principle (ISP):
 *    - Only requires bin data and action callbacks
 *    - No unnecessary props
 * 
 * 5. Dependency Inversion Principle (DIP):
 *    - Depends on callback abstractions, not concrete implementations
 *    - Parent controls behavior, component controls presentation
 */

/**
 * BEST PRACTICE: Documented prop interface
 * Makes component usage clear for other developers
 * 
 * @param {Object} bin - Bin data object
 * @param {string} bin.id - Bin identifier
 * @param {string} bin.location - Bin location
 * @param {string} bin.weight - Bin weight
 * @param {number} bin.fillLevel - Fill level percentage
 * @param {string} bin.status - Status (FULL, NORMAL, etc.)
 * @param {Function} onAddToRoute - Callback for add to route action
 * @param {Function} onViewDetails - Callback for view details action
 */
const BinCard = ({ bin, onAddToRoute, onViewDetails }) => {
  // Defensive check
  if (!bin) {
    console.warn('BinCard requires bin prop');
    return null;
  }

  const { id, location, weight, fillLevel, status } = bin;

  // Helper function for color coding
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'FULL':
        return '#FF4444';
      case 'WARNING':
        return '#FFA726';
      case 'NORMAL':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={styles.card}>
      {/* Bin Image */}
      <View style={styles.binImageContainer}>
        {/* <Image
          source={require('../../../../assets/images/logonav.png')}
          style={styles.logonav}
          resizeMode="contain"
        /> */}
      </View>

      {/* Bin Info Section */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Bin ID:</Text>
          <Text style={styles.value}>{id}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Fill Level:</Text>
          <Text style={[styles.value, { color: getStatusColor(status) }]}>
            {fillLevel}%
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Weight:</Text>
          <View style={styles.weightBadge}>
            <Text style={styles.weightText}>{weight} kg</Text>
          </View>
        </View>

        {/* Status */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(status) },
          ]}
        >
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddToRoute}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>Add to Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={onViewDetails}
          activeOpacity={0.7}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Performance Optimization
export default React.memo(BinCard);

// Organized Styles
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

  // Bin Image Section
  binImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  binImage: {
    width: 70,
    height: 90,
  },

  // Info Section
  infoContainer: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },
  weightBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  weightText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },

  // Status Badge
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  addButton: {
    backgroundColor: '#007BFF',
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  detailsButton: {
    backgroundColor: '#EEE',
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 6,
  },
  detailsButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
});
