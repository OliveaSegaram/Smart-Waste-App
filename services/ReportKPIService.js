/**
 * Service class responsible for generating KPIs for different report types
 * Follows Single Responsibility Principle - only handles KPI generation
 */
export class ReportKPIService {
  /**
   * Get KPIs for specific report type
   */
  getKPIsForReportType(type, data) {
    switch (type) {
      case 'waste-generation':
        return this.getWasteGenerationKPIs(data);
      case 'collection-efficiency':
        return this.getCollectionEfficiencyKPIs(data);
      case 'cost-analysis':
        return this.getCostAnalysisKPIs(data);
      default:
        return [];
    }
  }

  /**
   * Get waste generation KPIs
   */
  getWasteGenerationKPIs(data) {
    return [
      {
        label: 'Total Weight (kg)',
        value: (data.totalWeight || 0).toFixed(1),
        icon: 'BarChart3',
        color: '#10B981',
        trend: 'up'
      },
      {
        label: 'Total Collections',
        value: data.totalCollections || 0,
        icon: 'Calendar',
        color: '#3B82F6',
        trend: 'up'
      },
      {
        label: 'Average Weight (kg)',
        value: (data.averageWeight || 0).toFixed(1),
        icon: 'TrendingUp',
        color: '#F59E0B',
        trend: 'up'
      }
    ];
  }

  /**
   * Get collection efficiency KPIs
   */
  getCollectionEfficiencyKPIs(data) {
    return [
      {
        label: 'Efficiency Rate',
        value: `${(data.efficiencyRate || 0).toFixed(1)}%`,
        icon: 'TrendingUp',
        color: '#10B981',
        trend: 'up'
      },
      {
        label: 'Scheduled Pickups',
        value: data.scheduledPickups || 0,
        icon: 'Calendar',
        color: '#3B82F6',
        trend: 'up'
      },
      {
        label: 'Completed Pickups',
        value: data.completedPickups || 0,
        icon: 'BarChart3',
        color: '#F59E0B',
        trend: 'up'
      }
    ];
  }

  /**
   * Get cost analysis KPIs
   */
  getCostAnalysisKPIs(data) {
    return [
      {
        label: 'Total Revenue',
        value: `$${(data.totalRevenue || 0).toFixed(2)}`,
        icon: 'DollarSign',
        color: '#10B981',
        trend: 'up'
      },
      {
        label: 'Average Cost',
        value: `$${(data.averageCost || 0).toFixed(2)}`,
        icon: 'TrendingUp',
        color: '#3B82F6',
        trend: 'up'
      },
      {
        label: 'Paid Revenue',
        value: `$${(data.paidRevenue || 0).toFixed(2)}`,
        icon: 'DollarSign',
        color: '#F59E0B',
        trend: 'up'
      }
    ];
  }
}
