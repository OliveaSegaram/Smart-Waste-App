import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Share } from 'react-native';
import { PDFFormatter } from './ExportFormatters/PDFFormatter';
import { CSVFormatter } from './ExportFormatters/CSVFormatter';
import { TextFormatter } from './ExportFormatters/TextFormatter';

export class ReportExportService {
  constructor() {
    this.pdfFormatter = new PDFFormatter();
    this.csvFormatter = new CSVFormatter();
    this.textFormatter = new TextFormatter();
  }
  /**
   * Export report data as PDF
   * @param {Object} reportData - The report data to export
   * @param {string} reportType - Type of report (waste-generation, etc.)
   * @param {Object} filters - Applied filters
   * @param {string} title - Report title
   */
  async exportToPDF(reportData, reportType, filters, title) {
    try {
      const html = this.pdfFormatter.generateHTMLReport(reportData, reportType, filters, title);
      
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
        const shareContent = this.textFormatter.generateTextReport(reportData, reportType, filters, title);
        await Share.share({
          message: shareContent,
          title: `${title} - Report Data`,
        });
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      
      // Fallback to text sharing on error
      try {
        const shareContent = this.textFormatter.generateTextReport(reportData, reportType, filters, title);
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
  async exportToCSV(reportData, reportType, filters) {
    try {
      const csvContent = this.csvFormatter.generateCSVContent(reportData, reportType, filters);
      
      await Share.share({
        message: csvContent,
        title: 'Export Report Data (CSV)',
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export CSV');
    }
  }


}
