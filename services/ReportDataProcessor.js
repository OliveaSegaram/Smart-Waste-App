/**
 * Service class responsible for processing and transforming report data
 * Follows Single Responsibility Principle - only handles data processing
 */
export class ReportDataProcessor {
  /**
   * Filter data by date range
   */
  filterByDateRange(data, dateRange) {
    if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
      return data;
    }
    
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    return data.filter(item => {
      const itemDate = new Date(item.createdAt?.toDate?.() || item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  /**
   * Process waste generation data
   */
  processWasteGenerationData(collections, schedules, filters) {
    const filteredCollections = this.filterByDateRange(collections, filters.dateRange);
    const filteredSchedules = this.filterByDateRange(schedules, filters.dateRange);

    // Calculate metrics
    const totalWeight = filteredCollections.reduce((sum, col) => sum + parseFloat(col.totalWeight || 0), 0);
    const totalCollections = filteredCollections.length;
    const averageWeight = totalCollections > 0 ? totalWeight / totalCollections : 0;

    // Group by area
    const byArea = this.groupByArea(filteredCollections);

    // Group by waste type
    const byWasteType = this.groupByWasteType(filteredCollections);

    return {
      totalWeight: totalWeight || 0,
      totalCollections: totalCollections || 0,
      averageWeight: averageWeight || 0,
      byArea: byArea || {},
      byWasteType: byWasteType || {},
      collections: filteredCollections || [],
      schedules: filteredSchedules || []
    };
  }

  /**
   * Process collection efficiency data
   */
  processCollectionEfficiencyData(collections, schedules, filters) {
    const filteredCollections = this.filterByDateRange(collections, filters.dateRange);
    const filteredSchedules = this.filterByDateRange(schedules, filters.dateRange);

    // Calculate efficiency metrics
    const scheduledPickups = filteredSchedules.length;
    const completedPickups = filteredCollections.length;
    const efficiencyRate = scheduledPickups > 0 ? (completedPickups / scheduledPickups) * 100 : 0;

    // Group by status
    const statusBreakdown = this.groupByStatus(filteredSchedules, completedPickups);

    return {
      scheduledPickups: scheduledPickups || 0,
      completedPickups: completedPickups || 0,
      efficiencyRate: efficiencyRate || 0,
      statusBreakdown: statusBreakdown || {},
      collections: filteredCollections || [],
      schedules: filteredSchedules || []
    };
  }

  /**
   * Process cost analysis data
   */
  processCostAnalysisData(collections, filters) {
    const filteredCollections = this.filterByDateRange(collections, filters.dateRange);

    // Calculate financial metrics
    const totalRevenue = filteredCollections.reduce((sum, col) => sum + parseFloat(col.totalCost || 0), 0);
    const averageCost = filteredCollections.length > 0 ? totalRevenue / filteredCollections.length : 0;

    // Group by payment status
    const paymentStatus = this.groupByPaymentStatus(filteredCollections);

    const paidRevenue = filteredCollections
      .filter(col => col.status === 'Paid')
      .reduce((sum, col) => sum + parseFloat(col.totalCost || 0), 0);

    return {
      totalRevenue: totalRevenue || 0,
      averageCost: averageCost || 0,
      paidRevenue: paidRevenue || 0,
      paymentStatus: paymentStatus || {},
      collections: filteredCollections || []
    };
  }

  /**
   * Group collections by area
   */
  groupByArea(collections) {
    const byArea = {};
    collections.forEach(col => {
      const area = col.address?.split(',')[1]?.trim() || 'Unknown';
      if (!byArea[area]) byArea[area] = { count: 0, weight: 0 };
      byArea[area].count++;
      byArea[area].weight += parseFloat(col.totalWeight || 0);
    });
    return byArea;
  }

  /**
   * Group collections by waste type
   */
  groupByWasteType(collections) {
    const byWasteType = {};
    collections.forEach(col => {
      const wasteType = col.wasteType || 'Mixed';
      if (!byWasteType[wasteType]) byWasteType[wasteType] = { count: 0, weight: 0 };
      byWasteType[wasteType].count++;
      byWasteType[wasteType].weight += parseFloat(col.totalWeight || 0);
    });
    return byWasteType;
  }

  /**
   * Group schedules by status
   */
  groupByStatus(schedules, completedPickups) {
    return {
      'Completed': completedPickups,
      'Scheduled': schedules.filter(s => s.status === 'Scheduled').length,
      'Cancelled': schedules.filter(s => s.status === 'Cancelled').length,
      'In Progress': schedules.filter(s => s.status === 'In Progress').length
    };
  }

  /**
   * Group collections by payment status
   */
  groupByPaymentStatus(collections) {
    return {
      'Paid': collections.filter(col => col.status === 'Paid').length,
      'Unpaid': collections.filter(col => col.status === 'Unpaid').length,
      'Pending Verification': collections.filter(col => col.status === 'Pending Verification').length
    };
  }
}
