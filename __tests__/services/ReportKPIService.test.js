import { ReportKPIService } from '../../services/ReportKPIService';

describe('ReportKPIService', () => {
  let kpiService;

  beforeEach(() => {
    kpiService = new ReportKPIService();
  });

  describe('getKPIsForReportType', () => {
    it('should return waste generation KPIs for waste-generation type', () => {
      const data = {
        totalWeight: 150.5,
        totalCollections: 25,
        averageWeight: 6.02
      };

      const result = kpiService.getKPIsForReportType('waste-generation', data);

      expect(result).toHaveLength(3);
      expect(result[0].label).toBe('Total Weight (kg)');
      expect(result[0].value).toBe('150.5');
      expect(result[0].icon).toBe('BarChart3');
      expect(result[0].color).toBe('#10B981');
    });

    it('should return collection efficiency KPIs for collection-efficiency type', () => {
      const data = {
        efficiencyRate: 85.5,
        scheduledPickups: 100,
        completedPickups: 85
      };

      const result = kpiService.getKPIsForReportType('collection-efficiency', data);

      expect(result).toHaveLength(3);
      expect(result[0].label).toBe('Efficiency Rate');
      expect(result[0].value).toBe('85.5%');
      expect(result[0].icon).toBe('TrendingUp');
      expect(result[0].color).toBe('#10B981');
    });

    it('should return cost analysis KPIs for cost-analysis type', () => {
      const data = {
        totalRevenue: 2500.75,
        averageCost: 125.50,
        paidRevenue: 2000.25
      };

      const result = kpiService.getKPIsForReportType('cost-analysis', data);

      expect(result).toHaveLength(3);
      expect(result[0].label).toBe('Total Revenue');
      expect(result[0].value).toBe('$2500.75');
      expect(result[0].icon).toBe('DollarSign');
      expect(result[0].color).toBe('#10B981');
    });

    it('should return empty array for unsupported report type', () => {
      const data = { someData: 'test' };
      const result = kpiService.getKPIsForReportType('unsupported-type', data);
      expect(result).toEqual([]);
    });
  });

  describe('getWasteGenerationKPIs', () => {
    it('should generate correct waste generation KPIs', () => {
      const data = {
        totalWeight: 300.75,
        totalCollections: 50,
        averageWeight: 6.015
      };

      const result = kpiService.getWasteGenerationKPIs(data);

      expect(result).toEqual([
        {
          label: 'Total Weight (kg)',
          value: '300.8',
          icon: 'BarChart3',
          color: '#10B981',
          trend: 'up'
        },
        {
          label: 'Total Collections',
          value: 50,
          icon: 'Calendar',
          color: '#3B82F6',
          trend: 'up'
        },
        {
          label: 'Average Weight (kg)',
          value: '6.0',
          icon: 'TrendingUp',
          color: '#F59E0B',
          trend: 'up'
        }
      ]);
    });

    it('should handle missing data with default values', () => {
      const data = {};

      const result = kpiService.getWasteGenerationKPIs(data);

      expect(result[0].value).toBe('0.0');
      expect(result[1].value).toBe(0);
      expect(result[2].value).toBe('0.0');
    });
  });

  describe('getCollectionEfficiencyKPIs', () => {
    it('should generate correct collection efficiency KPIs', () => {
      const data = {
        efficiencyRate: 92.5,
        scheduledPickups: 80,
        completedPickups: 74
      };

      const result = kpiService.getCollectionEfficiencyKPIs(data);

      expect(result).toEqual([
        {
          label: 'Efficiency Rate',
          value: '92.5%',
          icon: 'TrendingUp',
          color: '#10B981',
          trend: 'up'
        },
        {
          label: 'Scheduled Pickups',
          value: 80,
          icon: 'Calendar',
          color: '#3B82F6',
          trend: 'up'
        },
        {
          label: 'Completed Pickups',
          value: 74,
          icon: 'BarChart3',
          color: '#F59E0B',
          trend: 'up'
        }
      ]);
    });

    it('should handle missing data with default values', () => {
      const data = {};

      const result = kpiService.getCollectionEfficiencyKPIs(data);

      expect(result[0].value).toBe('0.0%');
      expect(result[1].value).toBe(0);
      expect(result[2].value).toBe(0);
    });
  });

  describe('getCostAnalysisKPIs', () => {
    it('should generate correct cost analysis KPIs', () => {
      const data = {
        totalRevenue: 5000.99,
        averageCost: 250.50,
        paidRevenue: 4000.75
      };

      const result = kpiService.getCostAnalysisKPIs(data);

      expect(result).toEqual([
        {
          label: 'Total Revenue',
          value: '$5000.99',
          icon: 'DollarSign',
          color: '#10B981',
          trend: 'up'
        },
        {
          label: 'Average Cost',
          value: '$250.50',
          icon: 'TrendingUp',
          color: '#3B82F6',
          trend: 'up'
        },
        {
          label: 'Paid Revenue',
          value: '$4000.75',
          icon: 'DollarSign',
          color: '#F59E0B',
          trend: 'up'
        }
      ]);
    });

    it('should handle missing data with default values', () => {
      const data = {};

      const result = kpiService.getCostAnalysisKPIs(data);

      expect(result[0].value).toBe('$0.00');
      expect(result[1].value).toBe('$0.00');
      expect(result[2].value).toBe('$0.00');
    });
  });

  describe('KPI formatting', () => {
    it('should format decimal values correctly', () => {
      const data = {
        totalWeight: 123.456789,
        averageWeight: 12.3456789
      };

      const result = kpiService.getWasteGenerationKPIs(data);

      expect(result[0].value).toBe('123.5');
      expect(result[2].value).toBe('12.3');
    });

    it('should format currency values correctly', () => {
      const data = {
        totalRevenue: 1234.567,
        averageCost: 12.345,
        paidRevenue: 987.654
      };

      const result = kpiService.getCostAnalysisKPIs(data);

      expect(result[0].value).toBe('$1234.57');
      expect(result[1].value).toBe('$12.35');
      expect(result[2].value).toBe('$987.65');
    });

    it('should format percentage values correctly', () => {
      const data = {
        efficiencyRate: 85.6789
      };

      const result = kpiService.getCollectionEfficiencyKPIs(data);

      expect(result[0].value).toBe('85.7%');
    });
  });
});
