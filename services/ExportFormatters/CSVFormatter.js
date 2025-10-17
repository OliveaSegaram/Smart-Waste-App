
export class CSVFormatter {
  /**
   * Generate CSV content
   */
  generateCSVContent(reportData, reportType, filters) {
    const headers = this.getCSVHeaders(reportType);
    const rows = this.getCSVRows(reportData, reportType);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Get CSV headers based on report type
   */
  getCSVHeaders(reportType) {
    switch (reportType) {
      case 'waste-generation':
        return ['Area', 'Waste Type', 'Collections', 'Total Weight (kg)', 'Average Weight (kg)'];
      case 'collection-efficiency':
        return ['Status', 'Count', 'Percentage'];
      case 'recycling-stats':
        return ['Category', 'Collections', 'Total Weight (kg)', 'Percentage'];
      case 'cost-analysis':
        return ['Payment Status', 'Count', 'Revenue ($)'];
      case 'user-analytics':
        return ['User Type', 'Count', 'Percentage'];
      case 'route-performance':
        return ['Route', 'Collections', 'Total Weight (kg)', 'Total Cost ($)', 'Efficiency (%)'];
      default:
        return [];
    }
  }

  /**
   * Get CSV rows based on report type
   */
  getCSVRows(reportData, reportType) {
    switch (reportType) {
      case 'waste-generation':
        const rows = [];
        Object.entries(reportData.byArea || {}).forEach(([area, stats]) => {
          rows.push([area, 'All', stats.count, stats.weight.toFixed(1), (stats.weight / stats.count).toFixed(1)]);
        });
        return rows;
      case 'collection-efficiency':
        return Object.entries(reportData.statusBreakdown || {}).map(([status, count]) => [
          status, count, ((count / reportData.scheduledPickups) * 100).toFixed(1)
        ]);
      case 'recycling-stats':
        return Object.entries(reportData.categoryStats || {}).map(([category, stats]) => [
          category, stats.count, stats.weight.toFixed(1), ((stats.weight / reportData.totalWeight) * 100).toFixed(1)
        ]);
      case 'cost-analysis':
        return Object.entries(reportData.paymentStatus || {}).map(([status, count]) => [
          status, count, ((count / reportData.collections.length) * reportData.totalRevenue).toFixed(2)
        ]);
      case 'user-analytics':
        return Object.entries(reportData.userTypes || {}).map(([type, count]) => [
          type, count, ((count / reportData.totalUsers) * 100).toFixed(1)
        ]);
      case 'route-performance':
        return (reportData.routes || []).map(route => [
          route.name, route.collections, route.totalWeight.toFixed(1), route.totalCost.toFixed(2), route.efficiency.toFixed(1)
        ]);
      default:
        return [];
    }
  }
}
