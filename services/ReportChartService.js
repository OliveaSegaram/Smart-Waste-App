/**
 * Service class responsible for processing chart data
 * Follows Single Responsibility Principle - only handles chart data processing
 */
export class ReportChartService {
  /**
   * Process chart data based on report type
   */
  processChartData(data, reportType) {
    switch (reportType) {
      case 'waste-generation':
        return this.processWasteGenerationChartData(data);
      case 'collection-efficiency':
        return this.processCollectionEfficiencyChartData(data);
      case 'cost-analysis':
        return this.processCostAnalysisChartData(data);
      default:
        return null;
    }
  }

  /**
   * Process waste generation chart data
   */
  processWasteGenerationChartData(data) {
    return {
      pieChart: Object.entries(data.byWasteType).map(([type, stats]) => ({
        name: type,
        value: stats.weight,
        color: this.getWasteTypeColor(type)
      })),
      barChart: Object.entries(data.byArea).map(([area, stats]) => ({
        name: area,
        value: stats.weight
      }))
    };
  }

  /**
   * Process collection efficiency chart data
   */
  processCollectionEfficiencyChartData(data) {
    return {
      pieChart: Object.entries(data.statusBreakdown).map(([status, count]) => ({
        name: status,
        value: count,
        color: this.getStatusColor(status)
      }))
    };
  }

  /**
   * Process cost analysis chart data
   */
  processCostAnalysisChartData(data) {
    return {
      pieChart: Object.entries(data.paymentStatus).map(([status, count]) => ({
        name: status,
        value: count,
        color: this.getPaymentStatusColor(status)
      }))
    };
  }

  /**
   * Get color for waste type
   */
  getWasteTypeColor(type) {
    const colors = {
      'Organic': '#10B981',
      'Recyclable': '#3B82F6',
      'Electronic': '#F59E0B',
      'Mixed': '#6B7280'
    };
    return colors[type] || '#6B7280';
  }

  /**
   * Get color for status
   */
  getStatusColor(status) {
    const colors = {
      'Completed': '#10B981',
      'Scheduled': '#3B82F6',
      'Cancelled': '#EF4444',
      'In Progress': '#F59E0B'
    };
    return colors[status] || '#6B7280';
  }

  /**
   * Get color for payment status
   */
  getPaymentStatusColor(status) {
    const colors = {
      'Paid': '#10B981',
      'Unpaid': '#EF4444',
      'Pending Verification': '#F59E0B'
    };
    return colors[status] || '#6B7280';
  }
}
