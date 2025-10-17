import { ReportDataProcessor } from '../../services/ReportDataProcessor';

describe('ReportDataProcessor', () => {
  let processor;

  beforeEach(() => {
    processor = new ReportDataProcessor();
  });

  describe('filterByDateRange', () => {
    it('should return all data when no date range provided', () => {
      const data = [
        { id: 1, createdAt: new Date('2024-01-01') },
        { id: 2, createdAt: new Date('2024-01-15') }
      ];
      
      const result = processor.filterByDateRange(data, null);
      expect(result).toEqual(data);
    });

    it('should filter data by date range', () => {
      const data = [
        { id: 1, createdAt: new Date('2024-01-01') },
        { id: 2, createdAt: new Date('2024-01-15') },
        { id: 3, createdAt: new Date('2024-02-01') }
      ];
      
      const dateRange = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };
      
      const result = processor.filterByDateRange(data, dateRange);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should handle Firebase timestamp objects', () => {
      const data = [
        { id: 1, createdAt: { toDate: () => new Date('2024-01-01') } },
        { id: 2, createdAt: { toDate: () => new Date('2024-01-15') } }
      ];
      
      const dateRange = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };
      
      const result = processor.filterByDateRange(data, dateRange);
      expect(result).toHaveLength(2);
    });
  });

  describe('processWasteGenerationData', () => {
    it('should calculate waste generation metrics correctly', () => {
      const collections = [
        { totalWeight: '10.5', address: '123 Main St, Area1' },
        { totalWeight: '15.2', address: '456 Oak St, Area2' },
        { totalWeight: '8.7', address: '789 Pine St, Area1' }
      ];
      
      const schedules = [];
      const filters = { dateRange: null };
      
      const result = processor.processWasteGenerationData(collections, schedules, filters);
      
      expect(result.totalWeight).toBe(34.4);
      expect(result.totalCollections).toBe(3);
      expect(result.averageWeight).toBeCloseTo(11.47, 1);
    });

    it('should group collections by area', () => {
      const collections = [
        { totalWeight: '10.5', address: '123 Main St, Area1' },
        { totalWeight: '15.2', address: '456 Oak St, Area2' },
        { totalWeight: '8.7', address: '789 Pine St, Area1' }
      ];
      
      const schedules = [];
      const filters = { dateRange: null };
      
      const result = processor.processWasteGenerationData(collections, schedules, filters);
      
      expect(result.byArea.Area1.count).toBe(2);
      expect(result.byArea.Area1.weight).toBe(19.2);
      expect(result.byArea.Area2.count).toBe(1);
      expect(result.byArea.Area2.weight).toBe(15.2);
    });
  });

  describe('processCollectionEfficiencyData', () => {
    it('should calculate efficiency metrics correctly', () => {
      const collections = [
        { id: 1, status: 'Completed' },
        { id: 2, status: 'Completed' }
      ];
      
      const schedules = [
        { id: 1, status: 'Scheduled' },
        { id: 2, status: 'Scheduled' },
        { id: 3, status: 'Scheduled' }
      ];
      
      const filters = { dateRange: null };
      
      const result = processor.processCollectionEfficiencyData(collections, schedules, filters);
      
      expect(result.scheduledPickups).toBe(3);
      expect(result.completedPickups).toBe(2);
      expect(result.efficiencyRate).toBeCloseTo(66.67, 1);
    });
  });

  describe('processCostAnalysisData', () => {
    it('should calculate cost metrics correctly', () => {
      const collections = [
        { totalCost: '100.50', status: 'Paid' },
        { totalCost: '200.75', status: 'Unpaid' },
        { totalCost: '150.25', status: 'Paid' }
      ];
      
      const filters = { dateRange: null };
      
      const result = processor.processCostAnalysisData(collections, filters);
      
      expect(result.totalRevenue).toBe(451.5);
      expect(result.averageCost).toBeCloseTo(150.5, 1);
      expect(result.paidRevenue).toBe(250.75);
    });
  });

  describe('groupByArea', () => {
    it('should group collections by area correctly', () => {
      const collections = [
        { totalWeight: '10.5', address: '123 Main St, Area1' },
        { totalWeight: '15.2', address: '456 Oak St, Area2' },
        { totalWeight: '8.7', address: '789 Pine St, Area1' }
      ];
      
      const result = processor.groupByArea(collections);
      
      expect(result.Area1.count).toBe(2);
      expect(result.Area1.weight).toBe(19.2);
      expect(result.Area2.count).toBe(1);
      expect(result.Area2.weight).toBe(15.2);
    });

    it('should handle missing address with Unknown area', () => {
      const collections = [
        { totalWeight: '10.5' },
        { totalWeight: '15.2', address: '456 Oak St, Area2' }
      ];
      
      const result = processor.groupByArea(collections);
      
      expect(result.Unknown.count).toBe(1);
      expect(result.Unknown.weight).toBe(10.5);
      expect(result.Area2.count).toBe(1);
    });
  });

  describe('groupByWasteType', () => {
    it('should group collections by waste type', () => {
      const collections = [
        { totalWeight: '10.5', wasteType: 'Plastic' },
        { totalWeight: '15.2', wasteType: 'Paper' },
        { totalWeight: '8.7', wasteType: 'Plastic' }
      ];
      
      const result = processor.groupByWasteType(collections);
      
      expect(result.Plastic.count).toBe(2);
      expect(result.Plastic.weight).toBe(19.2);
      expect(result.Paper.count).toBe(1);
      expect(result.Paper.weight).toBe(15.2);
    });

    it('should use Mixed as default waste type', () => {
      const collections = [
        { totalWeight: '10.5' },
        { totalWeight: '15.2', wasteType: 'Paper' }
      ];
      
      const result = processor.groupByWasteType(collections);
      
      expect(result.Mixed.count).toBe(1);
      expect(result.Mixed.weight).toBe(10.5);
      expect(result.Paper.count).toBe(1);
    });
  });

  describe('groupByPaymentStatus', () => {
    it('should group collections by payment status', () => {
      const collections = [
        { status: 'Paid' },
        { status: 'Unpaid' },
        { status: 'Paid' },
        { status: 'Pending Verification' }
      ];
      
      const result = processor.groupByPaymentStatus(collections);
      
      expect(result.Paid).toBe(2);
      expect(result.Unpaid).toBe(1);
      expect(result['Pending Verification']).toBe(1);
    });
  });
});
