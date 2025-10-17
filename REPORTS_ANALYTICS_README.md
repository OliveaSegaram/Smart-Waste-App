# Reports & Analytics Feature

## Overview

The Reports & Analytics feature allows administrators and municipal officers to generate comprehensive reports on system operations, including waste collection efficiency, recycling rates, cost analysis, and route performance directly from the Smart Waste App.

## Features Implemented

### 1. Reports Dashboard (`ReportsDashboard.js`)
- **System Overview Cards**: Displays key metrics at a glance
  - Total Collections
  - Total Revenue
  - Active Users
  - Scheduled Pickups

- **Report Type Selection**: Six different report types available:
  - **Waste Generation**: Total waste collected by area and time period
  - **Collection Efficiency**: Scheduled vs collected waste pickup performance
  - **Recycling Statistics**: Recyclable vs organic waste breakdown
  - **Cost Analysis**: Revenue, costs, and profitability metrics
  - **User Analytics**: User engagement and participation rates
  - **Route Performance**: Collection route efficiency and optimization

- **Filter Modal**: Advanced filtering options
  - Date range selection
  - Area filtering (All, Colombo, Kandy, Galle, Jaffna)
  - Waste type filtering (All, Organic, Recyclable, Electronic, Mixed)

### 2. Report Details (`ReportDetails.js`)
- **Dynamic Report Generation**: Fetches and processes data based on selected report type
- **KPI Cards**: Displays key performance indicators with trend indicators
- **Data Visualization**: Simple charts and graphs for data representation
- **Export Functionality**: PDF and CSV export options
- **Responsive Design**: Optimized for mobile viewing

### 3. Export Service (`ReportExportService.js`)
- **PDF Export**: Generates professional PDF reports with:
  - Report title and generation date
  - KPI summaries with visual cards
  - Detailed data tables
  - Professional HTML/CSS styling
  - Cross-platform sharing via expo-sharing
- **Text Export**: Generates formatted text reports for fallback sharing
- **CSV Export**: Exports raw data for further analysis
- **Share Integration**: Uses expo-print for PDF generation and expo-sharing for file sharing

## Technical Implementation

### Dependencies Used
The system uses the following libraries for PDF export functionality:
- **expo-print**: For generating PDF files from HTML content
- **expo-sharing**: For sharing PDF files across different platforms
- **React Native Share API**: For fallback text sharing when PDF sharing is not available

### Data Sources
The system integrates with existing Firestore collections:
- `garbageCollections`: Collection records, weights, costs, status
- `schedules`: Pickup schedules and status
- `users`: User information and types
- `userRewards`: Reward and participation data

### Key Functions

#### Data Fetching
- `fetchWasteGenerationData()`: Aggregates waste collection data by area and type
- `fetchCollectionEfficiencyData()`: Calculates pickup completion rates
- `fetchRecyclingStatsData()`: Categorizes waste by recyclability
- `fetchCostAnalysisData()`: Analyzes revenue and payment status
- `fetchUserAnalyticsData()`: Tracks user engagement metrics
- `fetchRoutePerformanceData()`: Evaluates collection route efficiency

#### Data Processing
- `filterByDateRange()`: Filters data based on selected date range
- `processChartData()`: Converts raw data into chart-friendly format
- `getKPIsForReportType()`: Generates relevant KPIs for each report type

#### Export Functions
- `exportToPDF()`: Generates and shares formatted text reports
- `exportToCSV()`: Exports data as CSV files
- `generateTextReport()`: Creates formatted text content for sharing
- `generateHTMLReport()`: Creates HTML template (for future PDF generation)

## Usage Guide

### For Administrators

1. **Access Reports**: Navigate to the "Reports" tab in the bottom navigation
2. **Select Report Type**: Choose from six available report types
3. **Apply Filters**: Set date range, area, and waste type filters
4. **Generate Report**: Tap "Generate Report" to view detailed analytics
5. **Export Data**: Use share/download buttons to export as formatted text or CSV

