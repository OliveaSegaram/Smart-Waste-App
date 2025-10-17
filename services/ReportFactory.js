/**
 * Factory class for creating different types of reports
 * Follows Factory Pattern and Open/Closed Principle
 */
export class ReportFactory {
  constructor(dataService, dataProcessor) {
    this.dataService = dataService;
    this.dataProcessor = dataProcessor;
  }

  /**
   * Create report based on type
   */
  async createReport(reportType, filters) {
    switch (reportType) {
      case 'waste-generation':
        return this.createWasteGenerationReport(filters);
      case 'collection-efficiency':
        return this.createCollectionEfficiencyReport(filters);
      case 'cost-analysis':
        return this.createCostAnalysisReport(filters);
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }

  /**
   * Create waste generation report
   */
  async createWasteGenerationReport(filters) {
    const [collections, schedules] = await Promise.all([
      this.dataService.fetchCollections(),
      this.dataService.fetchSchedules()
    ]);

    return this.dataProcessor.processWasteGenerationData(collections, schedules, filters);
  }

  /**
   * Create collection efficiency report
   */
  async createCollectionEfficiencyReport(filters) {
    const [collections, schedules] = await Promise.all([
      this.dataService.fetchCollections(),
      this.dataService.fetchSchedules()
    ]);

    return this.dataProcessor.processCollectionEfficiencyData(collections, schedules, filters);
  }

  /**
   * Create cost analysis report
   */
  async createCostAnalysisReport(filters) {
    const collections = await this.dataService.fetchCollections();
    return this.dataProcessor.processCostAnalysisData(collections, filters);
  }
}
