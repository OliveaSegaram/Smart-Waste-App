import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { getDocs } from 'firebase/firestore';
import GarbageHistoryScreen from '../../app/(tabs)/screens/ManageAccount/GarbageHistoryScreen';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn()
}));

// Mock icons
jest.mock('lucide-react-native', () => ({
  Calendar: 'Calendar',
  Package: 'Package',
  TrendingUp: 'TrendingUp',
  Filter: 'Filter'
}));

describe('GarbageHistoryScreen', () => {
  
  // Sample mock data
  const mockGarbageRecords = [
    {
      id: '1',
      residentName: 'John Doe',
      residentAddress: '123 Main St',
      residentPhone: '555-0100',
      collectionDate: '2024-10-15',
      month: 'October 2024',
      organicWaste: '10',
      recyclableWaste: '5',
      otherWaste: '3',
      totalWeight: '18',
      totalCost: '25.50',
      status: 'Paid'
    },
    {
      id: '2',
      residentName: 'Jane Smith',
      residentAddress: '456 Oak Ave',
      residentPhone: '555-0200',
      collectionDate: '2024-10-16',
      month: 'October 2024',
      organicWaste: '8',
      recyclableWaste: '4',
      otherWaste: '2',
      totalWeight: '14',
      totalCost: '20.00',
      status: 'Unpaid'
    },
    {
      id: '3',
      residentName: 'Bob Wilson',
      residentAddress: '789 Pine Rd',
      residentPhone: '555-0300',
      collectionDate: '2024-09-20',
      month: 'September 2024',
      organicWaste: '12',
      recyclableWaste: '6',
      otherWaste: '4',
      totalWeight: '22',
      totalCost: '30.00',
      status: 'Paid'
    }
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock current date to October 2024
    jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('October 2024');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test 1: Component renders loading state initially
  test('should show loading indicator initially', () => {
    getDocs.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    const { getByText } = render(<GarbageHistoryScreen />);
    
    expect(getByText('Loading garbage history...')).toBeTruthy();
  });

  // Test 2: Component renders successfully with data
  test('should render garbage records after loading', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockGarbageRecords.forEach(record => {
          callback({ id: record.id, data: () => record });
        });
      }
    });

    const { getByText } = render(<GarbageHistoryScreen />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Jane Smith')).toBeTruthy();
      expect(getByText('Bob Wilson')).toBeTruthy();
    });
  });

  // Test 3: Statistics are calculated correctly
  test('should calculate this month statistics correctly', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockGarbageRecords.forEach(record => {
          callback({ id: record.id, data: () => record });
        });
      }
    });

    const { getByText } = render(<GarbageHistoryScreen />);

    await waitFor(() => {
      // This month has 2 collections (October 2024)
      expect(getByText('2')).toBeTruthy(); // Collections count
      expect(getByText('32.00 kg')).toBeTruthy(); // Total weight (18 + 14)
      expect(getByText('$45.50')).toBeTruthy(); // Total cost (25.50 + 20.00)
    });
  });

  // Test 4: All time statistics are calculated correctly
  test('should calculate all time statistics correctly', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockGarbageRecords.forEach(record => {
          callback({ id: record.id, data: () => record });
        });
      }
    });

    const { getByText } = render(<GarbageHistoryScreen />);

    await waitFor(() => {
      expect(getByText('3')).toBeTruthy(); // Total collections
      expect(getByText('54.00 kg')).toBeTruthy(); // Total weight (18 + 14 + 22)
      expect(getByText('$75.50')).toBeTruthy(); // Total cost (25.50 + 20.00 + 30.00)
    });
  });

  // Test 5: Filter by month works correctly
  test('should filter records by month when filter is selected', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockGarbageRecords.forEach(record => {
          callback({ id: record.id, data: () => record });
        });
      }
    });

    const { getByText, queryByText } = render(<GarbageHistoryScreen />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    // Click on September 2024 filter
    const septemberFilter = getByText('September 2024');
    fireEvent.press(septemberFilter);

    await waitFor(() => {
      expect(getByText('Bob Wilson')).toBeTruthy();
      expect(queryByText('John Doe')).toBeNull(); // Should not show October records
      expect(queryByText('Jane Smith')).toBeNull();
    });
  });

  // Test 6: Shows "All" records by default
  test('should show all records when "All" filter is selected', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockGarbageRecords.forEach(record => {
          callback({ id: record.id, data: () => record });
        });
      }
    });

    const { getByText } = render(<GarbageHistoryScreen />);

    await waitFor(() => {
      expect(getByText('All Records (3)')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Jane Smith')).toBeTruthy();
      expect(getByText('Bob Wilson')).toBeTruthy();
    });
  });

  // Test 7: Shows empty state when no records
  test('should show empty state when no records are available', async () => {
    getDocs.mockResolvedValue({
      forEach: () => {} // Empty result
    });

    const { getByText } = render(<GarbageHistoryScreen />);

    await waitFor(() => {
      expect(getByText('No records found')).toBeTruthy();
    });
  });

  // Test 8: Displays correct status badges
  test('should display correct status badges for paid and unpaid', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockGarbageRecords.forEach(record => {
          callback({ id: record.id, data: () => record });
        });
      }
    });

    const { getAllByText } = render(<GarbageHistoryScreen />);

    await waitFor(() => {
      const paidBadges = getAllByText('Paid');
      const unpaidBadges = getAllByText('Unpaid');
      
      expect(paidBadges.length).toBe(2); // John and Bob are paid
      expect(unpaidBadges.length).toBe(1); // Jane is unpaid
    });
  });

  // Test 9: Handles Firebase errors gracefully
  test('should handle Firebase errors without crashing', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    getDocs.mockRejectedValue(new Error('Firebase error'));

    const { getByText } = render(<GarbageHistoryScreen />);

    await waitFor(() => {
      // Should still render the header even with error
      expect(getByText('Garbage Collection History')).toBeTruthy();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching records:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  // Test 10: Displays correct waste type details
  test('should display waste types correctly in record cards', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockGarbageRecords.forEach(record => {
          callback({ id: record.id, data: () => record });
        });
      }
    });

    const { getByText } = render(<GarbageHistoryScreen />);

    await waitFor(() => {
      expect(getByText('10 kg')).toBeTruthy(); // John's organic waste
      expect(getByText('5 kg')).toBeTruthy(); // John's recyclable
      expect(getByText('3 kg')).toBeTruthy(); // John's other waste
    });
  });
});