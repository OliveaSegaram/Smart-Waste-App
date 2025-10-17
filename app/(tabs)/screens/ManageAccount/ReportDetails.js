import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { ReportDataService } from '../../../../services/ReportDataService';
import { ReportAuthorizationService } from '../../../../services/ReportAuthorizationService';
import { ReportFactory } from '../../../../services/ReportFactory';
import { ReportDataProcessor } from '../../../../services/ReportDataProcessor';
import { ReportKPIService } from '../../../../services/ReportKPIService';
import { ReportChartService } from '../../../../services/ReportChartService';

const { width } = Dimensions.get('window');

export default function ReportDetails() {
  const router = useRouter();
  const { reportType, filters } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const parsedFilters = filters ? JSON.parse(filters) : {};

  // Initialize services
  const dataService = new ReportDataService(db);
  const authService = new ReportAuthorizationService(auth, db);
  const dataProcessor = new ReportDataProcessor();
  const reportFactory = new ReportFactory(dataService, dataProcessor);
  const kpiService = new ReportKPIService();
  const chartService = new ReportChartService();

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
      
      // Use authorization service to validate access
      await authService.validateAuthorization();
      setIsAuthorized(true);
    } catch (error) {
      console.error('Authorization error:', error);
      const errorMessage = error.message === 'User not authenticated' 
        ? 'You must be logged in to access reports.'
        : error.message === 'User not authorized for reports'
        ? 'Reports & Analytics is only available to administrators.'
        : 'Failed to verify access permissions.';
        
      Alert.alert(
        'Access Denied',
        errorMessage,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      
      // Use report factory to create report
      const data = await reportFactory.createReport(reportType, parsedFilters);
      
      setReportData(data);
      setChartData(chartService.processChartData(data, reportType));
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };



  const getIconComponent = (iconName) => {
    const iconMap = {
      'BarChart3': BarChart3,
      'Calendar': Calendar,
      'DollarSign': DollarSign,
      'TrendingUp': TrendingUp
    };
    return iconMap[iconName] || BarChart3;
  };

  const renderKPICards = () => {
    if (!reportData) return null;

    const kpis = kpiService.getKPIsForReportType(reportType, reportData);
    
    return (
      <View style={styles.kpiSection}>
        <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
        <View style={styles.kpiGrid}>
          {kpis.map((kpi, index) => {
            const IconComponent = getIconComponent(kpi.icon);
            return (
            <View key={index} style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: kpi.color }]}>
                    <IconComponent size={20} color="white" />
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
            );
          })}
        </View>
      </View>
    );
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

  const exportService = new ReportExportService();

  const handleExportPDF = async () => {
    if (!reportData) {
      Alert.alert('Error', 'No report data available to export');
      return;
    }

    try {
      await exportService.exportToPDF(
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
      await exportService.exportToCSV(reportData, reportType, parsedFilters);
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