### Report Types Explained

#### Waste Generation Report
- **Purpose**: Track total waste collected across different areas and time periods
- **Key Metrics**: Total weight, collection count, average weight per collection
- **Visualizations**: Area-wise distribution, waste type breakdown

#### Collection Efficiency Report
- **Purpose**: Monitor pickup completion rates and identify bottlenecks
- **Key Metrics**: Efficiency rate, scheduled vs completed pickups
- **Visualizations**: Status breakdown pie chart

#### Recycling Statistics Report
- **Purpose**: Measure recycling performance and waste categorization
- **Key Metrics**: Recycling rate, category-wise waste distribution
- **Visualizations**: Waste category pie chart

#### Cost Analysis Report
- **Purpose**: Analyze revenue streams and payment collection efficiency
- **Key Metrics**: Total revenue, average cost, paid vs unpaid amounts
- **Visualizations**: Payment status breakdown

#### User Analytics Report
- **Purpose**: Track user engagement and participation rates
- **Key Metrics**: Total users, active users, participation rate
- **Visualizations**: User type distribution

#### Route Performance Report
- **Purpose**: Optimize collection routes and identify efficiency opportunities
- **Key Metrics**: Route efficiency, collection counts, cost per route
- **Visualizations**: Route performance bar chart

## Customization Options

### Adding New Report Types
1. Add new report type to `reportTypes` array in `ReportsDashboard.js`
2. Implement corresponding fetch function in `ReportDetails.js`
3. Add KPI generation logic in `getKPIsForReportType()`
4. Update export service with new data processing logic

### Modifying Filters
- Add new filter options in the filter modal
- Update `filterByDateRange()` function for custom filtering logic
- Modify data fetching functions to respect new filters

### Styling Customization
- Update color schemes in `getWasteTypeColor()`, `getStatusColor()`, etc.
- Modify chart colors and styles in the visualization components
- Customize PDF template styling in `ReportExportService.js`

## Performance Considerations

### Data Optimization
- Implement pagination for large datasets
- Add data caching for frequently accessed reports
- Use Firestore indexes for efficient querying

### Memory Management
- Clear large datasets when navigating away from reports
- Implement lazy loading for chart data
- Optimize image and chart rendering

## Security Features

### Data Access Control
- Reports are only accessible to authenticated admin users
- Data filtering respects user permissions
- Export files are generated securely without exposing sensitive data

### Input Validation
- Date range validation prevents invalid queries
- Filter validation ensures data integrity
- Error handling for malformed data

## Future Enhancements

### Planned Features
1. **Real-time Dashboards**: Live updating metrics
2. **Advanced Charts**: Interactive charts with drill-down capabilities
3. **Scheduled Reports**: Automated report generation and delivery
4. **Custom Dashboards**: User-configurable report layouts
5. **Data Export APIs**: RESTful APIs for external system integration

### Technical Improvements
1. **Chart Library Integration**: Replace simple charts with professional charting libraries
2. **Offline Support**: Cache reports for offline viewing
3. **Push Notifications**: Alert administrators of critical metrics
4. **Data Analytics**: Machine learning insights and predictions

## Troubleshooting

### Common Issues

#### Report Generation Fails
- Check Firestore connection and permissions
- Verify data exists for selected date range
- Ensure proper error handling in data fetching functions

#### Export Functionality Not Working
- Verify Expo Print and Sharing permissions
- Check device storage space
- Ensure proper file format generation

#### Performance Issues
- Implement data pagination for large datasets
- Add loading states for better user experience
- Optimize Firestore queries with proper indexing

### Error Messages
- "Failed to load report data": Check network connection and Firestore access
- "No data available for selected criteria": Adjust date range or filters
- "Failed to export PDF/CSV": Check device permissions and storage

## Support

For technical support or feature requests related to the Reports & Analytics feature, please refer to the main project documentation or contact the development team.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Compatibility**: React Native 0.81.4, Expo SDK 54
