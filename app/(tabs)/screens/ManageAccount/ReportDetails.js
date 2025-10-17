import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import {
    ArrowLeft,
    BarChart3,
    Calendar,
    DollarSign,
    Download,
    Share,
    Shield,
    TrendingDown,
    TrendingUp
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../../../../firebase';
import { ReportExportService } from '../../../../services/ReportExportService';

const { width } = Dimensions.get('window');

export default function ReportDetails() {
  const router = useRouter();
  const { reportType, filters } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const parsedFilters = filters ? JSON.parse(filters) : {};

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    if (reportType && isAuthorized) {
      generateReport();
    }
  }, [reportType, filters, isAuthorized]);

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

      // Check if user is admin (business user)
      if (userData.userType !== 'business') {
        Alert.alert(
          'Access Denied',
          'Reports & Analytics is only available to administrators.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      // User is authorized
      setIsAuthorized(true);
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

  const generateReport = async () => {
    try {
      setLoading(true);
      
      // Fetch data based on report type
      let data = {};
      
      switch (reportType) {
        case 'waste-generation':
          data = await fetchWasteGenerationData();
          break;
        case 'collection-efficiency':
          data = await fetchCollectionEfficiencyData();
          break;
        case 'cost-analysis':
          data = await fetchCostAnalysisData();
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      setReportData(data);
      setChartData(processChartData(data, reportType));
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const fetchWasteGenerationData = async () => {
    const [collectionsSnapshot, schedulesSnapshot] = await Promise.all([
      getDocs(collection(db, 'garbageCollections')),
      getDocs(collection(db, 'schedules'))
    ]);

    const collections = [];
    const schedules = [];

    collectionsSnapshot.forEach(doc => collections.push({ id: doc.id, ...doc.data() }));
    schedulesSnapshot.forEach(doc => schedules.push({ id: doc.id, ...doc.data() }));

    // Filter by date range if specified
    const filteredCollections = filterByDateRange(collections, parsedFilters.dateRange);
    const filteredSchedules = filterByDateRange(schedules, parsedFilters.dateRange);

    // Calculate metrics
    const totalWeight = filteredCollections.reduce((sum, col) => sum + parseFloat(col.totalWeight || 0), 0);
    const totalCollections = filteredCollections.length;
    const averageWeight = totalCollections > 0 ? totalWeight / totalCollections : 0;

    // Group by area
    const byArea = {};
    filteredCollections.forEach(col => {
      const area = col.address?.split(',')[1]?.trim() || 'Unknown';
      if (!byArea[area]) byArea[area] = { count: 0, weight: 0 };
      byArea[area].count++;
      byArea[area].weight += parseFloat(col.totalWeight || 0);
    });

    // Group by waste type
    const byWasteType = {};
    filteredCollections.forEach(col => {
      const wasteType = col.wasteType || 'Mixed';
      if (!byWasteType[wasteType]) byWasteType[wasteType] = { count: 0, weight: 0 };
      byWasteType[wasteType].count++;
      byWasteType[wasteType].weight += parseFloat(col.totalWeight || 0);
    });

    return {
      totalWeight: totalWeight || 0,
      totalCollections: totalCollections || 0,
      averageWeight: averageWeight || 0,
      byArea: byArea || {},
      byWasteType: byWasteType || {},
      collections: filteredCollections || [],
      schedules: filteredSchedules || []
    };
  };

  const fetchCollectionEfficiencyData = async () => {
    const [collectionsSnapshot, schedulesSnapshot] = await Promise.all([
      getDocs(collection(db, 'garbageCollections')),
      getDocs(collection(db, 'schedules'))
    ]);

    const collections = [];
    const schedules = [];

    collectionsSnapshot.forEach(doc => collections.push({ id: doc.id, ...doc.data() }));
    schedulesSnapshot.forEach(doc => schedules.push({ id: doc.id, ...doc.data() }));

    const filteredCollections = filterByDateRange(collections, parsedFilters.dateRange);
    const filteredSchedules = filterByDateRange(schedules, parsedFilters.dateRange);

    // Calculate efficiency metrics
    const scheduledPickups = filteredSchedules.length;
    const completedPickups = filteredCollections.length;
    const efficiencyRate = scheduledPickups > 0 ? (completedPickups / scheduledPickups) * 100 : 0;

    // Group by status
    const statusBreakdown = {
      'Completed': completedPickups,
      'Scheduled': filteredSchedules.filter(s => s.status === 'Scheduled').length,
      'Cancelled': filteredSchedules.filter(s => s.status === 'Cancelled').length,
      'In Progress': filteredSchedules.filter(s => s.status === 'In Progress').length
    };

    return {
      scheduledPickups: scheduledPickups || 0,
      completedPickups: completedPickups || 0,
      efficiencyRate: efficiencyRate || 0,
      statusBreakdown: statusBreakdown || {},
      collections: filteredCollections || [],
      schedules: filteredSchedules || []
    };
  };


  const fetchCostAnalysisData = async () => {
    const collectionsSnapshot = await getDocs(collection(db, 'garbageCollections'));
    const collections = [];
    collectionsSnapshot.forEach(doc => collections.push({ id: doc.id, ...doc.data() }));

    const filteredCollections = filterByDateRange(collections, parsedFilters.dateRange);

    // Calculate financial metrics
    const totalRevenue = filteredCollections.reduce((sum, col) => sum + parseFloat(col.totalCost || 0), 0);
    const averageCost = filteredCollections.length > 0 ? totalRevenue / filteredCollections.length : 0;

    // Group by payment status
    const paymentStatus = {
      'Paid': filteredCollections.filter(col => col.status === 'Paid').length,
      'Unpaid': filteredCollections.filter(col => col.status === 'Unpaid').length,
      'Pending Verification': filteredCollections.filter(col => col.status === 'Pending Verification').length
    };

    const paidRevenue = filteredCollections
      .filter(col => col.status === 'Paid')
      .reduce((sum, col) => sum + parseFloat(col.totalCost || 0), 0);

    return {
      totalRevenue: totalRevenue || 0,
      averageCost: averageCost || 0,
      paidRevenue: paidRevenue || 0,
      paymentStatus: paymentStatus || {},
      collections: filteredCollections || []
    };
  };



  const filterByDateRange = (data, dateRange) => {
    if (!dateRange || !dateRange.startDate || !dateRange.endDate) return data;
    
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    return data.filter(item => {
      const itemDate = new Date(item.createdAt?.toDate?.() || item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const processChartData = (data, reportType) => {
    switch (reportType) {
      case 'waste-generation':
        return {
          pieChart: Object.entries(data.byWasteType).map(([type, stats]) => ({
            name: type,
            value: stats.weight,
            color: getWasteTypeColor(type)
          })),
          barChart: Object.entries(data.byArea).map(([area, stats]) => ({
            name: area,
            value: stats.weight
          }))
        };
      case 'collection-efficiency':
        return {
          pieChart: Object.entries(data.statusBreakdown).map(([status, count]) => ({
            name: status,
            value: count,
            color: getStatusColor(status)
          }))
        };
      case 'cost-analysis':
        return {
          pieChart: Object.entries(data.paymentStatus).map(([status, count]) => ({
            name: status,
            value: count,
            color: getPaymentStatusColor(status)
          }))
        };
      default:
        return null;
    }
  };

  const getWasteTypeColor = (type) => {
    const colors = {
      'Organic': '#10B981',
      'Recyclable': '#3B82F6',
      'Electronic': '#F59E0B',
      'Mixed': '#6B7280'
    };
    return colors[type] || '#6B7280';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': '#10B981',
      'Scheduled': '#3B82F6',
      'Cancelled': '#EF4444',
      'In Progress': '#F59E0B'
    };
    return colors[status] || '#6B7280';
  };


  const getPaymentStatusColor = (status) => {
    const colors = {
      'Paid': '#10B981',
      'Unpaid': '#EF4444',
      'Pending Verification': '#F59E0B'
    };
    return colors[status] || '#6B7280';
  };


  const renderKPICards = () => {
    if (!reportData) return null;

    const kpis = getKPIsForReportType(reportType, reportData);
    
    return (
      <View style={styles.kpiSection}>
        <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
        <View style={styles.kpiGrid}>
          {kpis.map((kpi, index) => (
            <View key={index} style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: kpi.color }]}>
                  {kpi.icon}
                </View>
                <View style={styles.kpiTrend}>
                  {kpi.trend === 'up' ? (
                    <TrendingUp size={16} color="#10B981" />
                  ) : kpi.trend === 'down' ? (
                    <TrendingDown size={16} color="#EF4444" />
                  ) : null}
                </View>
              </View>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const getKPIsForReportType = (type, data) => {
    switch (type) {
      case 'waste-generation':
        return [
          {
            label: 'Total Weight (kg)',
            value: (data.totalWeight || 0).toFixed(1),
            icon: <BarChart3 size={20} color="white" />,
            color: '#10B981',
            trend: 'up'
          },
          {
            label: 'Total Collections',
            value: data.totalCollections || 0,
            icon: <Calendar size={20} color="white" />,
            color: '#3B82F6',
            trend: 'up'
          },
          {
            label: 'Average Weight (kg)',
            value: (data.averageWeight || 0).toFixed(1),
            icon: <TrendingUp size={20} color="white" />,
            color: '#F59E0B',
            trend: 'up'
          }
        ];
      case 'collection-efficiency':
        return [
          {
            label: 'Efficiency Rate',
            value: `${(data.efficiencyRate || 0).toFixed(1)}%`,
            icon: <TrendingUp size={20} color="white" />,
            color: '#10B981',
            trend: 'up'
          },
          {
            label: 'Scheduled Pickups',
            value: data.scheduledPickups || 0,
            icon: <Calendar size={20} color="white" />,
            color: '#3B82F6',
            trend: 'up'
          },
          {
            label: 'Completed Pickups',
            value: data.completedPickups || 0,
            icon: <BarChart3 size={20} color="white" />,
            color: '#F59E0B',
            trend: 'up'
          }
        ];
      case 'cost-analysis':
        return [
          {
            label: 'Total Revenue',
            value: `$${(data.totalRevenue || 0).toFixed(2)}`,
            icon: <DollarSign size={20} color="white" />,
            color: '#10B981',
            trend: 'up'
          },
          {
            label: 'Average Cost',
            value: `$${(data.averageCost || 0).toFixed(2)}`,
            icon: <TrendingUp size={20} color="white" />,
            color: '#3B82F6',
            trend: 'up'
          },
          {
            label: 'Paid Revenue',
            value: `$${(data.paidRevenue || 0).toFixed(2)}`,
            icon: <DollarSign size={20} color="white" />,
            color: '#F59E0B',
            trend: 'up'
          }
        ];
      default:
        return [];
    }
  };

  const renderSimpleChart = () => {
    if (!chartData) return null;

    const chartType = reportType === 'route-performance' ? 'bar' : 'pie';
    
    if (chartType === 'pie' && chartData.pieChart) {
      return (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Distribution</Text>
          <View style={styles.pieChartContainer}>
            {chartData.pieChart.map((segment, index) => (
              <View key={index} style={styles.pieSegment}>
                <View style={[styles.pieColor, { backgroundColor: segment.color }]} />
                <Text style={styles.pieLabel}>{segment.name}</Text>
                <Text style={styles.pieValue}>{segment.value}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (chartType === 'bar' && chartData.barChart) {
      return (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Performance by Route</Text>
          <View style={styles.barChartContainer}>
            {chartData.barChart.map((bar, index) => (
              <View key={index} style={styles.barItem}>
                <Text style={styles.barLabel}>{bar.name}</Text>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        width: `${Math.min(bar.value, 100)}%`,
                        backgroundColor: '#5DADE2'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.barValue}>{(bar.value || 0).toFixed(1)}%</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    return null;
  };

  const getReportTitle = () => {
    const titles = {
      'waste-generation': 'Total waste collected Report',
      'collection-efficiency': 'Schedules vs collected Report',
      'cost-analysis': 'Cost Analysis Report'
    };
    return titles[reportType] || 'Report';
  };

  const handleExportPDF = async () => {
    if (!reportData) {
      Alert.alert('Error', 'No report data available to export');
      return;
    }

    try {
      await ReportExportService.exportToPDF(
        reportData, 
        reportType, 
        parsedFilters, 
        getReportTitle()
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  const handleExportCSV = async () => {
    if (!reportData) {
      Alert.alert('Error', 'No report data available to export');
      return;
    }

    try {
      await ReportExportService.exportToCSV(reportData, reportType, parsedFilters);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export CSV');
    }
  };

  const handleShare = () => {
    Alert.alert(
      'Share Report',
      'Choose export format:',
      [
        { text: 'PDF', onPress: handleExportPDF },
        { text: 'CSV', onPress: handleExportCSV },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

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
            onPress={() => router.back()}
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.push('/(tabs)/screens/ManageAccount/ReportsDashboard')}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{getReportTitle()}</Text>
              <Text style={styles.headerSubtitle}>
                {parsedFilters.dateRange?.startDate} to {parsedFilters.dateRange?.endDate}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Share size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleExportPDF}>
                <Download size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderKPICards()}
          {renderSimpleChart()}
          
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
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
  kpiSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiTrend: {
    // Empty for now
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  chartSection: {
    marginBottom: 24,
  },
  pieChartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pieSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pieColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  pieLabel: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  pieValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  barChartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  barItem: {
    marginBottom: 16,
  },
  barLabel: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  barContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 4,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
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
