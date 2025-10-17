// app/components/StatCard.js

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * SOLID PRINCIPLES APPLIED:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - Component has ONE job: Display a statistic card
 *    - No business logic, pure presentation component
 * 
 * 2. Open/Closed Principle (OCP):
 *    - Open for extension via props (colors, values)
 *    - Closed for modification (core rendering logic untouched)
 * 
 * 3. Liskov Substitution Principle (LSP):
 *    - Can be used anywhere a stat display is needed
 *    - Consistent interface regardless of data passed
 * 
 * 4. Interface Segregation Principle (ISP):
 *    - Only requires props it actually uses
 *    - No dependency on unused properties
 * 
 * 5. Dependency Inversion Principle (DIP):
 *    - Depends on props abstraction, not concrete data structures
 */

/**
 * BEST PRACTICE: PropTypes for type checking (or TypeScript in .tsx)
 * Provides runtime validation and better IDE support
 * 
 * @param {string} title - The label for the stat
 * @param {number|string} value - The main value to display
 * @param {string} change - Optional change indicator (e.g., "+2")
 * @param {string} backgroundColor - Background color of the card
 */
const StatCard = ({ 
  title, 
  value, 
  change, 
  backgroundColor = '#4ECCA3' 
}) => {
  /**
   * BEST PRACTICE: Guard clause for required props
   * Defensive programming - prevents rendering errors
   */
  if (!title || value === undefined) {
    console.warn('StatCard requires title and value props');
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {/* BEST PRACTICE: Conditional rendering - only show change if provided */}
        {change && <Text style={styles.change}>{change}</Text>}
      </View>
    </View>
  );
};

/**
 * BEST PRACTICE: Memoization for performance
 * Prevents unnecessary re-renders when props haven't changed
 */
export default React.memo(StatCard);

/**
 * BEST PRACTICE: StyleSheet optimization
 * Compiled once, improves performance significantly
 */
const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    minHeight: 90,
    justifyContent: 'space-between',
    // BEST PRACTICE: Shadow for depth (cross-platform)
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  title: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
    marginBottom: 10,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  change: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 5,
    fontWeight: '600',
  },
});