import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import {
    BarChart3,
    Calendar,
    DollarSign,
    Download,
    Filter,
    Shield,
    TrendingUp,
    X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../../../../firebase';

export default function ReportsDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      endDate: new Date().toISOString().split('T')[0] // today
    },
    area: 'All',
    wasteType: 'All'
  });

  const reportTypes = [
    {
      id: 'waste-generation',
      title: 'Total waste collected',
      description: 'Total waste collected by area and time period',
      icon: <BarChart3 size={32} color="#10B981" />,
      color: '#D1FAE5'
    },
    {
      id: 'collection-efficiency',
      title: 'Schedules vs collected',
      description: 'Scheduled vs collected waste pickup performance',
      icon: <TrendingUp size={32} color="#3B82F6" />,
      color: '#DBEAFE'
    },
    {
      id: 'cost-analysis',
      title: 'Cost Analysis',
      description: 'Revenue, costs, and profitability metrics',
      icon: <DollarSign size={32} color="#EF4444" />,
      color: '#FEE2E2'
    }
  ];

  useFocusEffect(
    React.useCallback(() => {
      checkAuthorization();
    }, [])
  );

  const checkAuthorization = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert(
          'Access Denied',
          'You must be logged in to access reports.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      // Fetch user data to check role
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        Alert.alert(
          'Access Denied',
          'User data not found. Please contact support.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      const userData = userDoc.data();
      setUserData(userData);

      // Check if user is admin (business user)
      if (userData.userType !== 'business') {
        Alert.alert(
          'Access Denied',
          'Reports & Analytics is only available to administrators.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      // User is authorized, fetch data
      setIsAuthorized(true);
      await fetchOverviewData();
    } catch (error) {
      console.error('Authorization error:', error);
      Alert.alert(
        'Error',
        'Failed to verify access permissions.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      // Fetch basic overview data for dashboard
      const [collectionsSnapshot, schedulesSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, 'garbageCollections')),
        getDocs(collection(db, 'schedules')),
        getDocs(collection(db, 'users'))
      ]);

      const collections = [];
      const schedules = [];
      const users = [];

      collectionsSnapshot.forEach(doc => collections.push({ id: doc.id, ...doc.data() }));
      schedulesSnapshot.forEach(doc => schedules.push({ id: doc.id, ...doc.data() }));
      usersSnapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));

      setReportData({
        totalCollections: collections.length,
        totalSchedules: schedules.length,
        totalUsers: users.length,
        totalRevenue: collections.reduce((sum, col) => sum + parseFloat(col.totalCost || 0), 0),
        collections,
        schedules,
        users
      });
    } catch (error) {
      console.error('Error fetching overview data:', error);
      Alert.alert('Error', 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeSelect = (reportType) => {
    setSelectedReportType(reportType);
    setShowFilterModal(true);
  };

  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(filters.dateRange.startDate);
    setShowStartDatePicker(Platform.OS === 'ios');
    setFilters({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        startDate: currentDate.toISOString().split('T')[0]
      }
    });
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(filters.dateRange.endDate);
    setShowEndDatePicker(Platform.OS === 'ios');
    setFilters({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        endDate: currentDate.toISOString().split('T')[0]
      }
    });
  };

  const generateReport = async () => {
    if (!selectedReportType) return;

    try {
      setLoading(true);
      setShowFilterModal(false);
      
      // Navigate to specific report screen with filters
      router.push({
        pathname: '/(tabs)/screens/ManageAccount/ReportDetails',
        params: {
          reportType: selectedReportType.id,
          filters: JSON.stringify(filters)
        }
      });
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewCards = () => {
    if (!reportData) return null;

    const overviewCards = [
      {
        title: 'Total Collections',
        value: reportData.totalCollections,
        icon: <BarChart3 size={24} color="#10B981" />,
        color: '#D1FAE5'
      },
      {
        title: 'Total Revenue',
        value: `$${reportData.totalRevenue.toFixed(2)}`,
        icon: <DollarSign size={24} color="#3B82F6" />,
        color: '#DBEAFE'
      },
      {
        title: 'Active Users',
        value: reportData.totalUsers,
        icon: <TrendingUp size={24} color="#F59E0B" />,
        color: '#FEF3C7'
      },
      {
        title: 'Scheduled Pickups',
        value: reportData.totalSchedules,
        icon: <Calendar size={24} color="#8B5CF6" />,
        color: '#E9D5FF'
      }
    ];

    return (
      <View style={styles.overviewSection}>
        <Text style={styles.sectionTitle}>System Overview</Text>
        <View style={styles.overviewGrid}>
          {overviewCards.map((card, index) => (
            <View key={index} style={[styles.overviewCard, { backgroundColor: card.color }]}>
              <View style={styles.overviewCardContent}>
                <View style={styles.overviewIcon}>
                  {card.icon}
                </View>
                 <View style={styles.overviewText}>
                   <Text style={styles.overviewValue}>{card.value}</Text>
                   <Text style={styles.overviewLabel} numberOfLines={2}>{card.title}</Text>
                 </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderReportTypes = () => (
    <View style={styles.reportsSection}>
      <Text style={styles.sectionTitle}>Available Reports</Text>
      <View style={styles.reportsGrid}>
        {reportTypes.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={[styles.reportCard, { backgroundColor: report.color }]}
            onPress={() => handleReportTypeSelect(report)}
          >
            <View style={styles.reportCardContent}>
              <View style={styles.reportIcon}>
                {report.icon}
              </View>
               <View style={styles.reportText}>
                 <Text style={styles.reportTitle} numberOfLines={2}>{report.title}</Text>
                 <Text style={styles.reportDescription} numberOfLines={3}>{report.description}</Text>
               </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
             <Text style={styles.modalTitle} numberOfLines={2}>
               {selectedReportType?.title} - Filters
             </Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Date Range</Text>
              
              {/* Quick Date Range Buttons */}
              <View style={styles.quickDateButtons}>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => {
                    const today = new Date();
                    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    setFilters({
                      ...filters,
                      dateRange: {
                        startDate: lastWeek.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0]
                      }
                    });
                  }}
                >
                  <Text style={styles.quickDateButtonText}>Last 7 days</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => {
                    const today = new Date();
                    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    setFilters({
                      ...filters,
                      dateRange: {
                        startDate: lastMonth.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0]
                      }
                    });
                  }}
                >
                  <Text style={styles.quickDateButtonText}>Last 30 days</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => {
                    const today = new Date();
                    const last3Months = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                    setFilters({
                      ...filters,
                      dateRange: {
                        startDate: last3Months.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0]
                      }
                    });
                  }}
                >
                  <Text style={styles.quickDateButtonText}>Last 3 months</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateRow}>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateLabel}>Start Date</Text>
                  <View style={styles.dateInputContent}>
                    <Text style={styles.dateValue}>{filters.dateRange.startDate}</Text>
                    <Calendar size={16} color="#6B7280" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateLabel}>End Date</Text>
                  <View style={styles.dateInputContent}>
                    <Text style={styles.dateValue}>{filters.dateRange.endDate}</Text>
                    <Calendar size={16} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Area</Text>
              <View style={styles.filterOptions}>
                {['All', 'Colombo', 'Kandy', 'Galle', 'Jaffna'].map((area) => (
                  <TouchableOpacity
                    key={area}
                    style={[
                      styles.filterOption,
                      filters.area === area && styles.filterOptionSelected
                    ]}
                    onPress={() => setFilters({...filters, area})}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.area === area && styles.filterOptionTextSelected
                    ]}>
                      {area}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Waste Type</Text>
              <View style={styles.filterOptions}>
                {['All', 'Organic', 'Recyclable', 'Electronic', 'Mixed'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      filters.wasteType === type && styles.filterOptionSelected
                    ]}
                    onPress={() => setFilters({...filters, wasteType: type})}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.wasteType === type && styles.filterOptionTextSelected
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateReport}
            >
              <Text style={styles.generateButtonText}>Generate Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={new Date(filters.dateRange.startDate)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartDateChange}
        />
      )}
      
      {showEndDatePicker && (
        <DateTimePicker
          value={new Date(filters.dateRange.endDate)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndDateChange}
        />
      )}
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5DADE2" />
          <Text style={styles.loadingText}>Verifying access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthorized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <View style={styles.accessDeniedIcon}>
            <Shield size={64} color="#EF4444" />
          </View>
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedMessage}>
            Reports & Analytics is only available to administrators.
          </Text>
          <Text style={styles.accessDeniedSubtext}>
            Please contact your system administrator if you believe this is an error.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/screens/ManageAccount/BusinessDashboardScreen')}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Reports & Analytics</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.filterButton}>
                <Filter size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.exportButton}>
                <Download size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderOverviewCards()}
          {renderReportTypes()}
          
          <View style={styles.bottomPadding} />
        </ScrollView>

        {renderFilterModal()}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  overviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 80,
  },
  overviewCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewIcon: {
    marginRight: 12,
  },
  overviewText: {
    flex: 1,
    flexShrink: 1,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#6B7280',
    flexWrap: 'wrap',
    numberOfLines: 2,
  },
  reportsSection: {
    marginBottom: 24,
  },
  reportsGrid: {
    gap: 12,
  },
  reportCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportIcon: {
    marginRight: 16,
  },
  reportText: {
    flex: 1,
    flexShrink: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    flexWrap: 'wrap',
    numberOfLines: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    flexWrap: 'wrap',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  dateInputContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  dateTextInput: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  quickDateButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickDateButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  quickDateButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  filterOptionSelected: {
    backgroundColor: '#5DADE2',
    borderColor: '#5DADE2',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  filterOptionTextSelected: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  generateButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#5DADE2',
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#F9FAFB',
  },
  accessDeniedIcon: {
    marginBottom: 24,
  },
  accessDeniedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  accessDeniedMessage: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  accessDeniedSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#5DADE2',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#5DADE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
