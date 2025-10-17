/**
 * Text Export Formatter - follows Single Responsibility Principle
 * Only handles text-specific formatting logic
 */
export class TextFormatter {
  /**
   * Generate text content for sharing
   */
  generateTextReport(reportData, reportType, filters, title) {
    const currentDate = new Date().toLocaleDateString();
    const dateRange = filters.dateRange ? 
      `${filters.dateRange.startDate} to ${filters.dateRange.endDate}` : 
      'All time';

    let reportText = `${title}\n`;
    reportText += `Generated on: ${currentDate}\n`;
    reportText += `Date Range: ${dateRange}\n\n`;

    // Add KPIs
    const kpis = this.getKPIsForReportType(reportType, reportData);
    reportText += 'Key Performance Indicators:\n';
    kpis.forEach(kpi => {
      reportText += `• ${kpi.label}: ${kpi.value}\n`;
    });
    reportText += '\n';

    // Add detailed data based on report type
    switch (reportType) {
      case 'waste-generation':
        if (reportData.byArea) {
          reportText += 'Waste Generation by Area:\n';
          Object.entries(reportData.byArea).forEach(([area, stats]) => {
            reportText += `• ${area}: ${stats.count} collections, ${stats.weight.toFixed(1)} kg\n`;
          });
        }
        break;
      case 'collection-efficiency':
        if (reportData.statusBreakdown) {
          reportText += 'Collection Status:\n';
          Object.entries(reportData.statusBreakdown).forEach(([status, count]) => {
            reportText += `• ${status}: ${count} pickups\n`;
          });
        }
        break;
      case 'recycling-stats':
        if (reportData.categoryStats) {
          reportText += 'Waste Categories:\n';
          Object.entries(reportData.categoryStats).forEach(([category, stats]) => {
            reportText += `• ${category}: ${stats.count} collections, ${stats.weight.toFixed(1)} kg\n`;
          });
        }
        break;
      case 'cost-analysis':
        if (reportData.paymentStatus) {
          reportText += 'Payment Status:\n';
          Object.entries(reportData.paymentStatus).forEach(([status, count]) => {
            reportText += `• ${status}: ${count} payments\n`;
          });
        }
        break;
      case 'user-analytics':
        if (reportData.userTypes) {
          reportText += 'User Types:\n';
          Object.entries(reportData.userTypes).forEach(([type, count]) => {
            reportText += `• ${type}: ${count} users\n`;
          });
        }
        break;
      case 'route-performance':
        if (reportData.routes) {
          reportText += 'Route Performance:\n';
          reportData.routes.forEach(route => {
            reportText += `• ${route.name}: ${route.efficiency.toFixed(1)}% efficiency\n`;
          });
        }
        break;
    }

    reportText += `\n---\nSmart Waste Management System\nReport Generated on ${currentDate}`;
    return reportText;
  }

  /**
   * Get KPIs for report type
   */
  getKPIsForReportType(type, data) {
    switch (type) {
      case 'waste-generation':
        return [
          { label: 'Total Weight (kg)', value: data.totalWeight?.toFixed(1) || '0' },
          { label: 'Total Collections', value: data.totalCollections || '0' },
          { label: 'Average Weight (kg)', value: data.averageWeight?.toFixed(1) || '0' }
        ];
      case 'collection-efficiency':
        return [
          { label: 'Efficiency Rate', value: `${data.efficiencyRate?.toFixed(1) || '0'}%` },
          { label: 'Scheduled Pickups', value: data.scheduledPickups || '0' },
          { label: 'Completed Pickups', value: data.completedPickups || '0' }
        ];
      case 'cost-analysis':
        return [
          { label: 'Total Revenue', value: `$${data.totalRevenue?.toFixed(2) || '0.00'}` },
          { label: 'Average Cost', value: `$${data.averageCost?.toFixed(2) || '0.00'}` },
          { label: 'Paid Revenue', value: `$${data.paidRevenue?.toFixed(2) || '0.00'}` }
        ];
      default:
        return [];
    }
  }
}
