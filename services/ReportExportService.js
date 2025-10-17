import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Share } from 'react-native';

export class ReportExportService {
  /**
   * Export report data as PDF
   * @param {Object} reportData - The report data to export
   * @param {string} reportType - Type of report (waste-generation, etc.)
   * @param {Object} filters - Applied filters
   * @param {string} title - Report title
   */
  static async exportToPDF(reportData, reportType, filters, title) {
    try {
      const html = this.generateHTMLReport(reportData, reportType, filters, title);
      
      // Generate PDF using expo-print
      const { uri } = await Print.printToFileAsync({
        html: html,
        base64: false,
      });
      
      // Share the PDF file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${title} - Report`,
        });
      } else {
        // Fallback to text sharing if sharing is not available
        const shareContent = this.generateTextReport(reportData, reportType, filters, title);
        await Share.share({
          message: shareContent,
          title: `${title} - Report Data`,
        });
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      
      // Fallback to text sharing on error
      try {
        const shareContent = this.generateTextReport(reportData, reportType, filters, title);
        await Share.share({
          message: shareContent,
          title: `${title} - Report Data`,
        });
      } catch (fallbackError) {
        console.error('Fallback sharing also failed:', fallbackError);
        Alert.alert('Error', 'Failed to export report. Please try again.');
      }
    }
  }

  /**
   * Export report data as CSV
   * @param {Object} reportData - The report data to export
   * @param {string} reportType - Type of report
   * @param {Object} filters - Applied filters
   */
  static async exportToCSV(reportData, reportType, filters) {
    try {
      const csvContent = this.generateCSVContent(reportData, reportType, filters);
      
      await Share.share({
        message: csvContent,
        title: 'Export Report Data (CSV)',
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export CSV');
    }
  }

  /**
   * Generate text content for sharing
   */
  static generateTextReport(reportData, reportType, filters, title) {
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
   * Generate HTML content for PDF export
   */
  static generateHTMLReport(reportData, reportType, filters, title) {
    const currentDate = new Date().toLocaleDateString();
    const dateRange = filters.dateRange ? 
      `${filters.dateRange.startDate} to ${filters.dateRange.endDate}` : 
      'All time';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #5DADE2;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #5DADE2;
              margin: 0;
              font-size: 28px;
            }
            .header .subtitle {
              color: #666;
              margin: 10px 0 0 0;
              font-size: 14px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              color: #333;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            .kpi-card {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
            }
            .kpi-value {
              font-size: 24px;
              font-weight: bold;
              color: #5DADE2;
              margin-bottom: 5px;
            }
            .kpi-label {
              color: #666;
              font-size: 14px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .table th,
            .table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            .table th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .table tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .chart-placeholder {
              background: #f8f9fa;
              border: 2px dashed #ddd;
              border-radius: 8px;
              padding: 40px;
              text-align: center;
              color: #666;
              margin: 20px 0;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p class="subtitle">Generated on ${currentDate}</p>
            <p class="subtitle">Date Range: ${dateRange}</p>
          </div>

          ${this.generateKPISection(reportData, reportType)}
          ${this.generateDataSection(reportData, reportType)}
          ${this.generateChartSection(reportData, reportType)}

          <div class="footer">
            <p>Smart Waste Management System - Report Generated on ${currentDate}</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate KPI section HTML
   */
  static generateKPISection(reportData, reportType) {
    if (!reportData) return '';

    const kpis = this.getKPIsForReportType(reportType, reportData);
    
    const kpiCards = kpis.map(kpi => `
      <div class="kpi-card">
        <div class="kpi-value">${kpi.value}</div>
        <div class="kpi-label">${kpi.label}</div>
      </div>
    `).join('');

    return `
      <div class="section">
        <h2>Key Performance Indicators</h2>
        <div class="kpi-grid">
          ${kpiCards}
        </div>
      </div>
    `;
  }

  /**
   * Generate data section HTML
   */
  static generateDataSection(reportData, reportType) {
    if (!reportData) return '';

    switch (reportType) {
      case 'waste-generation':
        return this.generateWasteGenerationTable(reportData);
      case 'collection-efficiency':
        return this.generateCollectionEfficiencyTable(reportData);
      case 'cost-analysis':
        return this.generateCostAnalysisTable(reportData);
      default:
        return '';
    }
  }

  /**
   * Generate chart section HTML
   */
  static generateChartSection(reportData, reportType) {
    return `
      <div class="section">
        <h2>Data Visualization</h2>
        <div class="chart-placeholder">
          <p>Chart visualization would be displayed here</p>
          <p><em>Note: Interactive charts are not available in PDF format</em></p>
        </div>
      </div>
    `;
  }

  /**
   * Generate waste generation table
   */
  static generateWasteGenerationTable(reportData) {
    if (!reportData.byArea || !reportData.byWasteType) return '';

    const areaRows = Object.entries(reportData.byArea).map(([area, stats]) => `
      <tr>
        <td>${area}</td>
        <td>${stats.count}</td>
        <td>${stats.weight.toFixed(1)} kg</td>
        <td>${(stats.weight / stats.count).toFixed(1)} kg</td>
      </tr>
    `).join('');

    const wasteTypeRows = Object.entries(reportData.byWasteType).map(([type, stats]) => `
      <tr>
        <td>${type}</td>
        <td>${stats.count}</td>
        <td>${stats.weight.toFixed(1)} kg</td>
        <td>${(stats.weight / stats.count).toFixed(1)} kg</td>
      </tr>
    `).join('');

    return `
      <div class="section">
        <h2>Detailed Data</h2>
        
        <h3>Waste Generation by Area</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Area</th>
              <th>Collections</th>
              <th>Total Weight</th>
              <th>Average Weight</th>
            </tr>
          </thead>
          <tbody>
            ${areaRows}
          </tbody>
        </table>

        <h3>Waste Generation by Type</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Waste Type</th>
              <th>Collections</th>
              <th>Total Weight</th>
              <th>Average Weight</th>
            </tr>
          </thead>
          <tbody>
            ${wasteTypeRows}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate collection efficiency table
   */
  static generateCollectionEfficiencyTable(reportData) {
    if (!reportData.statusBreakdown) return '';

    const statusRows = Object.entries(reportData.statusBreakdown).map(([status, count]) => `
      <tr>
        <td>${status}</td>
        <td>${count}</td>
        <td>${((count / reportData.scheduledPickups) * 100).toFixed(1)}%</td>
      </tr>
    `).join('');

    return `
      <div class="section">
        <h2>Collection Status Breakdown</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${statusRows}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate recycling stats table
   */
  static generateRecyclingStatsTable(reportData) {
    if (!reportData.categoryStats) return '';

    const categoryRows = Object.entries(reportData.categoryStats).map(([category, stats]) => `
      <tr>
        <td>${category}</td>
        <td>${stats.count}</td>
        <td>${stats.weight.toFixed(1)} kg</td>
        <td>${((stats.weight / reportData.totalWeight) * 100).toFixed(1)}%</td>
      </tr>
    `).join('');

    return `
      <div class="section">
        <h2>Waste Category Breakdown</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Collections</th>
              <th>Total Weight</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${categoryRows}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate cost analysis table
   */
  static generateCostAnalysisTable(reportData) {
    if (!reportData.paymentStatus) return '';

    const paymentRows = Object.entries(reportData.paymentStatus).map(([status, count]) => `
      <tr>
        <td>${status}</td>
        <td>${count}</td>
        <td>$${((count / reportData.collections.length) * reportData.totalRevenue).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <div class="section">
        <h2>Payment Status Breakdown</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Payment Status</th>
              <th>Count</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${paymentRows}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate user analytics table
   */
  static generateUserAnalyticsTable(reportData) {
    if (!reportData.userTypes) return '';

    const userTypeRows = Object.entries(reportData.userTypes).map(([type, count]) => `
      <tr>
        <td>${type}</td>
        <td>${count}</td>
        <td>${((count / reportData.totalUsers) * 100).toFixed(1)}%</td>
      </tr>
    `).join('');

    return `
      <div class="section">
        <h2>User Type Distribution</h2>
        <table class="table">
          <thead>
            <tr>
              <th>User Type</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${userTypeRows}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate route performance table
   */
  static generateRoutePerformanceTable(reportData) {
    if (!reportData.routes) return '';

    const routeRows = reportData.routes.map(route => `
      <tr>
        <td>${route.name}</td>
        <td>${route.collections}</td>
        <td>${route.totalWeight.toFixed(1)} kg</td>
        <td>$${route.totalCost.toFixed(2)}</td>
        <td>${route.efficiency.toFixed(1)}%</td>
      </tr>
    `).join('');

    return `
      <div class="section">
        <h2>Route Performance</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Collections</th>
              <th>Total Weight</th>
              <th>Total Cost</th>
              <th>Efficiency</th>
            </tr>
          </thead>
          <tbody>
            ${routeRows}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate CSV content
   */
  static generateCSVContent(reportData, reportType, filters) {
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
  static getCSVHeaders(reportType) {
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
  static getCSVRows(reportData, reportType) {
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

  /**
   * Get KPIs for report type (reused from ReportDetails)
   */
  static getKPIsForReportType(type, data) {
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
