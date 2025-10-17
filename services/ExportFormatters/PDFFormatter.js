/**
 * PDF Export Formatter - follows Single Responsibility Principle
 * Only handles PDF-specific formatting logic
 */
export class PDFFormatter {
  /**
   * Generate HTML content for PDF export
   */
  generateHTMLReport(reportData, reportType, filters, title) {
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
  generateKPISection(reportData, reportType) {
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
  generateDataSection(reportData, reportType) {
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
  generateChartSection(reportData, reportType) {
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
  generateWasteGenerationTable(reportData) {
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
  generateCollectionEfficiencyTable(reportData) {
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
   * Generate cost analysis table
   */
  generateCostAnalysisTable(reportData) {
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
