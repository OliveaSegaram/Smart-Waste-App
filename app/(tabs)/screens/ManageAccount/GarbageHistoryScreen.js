import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, Package, TrendingUp, Filter } from 'lucide-react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../../firebase';

export default function GarbageHistoryScreen() {
  const [garbageRecords, setGarbageRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('All');
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalWeight: 0,
    totalCost: 0,
    thisMonth: { collections: 0, weight: 0, cost: 0 }
  });

  useEffect(() => {
    fetchGarbageRecords();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [garbageRecords]);

  const fetchGarbageRecords = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'garbageCollections'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const records = [];
      querySnapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() });
      });
      setGarbageRecords(records);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    
    let totalWeight = 0;
    let totalCost = 0;
    let thisMonthCollections = 0;
    let thisMonthWeight = 0;
    let thisMonthCost = 0;

    garbageRecords.forEach(record => {
      const weight = parseFloat(record.totalWeight) || 0;
      const cost = parseFloat(record.totalCost) || 0;

      totalWeight += weight;
      totalCost += cost;

      if (record.month === currentMonth) {
        thisMonthCollections++;
        thisMonthWeight += weight;
        thisMonthCost += cost;
      }
    });

    setStats({
      totalCollections: garbageRecords.length,
      totalWeight: totalWeight.toFixed(2),
      totalCost: totalCost.toFixed(2),
      thisMonth: {
        collections: thisMonthCollections,
        weight: thisMonthWeight.toFixed(2),
        cost: thisMonthCost.toFixed(2)
      }
    });
  };

  const getFilteredRecords = () => {
    if (filterMonth === 'All') return garbageRecords;
    return garbageRecords.filter(record => record.month === filterMonth);
  };

  const uniqueMonths = [...new Set(garbageRecords.map(record => record.month))];
  const filteredRecords = getFilteredRecords();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading garbage history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Garbage Collection History</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* This Month Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>This Month Summary</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.iconCircle, styles.greenBg]}>
                  <Package size={20} color="#10B981" />
                </View>
                <Text style={styles.statValue}>{stats.thisMonth.collections}</Text>
                <Text style={styles.statLabel}>Collections</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.iconCircle, styles.blueBg]}>
                  <TrendingUp size={20} color="#3B82F6" />
                </View>
                <Text style={styles.statValue}>{stats.thisMonth.weight} kg</Text>
                <Text style={styles.statLabel}>Total Weight</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.iconCircle, styles.yellowBg]}>
                  <Calendar size={20} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>${stats.thisMonth.cost}</Text>
                <Text style={styles.statLabel}>Total Cost</Text>
              </View>
            </View>
          </View>

          {/* All Time Stats */}
          <View style={styles.allTimeStats}>
            <Text style={styles.allTimeTitle}>All Time Statistics</Text>
            <View style={styles.allTimeRow}>
              <Text style={styles.allTimeLabel}>Total Collections:</Text>
              <Text style={styles.allTimeValue}>{stats.totalCollections}</Text>
            </View>
            <View style={styles.allTimeRow}>
              <Text style={styles.allTimeLabel}>Total Weight:</Text>
              <Text style={styles.allTimeValue}>{stats.totalWeight} kg</Text>
            </View>
            <View style={styles.allTimeRow}>
              <Text style={styles.allTimeLabel}>Total Revenue:</Text>
              <Text style={styles.allTimeValue}>${stats.totalCost}</Text>
            </View>
          </View>

          {/* Filter Section */}
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Filter size={20} color="#6B7280" />
              <Text style={styles.filterTitle}>Filter by Month</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterButton, filterMonth === 'All' && styles.filterButtonActive]}
                onPress={() => setFilterMonth('All')}
              >
                <Text style={[styles.filterButtonText, filterMonth === 'All' && styles.filterButtonTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {uniqueMonths.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[styles.filterButton, filterMonth === month && styles.filterButtonActive]}
                  onPress={() => setFilterMonth(month)}
                >
                  <Text style={[styles.filterButtonText, filterMonth === month && styles.filterButtonTextActive]}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Records List */}
          <View style={styles.recordsSection}>
            <Text style={styles.recordsTitle}>
              {filterMonth === 'All' ? 'All Records' : filterMonth} ({filteredRecords.length})
            </Text>
            
            {filteredRecords.length === 0 ? (
              <View style={styles.emptyState}>
                <Package size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No records found</Text>
              </View>
            ) : (
              filteredRecords.map((record) => (
                <View key={record.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordName}>{record.residentName}</Text>
                    <View style={[
                      styles.statusBadge,
                      record.status === 'Paid' ? styles.statusPaid : styles.statusUnpaid
                    ]}>
                      <Text style={styles.statusText}>{record.status}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.recordAddress}>{record.residentAddress}</Text>
                  <Text style={styles.recordPhone}>📞 {record.residentPhone}</Text>
                  
                  <View style={styles.recordDivider} />
                  
                  <View style={styles.recordDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Collection Date:</Text>
                      <Text style={styles.detailValue}>{record.collectionDate}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Organic Waste:</Text>
                      <Text style={styles.detailValue}>{record.organicWaste || 0} kg</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Recyclable:</Text>
                      <Text style={styles.detailValue}>{record.recyclableWaste || 0} kg</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Other:</Text>
                      <Text style={styles.detailValue}>{record.otherWaste || 0} kg</Text>
                    </View>
                  </View>
                  
                  <View style={styles.recordFooter}>
                    <View>
                      <Text style={styles.footerLabel}>Total Weight</Text>
                      <Text style={styles.footerValue}>{record.totalWeight} kg</Text>
                    </View>
                    <View style={styles.costContainer}>
                      <Text style={styles.footerLabel}>Total Cost</Text>
                      <Text style={styles.costValue}>${record.totalCost}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#5DADE2',
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  greenBg: {
    backgroundColor: '#D1FAE5',
  },
  blueBg: {
    backgroundColor: '#DBEAFE',
  },
  yellowBg: {
    backgroundColor: '#FEF3C7',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  allTimeStats: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  allTimeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
  },
  allTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  allTimeLabel: {
    fontSize: 14,
    color: '#166534',
  },
  allTimeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  recordsSection: {
    marginBottom: 16,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9CA3AF',
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPaid: {
    backgroundColor: '#D1FAE5',
  },
  statusUnpaid: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  recordAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  recordPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  recordDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  recordDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  costContainer: {
    alignItems: 'flex-end',
  },
  costValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  bottomPadding: {
    height: 20,
  },
});