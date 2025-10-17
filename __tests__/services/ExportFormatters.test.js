import { CSVFormatter } from '../../services/ExportFormatters/CSVFormatter';
import { PDFFormatter } from '../../services/ExportFormatters/PDFFormatter';

describe('Export Formatters', () => {
  describe('CSVFormatter', () => {
    let csvFormatter;

    beforeEach(() => {
      csvFormatter = new CSVFormatter();
    });

    describe('generateCSVContent', () => {
      it('should generate CSV content with headers and rows', () => {
        const reportData = {
          byArea: {
            'Area1': { count: 5, weight: 100.5 },
            'Area2': { count: 3, weight: 75.2 }
          }
        };
        const reportType = 'waste-generation';
        const filters = {};

        const result = csvFormatter.generateCSVContent(reportData, reportType, filters);

        expect(result).toContain('Area,Waste Type,Collections,Total Weight (kg),Average Weight (kg)');
        expect(result).toContain('Area1,All,5,100.5,20.1');
        expect(result).toContain('Area2,All,3,75.2,25.1');
      });

      it('should handle empty data gracefully', () => {
        const reportData = { byArea: {} };
        const reportType = 'waste-generation';
        const filters = {};

        const result = csvFormatter.generateCSVContent(reportData, reportType, filters);

        expect(result).toContain('Area,Waste Type,Collections,Total Weight (kg),Average Weight (kg)');
        expect(result.split('\n')).toHaveLength(2); // Header + empty line
      });
    });

    describe('getCSVHeaders', () => {
      it('should return correct headers for waste-generation report', () => {
        const headers = csvFormatter.getCSVHeaders('waste-generation');
        expect(headers).toEqual(['Area', 'Waste Type', 'Collections', 'Total Weight (kg)', 'Average Weight (kg)']);
      });

      it('should return correct headers for collection-efficiency report', () => {
        const headers = csvFormatter.getCSVHeaders('collection-efficiency');
        expect(headers).toEqual(['Status', 'Count', 'Percentage']);
      });

      it('should return correct headers for cost-analysis report', () => {
        const headers = csvFormatter.getCSVHeaders('cost-analysis');
        expect(headers).toEqual(['Payment Status', 'Count', 'Revenue ($)']);
      });

      it('should return empty array for unsupported report type', () => {
        const headers = csvFormatter.getCSVHeaders('unsupported-type');
        expect(headers).toEqual([]);
      });
    });

    describe('getCSVRows', () => {
      it('should generate correct rows for waste-generation report', () => {
        const reportData = {
          byArea: {
            'Area1': { count: 5, weight: 100.5 },
            'Area2': { count: 3, weight: 75.2 }
          }
        };

        const rows = csvFormatter.getCSVRows(reportData, 'waste-generation');

        expect(rows).toHaveLength(2);
        expect(rows[0]).toEqual(['Area1', 'All', 5, 100.5, 20.1]);
        expect(rows[1]).toEqual(['Area2', 'All', 3, 75.2, 25.1]);
      });

      it('should generate correct rows for collection-efficiency report', () => {
        const reportData = {
          statusBreakdown: {
            'Completed': 8,
            'Scheduled': 2
          },
          scheduledPickups: 10
        };

        const rows = csvFormatter.getCSVRows(reportData, 'collection-efficiency');

        expect(rows).toHaveLength(2);
        expect(rows[0]).toEqual(['Completed', 8, '80.0']);
        expect(rows[1]).toEqual(['Scheduled', 2, '20.0']);
      });

      it('should generate correct rows for cost-analysis report', () => {
        const reportData = {
          paymentStatus: {
            'Paid': 5,
            'Unpaid': 3
          },
          collections: [{}, {}, {}, {}, {}, {}, {}, {}], // 8 collections
          totalRevenue: 1000
        };

        const rows = csvFormatter.getCSVRows(reportData, 'cost-analysis');

        expect(rows).toHaveLength(2);
        expect(rows[0]).toEqual(['Paid', 5, '625.00']);
        expect(rows[1]).toEqual(['Unpaid', 3, '375.00']);
      });
    });
  });

  describe('PDFFormatter', () => {
    let pdfFormatter;

    beforeEach(() => {
      pdfFormatter = new PDFFormatter();
    });

    describe('generateHTMLReport', () => {
      it('should generate HTML report with proper structure', () => {
        const reportData = {
          totalWeight: 150.5,
          totalCollections: 25
        };
        const reportType = 'waste-generation';
        const filters = { dateRange: { startDate: '2024-01-01', endDate: '2024-01-31' } };
        const title = 'Test Report';

        const result = pdfFormatter.generateHTMLReport(reportData, reportType, filters, title);

        expect(result).toContain('<!DOCTYPE html>');
        expect(result).toContain('<title>Test Report</title>');
        expect(result).toContain('Generated on');
        expect(result).toContain('Date Range: 2024-01-01 to 2024-01-31');
        expect(result).toContain('Smart Waste Management System');
      });

      it('should handle missing date range', () => {
        const reportData = {};
        const reportType = 'waste-generation';
        const filters = {};
        const title = 'Test Report';

        const result = pdfFormatter.generateHTMLReport(reportData, reportType, filters, title);

        expect(result).toContain('Date Range: All time');
      });
    });

    describe('getKPIsForReportType', () => {
      it('should return correct KPIs for waste-generation report', () => {
        const data = {
          totalWeight: 150.5,
          totalCollections: 25,
          averageWeight: 6.02
        };

        const kpis = pdfFormatter.getKPIsForReportType('waste-generation', data);

        expect(kpis).toEqual([
          { label: 'Total Weight (kg)', value: '150.5' },
          { label: 'Total Collections', value: 25 },
          { label: 'Average Weight (kg)', value: '6.0' }
        ]);
      });

      it('should return correct KPIs for collection-efficiency report', () => {
        const data = {
          efficiencyRate: 85.5,
          scheduledPickups: 100,
          completedPickups: 85
        };

        const kpis = pdfFormatter.getKPIsForReportType('collection-efficiency', data);

        expect(kpis).toEqual([
          { label: 'Efficiency Rate', value: '85.5%' },
          { label: 'Scheduled Pickups', value: 100 },
          { label: 'Completed Pickups', value: 85 }
        ]);
      });

      it('should return correct KPIs for cost-analysis report', () => {
        const data = {
          totalRevenue: 2500.75,
          averageCost: 125.50,
          paidRevenue: 2000.25
        };

        const kpis = pdfFormatter.getKPIsForReportType('cost-analysis', data);

        expect(kpis).toEqual([
          { label: 'Total Revenue', value: '$2500.75' },
          { label: 'Average Cost', value: '$125.50' },
          { label: 'Paid Revenue', value: '$2000.25' }
        ]);
      });

      it('should handle missing data with default values', () => {
        const data = {};

        const kpis = pdfFormatter.getKPIsForReportType('waste-generation', data);

        expect(kpis[0].value).toBe('0');
        expect(kpis[1].value).toBe('0');
        expect(kpis[2].value).toBe('0');
      });
    });

    describe('generateWasteGenerationTable', () => {
      it('should generate table HTML for waste generation data', () => {
        const reportData = {
          byArea: {
            'Area1': { count: 5, weight: 100.5 },
            'Area2': { count: 3, weight: 75.2 }
          },
          byWasteType: {
            'Plastic': { count: 4, weight: 80.3 },
            'Paper': { count: 4, weight: 95.4 }
          }
        };

        const result = pdfFormatter.generateWasteGenerationTable(reportData);

        expect(result).toContain('<table class="table">');
        expect(result).toContain('<th>Area</th>');
        expect(result).toContain('<th>Waste Type</th>');
        expect(result).toContain('Area1');
        expect(result).toContain('Area2');
        expect(result).toContain('Plastic');
        expect(result).toContain('Paper');
      });

      it('should handle missing data gracefully', () => {
        const reportData = {};

        const result = pdfFormatter.generateWasteGenerationTable(reportData);

        expect(result).toBe('');
      });
    });

    describe('generateCollectionEfficiencyTable', () => {
      it('should generate table HTML for collection efficiency data', () => {
        const reportData = {
          statusBreakdown: {
            'Completed': 8,
            'Scheduled': 2,
            'Cancelled': 1
          },
          scheduledPickups: 10
        };

        const result = pdfFormatter.generateCollectionEfficiencyTable(reportData);

        expect(result).toContain('<table class="table">');
        expect(result).toContain('<th>Status</th>');
        expect(result).toContain('Completed');
        expect(result).toContain('Scheduled');
        expect(result).toContain('Cancelled');
      });

      it('should handle missing data gracefully', () => {
        const reportData = {};

        const result = pdfFormatter.generateCollectionEfficiencyTable(reportData);

        expect(result).toBe('');
      });
    });

    describe('generateCostAnalysisTable', () => {
      it('should generate table HTML for cost analysis data', () => {
        const reportData = {
          paymentStatus: {
            'Paid': 5,
            'Unpaid': 3,
            'Pending Verification': 2
          },
          collections: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}], // 10 collections
          totalRevenue: 1000
        };

        const result = pdfFormatter.generateCostAnalysisTable(reportData);

        expect(result).toContain('<table class="table">');
        expect(result).toContain('<th>Payment Status</th>');
        expect(result).toContain('Paid');
        expect(result).toContain('Unpaid');
        expect(result).toContain('Pending Verification');
      });

      it('should handle missing data gracefully', () => {
        const reportData = {};

        const result = pdfFormatter.generateCostAnalysisTable(reportData);

        expect(result).toBe('');
      });
    });
  });
});
